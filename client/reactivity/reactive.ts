import { assertExists } from "../assert.ts";

export type AnyConstructor = new (...args: any[]) => any;

export type ReactiveEventType =
  | "create"
  | "update"
  | "delete"
  | "apply"
  | "relabel";

export type ReactiveEvent =
  | {
    type: "create";
    path: string | symbol;
    newValue: any;
    // A writable derived set manually can have an old value
    oldValue?: any;
  }
  | { type: "update"; path: string | symbol; newValue: any; oldValue?: any }
  | { type: "delete"; path: string | symbol; oldValue: any }
  | { type: "apply"; path: string | symbol; args: any[] }
  | { type: "relabel"; oldPath: string; newPath: string | null };

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
        const index = callbackLevel?.findIndex((e) => {
          if (e.type !== event.type) return false;

          if (e.type === "relabel" && event.type === "relabel") {
            return e.oldPath === event.oldPath;
          }

          if (e.type !== "relabel" && event.type !== "relabel") {
            return e.path === event.path;
          }
        });

        // collapsing:
        // only the first enqueued event contains the correct old value in all generality since derived values are cleared afterwards
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
  scheduled.sort(([p1], [p2]) => getOwn(p1, ns.HAS_PARENT)(p2) ? -1 : 1);

  for (const [proxy, map] of scheduled) {
    for (const [callback, events] of map?.entries()) {
      for (const e of events) {
        if (
          (e.type === "create" || e.type === "update") &&
          typeof e.path === "string"
        ) {
          // get the latest value and recache the derived values
          e.newValue = getOwn(proxy, ns.READ_PATH)(e.path);
          callback(e);
        } else if (e.type === "relabel") {
          e.newPath = getOwn(proxy, ns.UPDATE_LABEL)(
            e.oldPath.split(".").slice(1),
          );

          // a relabelling happened
          if (e.newPath !== null) {
            callback(e);
          }
        } else {
          callback(e);
        }
      }
    }
  }
};

const ns = {
  ADD_LISTENER: Symbol.for("add listener"),
  ADD_PARENT: Symbol.for("add parent"),
  REMOVE_PARENT: Symbol.for("remove parent"),
  UPDATE_PARENT: Symbol.for("update parent"),
  HAS_PARENT: Symbol.for("has parent"),
  IS_REACTIVE: Symbol.for("is reactive"),
  NOTIFY: Symbol.for("notify"),
  READ_PATH: Symbol.for("read path"),
  UPDATE_LABEL: Symbol.for("update label"),
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

  const proxyOwnProperties = new Map<string | symbol, PropertyDescriptor>();
  const graph = new WeakMap();
  const derived: Map<string, any> = new Map();
  const callbacks: ReactiveEventCallback[] = [];
  const dynamicLabels = new Map<string, any>();

  const stringifyKey = (key: string | symbol) => {
    return typeof key === "symbol" ? key.description ?? String(key) : key;
  };

  const notify = (e: ReactiveEvent) => {
    let type = e.type;
    const path = "path" in e ? e.path : "";

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

    if (
      type === "apply" &&
      Array.isArray(object) && typeof path === "string" &&
      mutationMethods.get(Array)?.includes(path)
    ) {
      notify({
        type: "update",
        path: ".length",
        // @ts-ignore object is an array
        oldValue: object.length,
        newValue: undefined,
      });

      // notify relabelling of tracked labels
      for (const oldPath of dynamicLabels.keys()) {
        notify({
          type: "relabel",
          oldPath: "." + oldPath,
          newPath: "",
        });
      }
    }

    for (const callback of callbacks) {
      // @ts-ignore we're good
      scheduler.schedule(proxy, callback, { ...e, type });
    }

    // topological scheduling
    const parents = [...roots.entries()];
    parents.sort(([p1], [p2]) => getOwn(p1, ns.HAS_PARENT)(p2) ? -1 : 1);

    for (const [parent, map] of parents) {
      for (const [rootPath, { isDerived, deps }] of map.entries()) {
        if (type !== "relabel") {
          const reroute = isDerived ? rootPath : rootPath + stringifyKey(path);

          if (
            !isDerived ||
            isDerived && typeof path === "string" && deps?.has(path)
          ) {
            getOwn(parent, ns.NOTIFY)({ ...e, type, path: reroute });
          }
        } else if (e.type === "relabel") {
          getOwn(parent, ns.NOTIFY)({
            ...e,
            oldPath: rootPath + stringifyKey(e.oldPath),
          });
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

  const updateLabel = (
    oldPath: string[],
  ): string | null => {
    const oldLabel = oldPath[0];
    assertExists(oldLabel);

    let newPath = ".";
    let newLabel = "";

    const data = dynamicLabels.get(oldLabel);

    if (!data && oldPath.length > 1) {
      const maybeReactive = proxy[oldLabel];
      if (!isReactive(maybeReactive)) return null;

      newPath += oldLabel;
      const rest = getOwn(maybeReactive, ns.UPDATE_LABEL)(oldPath.slice(1));
      if (!rest) return null;

      return newPath + rest;
    }

    if (!data) return null;

    dynamicLabels.delete(oldLabel);

    if (Array.isArray(object)) {
      newLabel = String(Array.prototype.indexOf.call(object, data));
      if (newLabel === "-1") return null;
    } else {
      newLabel = Object.entries(object).find(([_, v]) => v === data)?.[0] ?? "";
    }

    if (!newLabel) return null;

    // update labels
    if (newLabel !== oldLabel) {
      dynamicLabels.set(newLabel, data);
    }

    newPath += newLabel;

    // update roots
    const maybeReactive = proxy[newLabel];
    if (isReactive(maybeReactive)) {
      (getOwn(maybeReactive, ns.UPDATE_PARENT) as typeof updateParent)(
        proxy,
        "." + oldLabel,
        "." + newLabel,
      );
    }

    if (oldPath.length > 1) {
      const rest = getOwn(maybeReactive, ns.UPDATE_LABEL)(oldPath.slice(1));
      if (!rest) return null;
      newPath += rest;
    }

    return newPath;
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
    const parentLevel = roots.get(parent);
    if (parentLevel) {
      const pathLevel = parentLevel.get(rootPath);
      if (pathLevel && dep) {
        if (pathLevel.deps) {
          for (const d of dependencies) {
            pathLevel.deps.add(d);
          }
        } else {
          pathLevel.deps = new Set(dependencies);
        }
      } else {
        parentLevel.set(rootPath, {
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

  const hasParent = (p: Record<PropertyKey, any>): boolean => {
    for (const [root] of roots.entries()) {
      if (root === p || getOwn(root, ns.HAS_PARENT)(p)) return true;
    }
    return false;
  };

  const removeParent = (p: Record<PropertyKey, any>) => {
    roots.delete(p);
  };

  const updateParent = (
    parent: Record<PropertyKey, any>,
    oldPath: string,
    newPath: string,
  ) => {
    const parentEntry = roots.get(parent);
    assertExists(parentEntry);

    const pathLevel = parentEntry.get(oldPath);
    assertExists(pathLevel);

    parentEntry.delete(oldPath);
    parentEntry.set(newPath, { ...pathLevel, rootPath: newPath });
  };

  const proxy = new Proxy(object, {
    apply(target, thisArg, argArray) {
      notify({ type: "apply", path: "", args: argArray });
      return Reflect.apply(target, thisArg, argArray);
    },
    get(target, property, receiver) {
      const path = "." + stringifyKey(property);
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      // @ts-ignore all non-null objects have this on the prototype
      const constructor = target.constructor;

      if (root && root.parent !== proxy) {
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

                  (getOwn(proxiedValue, ns.ADD_PARENT) as typeof addParent)({
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

                  (getOwn(proxiedMethod, ns.ADD_PARENT) as typeof addParent)({
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

      // track dynamic labels
      if (
        typeof property === "string" &&
        dynamicLabelMap.get(constructor)?.test(property) &&
        !dynamicLabels.has(property)
      ) {
        dynamicLabels.set(property, value);
      }

      if (value !== null && typeof value === "object") {
        let proxiedValue = graph.get(value);
        if (proxiedValue) return proxiedValue;

        // avoids double-proxying
        proxiedValue = reactive(value);

        // adopt
        (getOwn(proxiedValue, ns.ADD_PARENT) as typeof addParent)({
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

        (getOwn(proxiedMethod, ns.ADD_PARENT) as typeof addParent)({
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

      const isArray = Array.isArray(target) && property === "length";
      if (
        descriptor?.configurable === false &&
        descriptor?.set === undefined &&
        // exception: the `length` property of arrays can actually be set
        !isArray
      ) return false;

      const path = "." + stringifyKey(property);
      if (property in target) {
        // optional fancy equality check here
        if (newValue !== oldValue) {
          // For Arrays we distinguish setting the length directly (it's a writable derived)
          const type = isArray ? "create" : "update";

          notify({ type, path, newValue, oldValue });
          Reflect.set(target, property, newValue, receiver);
        }
      } else {
        notify({ type: "create", path, newValue });
        Reflect.set(target, property, newValue, receiver);
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

        // prune graph
        if (isReactive(oldValue)) {
          const oldTarget = getOwn(oldValue, ns.TARGET);
          graph.delete(oldTarget);

          getOwn(oldValue, ns.REMOVE_PARENT)(proxy);
        }
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
        proxyOwnProperties.set(property, descriptor);
      } else {
        Reflect.defineProperty(target, property, descriptor);
      }

      return true;
    },
    has(target, property) {
      if (
        typeof property === "symbol" && Object.values(ns).includes(property)
      ) {
        return proxyOwnProperties.has(property);
      }
      return Reflect.has(target, property);
    },
    getOwnPropertyDescriptor(target, property) {
      if (
        typeof property === "symbol" && Object.values(ns).includes(property)
      ) {
        return proxyOwnProperties.get(property);
      }
      return Reflect.getOwnPropertyDescriptor(target, property);
    },
  });

  const proxyOwnPropertiesMap = new Map<symbol, any>([
    [ns.ADD_LISTENER, addListener],
    [ns.ADD_PARENT, addParent],
    [ns.REMOVE_PARENT, removeParent],
    [ns.UPDATE_PARENT, updateParent],
    [ns.HAS_PARENT, hasParent],
    [ns.NOTIFY, notify],
    [ns.READ_PATH, readPath],
    [ns.UPDATE_LABEL, updateLabel],
    [ns.IS_REACTIVE, true],
    [ns.TARGET, object],
  ]);

  for (const [key, value] of proxyOwnPropertiesMap.entries()) {
    Object.defineProperty(proxy, key, { value, configurable: true });
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

const dynamicLabelMap = new Map<AnyConstructor, RegExp>([[Array, /\d+/]]);

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
const getOwn = (proxy: Record<string, any>, symbol: symbol): any => {
  return Object.getOwnPropertyDescriptor(proxy, symbol)?.value;
};

export const equals = (a: unknown, b: unknown): boolean => {
  return target(a) === target(b);
};

export const target = (p: unknown) => {
  return isReactive(p) ? getOwn(p, ns.TARGET) : p;
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
    getOwn(node, ns.ADD_LISTENER)(callback);
  }
};
