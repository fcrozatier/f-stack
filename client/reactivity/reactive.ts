export type AnyConstructor = new (...args: any[]) => any;

export type ReactiveEventType = "create" | "update" | "delete" | "apply";
export type ReactiveEvent =
  | {
    type: "create";
    path: string | symbol;
    newValue: any;
  }
  | { type: "update"; path: string | symbol; newValue: any; oldValue?: any }
  | { type: "delete"; path: string | symbol; oldValue: any }
  | { type: "apply"; path: string | symbol; args: any[] };

export type ReactiveEventCallback = (event: ReactiveEvent) => void;

export class Scheduler {
  #callback: () => void;
  // idempotent insertion structure collapsing events
  #pending: Map<
    Record<PropertyKey, any>,
    Map<ReactiveEventCallback, ReactiveEvent[]>
  > = new Map();

  constructor(callback: () => void) {
    this.#callback = callback;
  }

  getPending() {
    const pending = this.#pending;
    this.#pending = new Map();
    return pending;
  }

  flushSync() {
    this.#callback();
  }

  schedule(
    proxy: Record<PropertyKey, any>,
    callback: ReactiveEventCallback,
    event: ReactiveEvent,
  ) {
    // composites make this better
    const proxyLevel = this.#pending.get(proxy);
    if (proxyLevel) {
      const callbackLevel = proxyLevel.get(callback);
      if (!callbackLevel) {
        proxyLevel.set(callback, [event]);
      } else {
        const index = callbackLevel?.findIndex((e) =>
          e.type === event.type && e.path === event.path
        );
        // collapsing:
        // only the first enqueued event contains the correct old value in general since derived values are cleared afterwards
        // the correct new value is read when dequeuing
        // we don't collapse "apply" events
        if (index === -1) {
          callbackLevel?.push(event);
        } else if (event.type === "apply") {
          callbackLevel?.push(event);
        }
      }
    } else {
      this.#pending.set(proxy, new Map([[callback, [event]]]));
    }

    this.#callback();
  }
}

let pending = false;

const scheduler = new Scheduler(() => {
  if (!pending) {
    pending = true;
    queueMicrotask(flushSync);
  }
});

export const flushSync = () => {
  pending = false;

  // topological dequeuing
  const scheduled = [...scheduler.getPending().entries()];
  scheduled.sort(([p1], [p2]) => get(p1, ns.HAS_PARENT)(p2) ? -1 : 1);

  for (const [proxy, map] of scheduled) {
    for (const [callback, events] of map?.entries()) {
      for (const e of events) {
        if (
          (e.type === "create" || e.type === "update") &&
          typeof e.path === "string"
        ) {
          // get the latest value and recache the derived values
          e.newValue = get(proxy, ns.READ_PATH)(e.path);
        }
        callback(e);
      }
    }
  }
};

const ns = {
  ADD_LISTENER: Symbol.for("add listener"),
  ADD_PARENT: Symbol.for("add parent"),
  HAS_PARENT: Symbol.for("has parent"),
  IS_REACTIVE: Symbol.for("is reactive"),
  NOTIFY: Symbol.for("notify"),
  READ_PATH: Symbol.for("read path"),
  TARGET: Symbol.for("target"),
};

type Root = {
  parent: Record<PropertyKey, any>;
  rootPath: string;
  isDerived: boolean;
  deps?: Set<string> | undefined;
};

let root: Root | undefined;

export const reactive = <T extends object>(object: T) => {
  if (isReactive(object)) return object;

  const roots: Map<
    Record<PropertyKey, any>,
    Map<string, Omit<Root, "parent">>
  > = new Map();

  const ownProperties = new Map<string | symbol, PropertyDescriptor>();
  const graph = new WeakMap();
  const callbacks: ReactiveEventCallback[] = [];
  const derived: Map<string, any> = new Map();

  const stringifyKey = (key: string | symbol) => {
    return typeof key === "symbol" ? key.description ?? String(key) : key;
  };

  const notify = (e: ReactiveEvent) => {
    let { type, path } = e;
    if (
      (type === "update" || type === "delete" || type === "apply") &&
      typeof path === "string" && derived.has(path)
    ) {
      if (e.type === "apply") {
        // @ts-ignore a derived apply becomes an update
        delete e.args;
        type = "update";
      }
      // @ts-ignore a derived apply becomes an update
      e.oldValue = derived.get(path);
      // invalidate the cache
      derived.delete(path);
    }

    for (const callback of callbacks) {
      // @ts-ignore we're good
      scheduler.schedule(proxy, callback, { ...e, type });
    }

    // topological scheduling
    const parents = [...roots.entries()];
    parents.sort(([p1], [p2]) => get(p1, ns.HAS_PARENT)(p2) ? -1 : 1);

    for (const [parent, map] of parents) {
      for (const [rootPath, { isDerived, deps }] of map.entries()) {
        const reroute = isDerived ? rootPath : rootPath + stringifyKey(path);

        if (
          !isDerived ||
          isDerived && typeof path === "string" && deps?.has(path)
        ) {
          get(parent, ns.NOTIFY)({ ...e, type, path: reroute });
        }
      }
    }
  };

  const readPath = (path: string) => {
    return path.split(".").slice(1).reduce(
      (acc, curr) => {
        return acc instanceof Map ? acc.get(curr) : acc[curr];
      },
      proxy as Record<string, any>,
    );
  };

  const hasParent = (p: Record<PropertyKey, any>): boolean => {
    for (const [root] of roots.entries()) {
      if (root === p || get(root, ns.HAS_PARENT)(p)) return true;
    }
    return false;
  };

  const addListener = (callback: ReactiveEventCallback) => {
    callbacks.push(callback);
  };

  const addParent = (
    options: Omit<Root, "deps"> & { dep?: string[] | string | undefined },
  ) => {
    const { parent, rootPath, isDerived, dep } = options;
    const dependencies = Array.isArray(dep) ? dep : (dep ? [dep] : []);

    // idempotent inserts: only one entry for a given (parent, path) pair
    const parentEntry = roots.get(parent);
    if (parentEntry) {
      const pathEntry = parentEntry.get(rootPath);
      if (pathEntry && dep) {
        if (pathEntry.deps) {
          for (const d of dependencies) {
            pathEntry.deps.add(d);
          }
        } else {
          pathEntry.deps = new Set(dependencies);
        }
      } else {
        parentEntry.set(rootPath, {
          rootPath,
          isDerived,
          deps: new Set(dependencies),
        });
      }
    } else {
      roots.set(
        parent,
        new Map([[rootPath, {
          rootPath,
          isDerived,
          deps: new Set(dependencies),
        }]]),
      );
    }
  };

  const proxy = new Proxy(object, {
    apply(target, thisArg, argArray) {
      notify({ type: "apply", path: "", args: argArray });
      return Reflect.apply(target, thisArg, argArray);
    },
    get(target, property, receiver) {
      const path = "." + stringifyKey(property);
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);

      if (root && root.parent !== proxy) {
        // @ts-ignore all non-null objects have this on the prototype
        const constructor = target.constructor;
        if (mutationMethods.has(constructor)) {
          addParent({ ...root, dep: mutationMethods.get(constructor) });
        } else {
          addParent({ ...root, dep: path });
        }
      }

      if (property === Symbol.iterator) {
        // @ts-ignore is object iterable
        const iterator = object?.[Symbol.iterator]?.();
        if (
          typeof iterator === "object" &&
          typeof iterator?.["next"] === "function"
        ) {
          // @ts-ignore object is iterable
          const entries = object.entries();

          return () => ({
            next() {
              const { done, value: item } = entries.next();

              if (done || !item || !Array.isArray(item)) {
                return { done: true };
              }

              let [key, value] = item;

              if (typeof value === "object") {
                let proxiedValue = graph.get(value);

                if (!proxiedValue) {
                  proxiedValue = reactive(value);

                  (get(proxiedValue, ns.ADD_PARENT) as typeof addParent)({
                    parent: proxy,
                    rootPath: "." + key,
                    isDerived: false,
                  });

                  graph.set(value, proxiedValue);
                }
                value = proxiedValue;
              } else if (typeof value === "function") {
                let proxiedMethod = graph.get(value);

                if (!proxiedMethod) {
                  // @ts-ignore value is a function
                  const bound = value.bind(object);
                  proxiedMethod = reactive(bound);

                  (get(proxiedMethod, ns.ADD_PARENT) as typeof addParent)({
                    parent: proxy,
                    rootPath: "." + key,
                    isDerived: false,
                  });

                  Object.defineProperty(proxiedMethod, ns.TARGET, {
                    value,
                    configurable: true,
                  });

                  graph.set(value, proxiedMethod);
                }
                value = proxiedMethod;
              }

              return {
                done,
                value: (object as any) instanceof Map ? [key, value] : value,
              };
            },
            return(value: any) {
              return { done: true, value };
            },
            throw(value: any) {
              return iterator.throw(value);
            },
          });
        }
      }

      // if it's a derived value, check if it's cached first
      if (descriptor?.get && derived.has(path)) {
        return derived.get(path);
      } else {
        try {
          var prevParent = root;
          root = {
            parent: proxy,
            rootPath: path,
            isDerived: !!descriptor?.get,
          };
          var value = Reflect.get(target, property, receiver);
        } catch (e) {
          // Some objects have exotic properties like Map.size
          if (e instanceof TypeError) {
            value = target[property];
          } else {
            throw e;
          }
        } finally {
          root = prevParent;
        }
      }

      // get invariants
      if (
        descriptor?.configurable === false &&
        descriptor?.writable === false
      ) return value;
      if (
        descriptor?.configurable === false &&
        descriptor?.get === undefined
      ) {
        // exception: the length property of Arrays
        if (Array.isArray(target) && property === "length") {
          return value;
        }
        return undefined;
      }

      if (value !== null && typeof value === "object") {
        let proxiedValue = graph.get(value);
        if (proxiedValue) return proxiedValue;

        // avoids double-proxying
        proxiedValue = reactive(value);

        // adopt
        (get(proxiedValue, ns.ADD_PARENT) as typeof addParent)({
          parent: proxy,
          rootPath: path,
          isDerived: false,
        });

        graph.set(value, proxiedValue);

        return proxiedValue;
      }

      if (typeof value === "function") {
        let proxiedMethod = graph.get(value);
        if (proxiedMethod) return proxiedMethod;

        // @ts-ignore value is a function
        const bound = value.bind(object);
        proxiedMethod = reactive(bound);

        (get(proxiedMethod, ns.ADD_PARENT) as typeof addParent)({
          parent: proxy,
          rootPath: path,
          isDerived: false,
        });

        Object.defineProperty(proxiedMethod, ns.TARGET, {
          value,
          configurable: true,
        });

        graph.set(value, proxiedMethod);

        return proxiedMethod;
      }

      if (descriptor?.get) {
        derived.set(path, value);
      }

      return value;
    },
    set(target, property, newValue, receiver) {
      const oldValue = proxy[property];

      // set invariants
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (
        descriptor?.configurable === false &&
        descriptor?.writable === false &&
        oldValue !== newValue
      ) return false;

      if (
        descriptor?.configurable === false &&
        descriptor?.set === undefined &&
        // exception: the `length` property of arrays can actually be set
        !(Array.isArray(target) && property === "length")
      ) return false;

      const path = "." + stringifyKey(property);
      if (property in target) {
        // optional fancy equality check here
        if (newValue !== oldValue) {
          Reflect.set(target, property, newValue, receiver);
          notify({ type: "update", path, newValue, oldValue });
        }
      } else {
        Reflect.set(target, property, newValue, receiver);
        notify({ type: "create", path, newValue });
      }

      return true;
    },
    deleteProperty(target, property) {
      // delete invariants
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (descriptor?.configurable === false) return false;
      if (
        !Reflect.isExtensible(target) &&
        !!descriptor
      ) return false;

      const path = "." + stringifyKey(property);

      if (property in target) {
        const oldValue = proxy[property];
        notify({ type: "delete", path, oldValue });
      }

      derived.delete(path);

      return Reflect.deleteProperty(target, property);
    },
    defineProperty(target, property, descriptor) {
      if (
        typeof property === "symbol" &&
        Object.values(ns).includes(property)
      ) {
        // don't pollute the original object with the proxy properties
        ownProperties.set(property, descriptor);
      } else {
        Reflect.defineProperty(target, property, descriptor);
      }

      return true;
    },
    has(target, property) {
      if (
        typeof property === "symbol" && Object.values(ns).includes(property)
      ) {
        return ownProperties.has(property);
      }
      return Reflect.has(target, property);
    },
    getOwnPropertyDescriptor(target, property) {
      if (
        typeof property === "symbol" && Object.values(ns).includes(property)
      ) {
        return ownProperties.get(property);
      }
      return Reflect.getOwnPropertyDescriptor(target, property);
    },
  });

  if (!(ns.ADD_LISTENER in proxy)) {
    Object.defineProperty(proxy, ns.ADD_LISTENER, {
      value: addListener,
      configurable: true,
    });
  }

  if (!(ns.ADD_PARENT in proxy)) {
    Object.defineProperty(proxy, ns.ADD_PARENT, {
      value: addParent,
      configurable: true,
    });
  }

  if (!(ns.HAS_PARENT in proxy)) {
    Object.defineProperty(proxy, ns.HAS_PARENT, {
      value: hasParent,
      configurable: true,
    });
  }

  if (!(ns.NOTIFY in proxy)) {
    Object.defineProperty(proxy, ns.NOTIFY, {
      value: notify,
      configurable: true,
    });
  }

  if (!(ns.READ_PATH in proxy)) {
    Object.defineProperty(proxy, ns.READ_PATH, {
      value: readPath,
      configurable: true,
    });
  }

  if (!(ns.IS_REACTIVE in proxy)) {
    Object.defineProperty(proxy, ns.IS_REACTIVE, {
      value: true,
      configurable: true,
    });
  }

  if (!(ns.TARGET in proxy)) {
    Object.defineProperty(proxy, ns.TARGET, {
      value: object,
      configurable: true,
    });
  }

  return proxy;
};

const readMethods = new Map([[
  Array,
  [
    ".at",
    ".entries",
    ".every",
    ".filter",
    ".find",
    ".findIndex",
    ".findLast",
    ".findLastIndex",
    ".flat",
    ".flatMap",
    ".forEach",
    ".includes",
    ".indexOf",
    ".join",
    ".keys",
    ".lastIndexOf",
    ".map",
    ".reduce",
    ".reduceRight",
    ".slice",
    ".some",
    ".toLocalString",
    ".toReversed",
    ".toSorted",
    ".toSpliced",
    ".toString",
    ".values",
    ".with",
  ],
]]);

const mutationMethods = new Map<AnyConstructor, string[]>([
  [Array, [
    ".concat",
    ".copyWithin",
    ".fill",
    ".pop",
    ".push",
    ".reverse",
    ".shift",
    ".sort",
    ".splice",
    ".unshift",
  ]],
  [Map, [
    ".clear",
    ".delete",
    ".set",
  ]],
]);

// we grab the proxy's virtual properties by [[GetOwnProperty]] semantics instead of [[Get]] to avoid having to add logic to the main get trap that would have to be executed for every property access of the target
const get = (proxy: Record<string, any>, symbol: symbol) => {
  return Object.getOwnPropertyDescriptor(proxy, symbol)?.value;
};

export const equals = (a: unknown, b: unknown): boolean => {
  return target(a) === target(b);
};

export const target = (p: unknown) => {
  return isReactive(p) ? get(p, ns.TARGET) : p;
};

export const isReactive = (
  value: unknown,
): value is Record<PropertyKey, any> => {
  return (value !== null && typeof value === "object" &&
    ns.IS_REACTIVE in value) ||
    (typeof value === "function" && ns.IS_REACTIVE in value);
};

export const isLeafValue = (data: unknown): data is { value: any } => {
  return (data !== null && typeof data === "object" &&
    ns.IS_REACTIVE in data && "value" in data);
};

/**
 * Adds a listener to a reactive graph node
 *
 * Does nothing if the node is not reactive
 */
export const addListener = <T extends Record<PropertyKey, any>>(
  node: T,
  callback: ReactiveEventCallback,
) => {
  if (isReactive(node)) {
    get(node, ns.ADD_LISTENER)?.(callback);
  }
};
