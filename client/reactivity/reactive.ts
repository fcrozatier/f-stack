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
  // idempotent insertion collapses events
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
    const proxyLevel = this.#pending.get(proxy);
    if (proxyLevel) {
      const callbackLevel = proxyLevel.get(callback);
      if (!callbackLevel) {
        proxyLevel.set(callback, [event]);
      } else {
        const index = callbackLevel?.findIndex((e) =>
          e.type === event.type && e.path === event.path
        );
        // collapsing rules:
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

    queueMicrotask(() => {
      pending = false;

      flushSync();
    });
  }
});

export const flushSync = () => {
  // topological dequeuing
  const scheduled = [...scheduler.getPending().entries()];
  scheduled.sort(([p1], [p2]) => p1[HAS_PARENT](p2) ? -1 : 1);

  for (const [proxy, map] of scheduled) {
    for (const [callback, events] of map?.entries()) {
      for (const e of events) {
        if (
          (e.type === "create" || e.type === "update") &&
          typeof e.path === "string"
        ) {
          // get the latest value and recache the derived values
          e.newValue = proxy[READ_PATH](e.path);
        }
        callback(e);
      }
    }
  }
};

const ADD_LISTENER = Symbol.for("add listener");
const ADD_PARENT = Symbol.for("add parent");
const HAS_PARENT = Symbol.for("has parent");
const IS_REACTIVE = Symbol.for("is reactive");
const NOTIFY = Symbol.for("notify");
const READ_PATH = Symbol.for("read path");

type Root = {
  parent: Record<PropertyKey, any>;
  rootPath: string;
  isDerived: boolean;
  deps?: Set<string> | undefined;
};

let root: Root | undefined;

export const reactive = <T extends object>(
  object: T,
  { roots }: {
    roots: Map<
      Record<PropertyKey, any>,
      Map<string, Omit<Root, "parent">>
    >;
  } = { roots: new Map() },
) => {
  if (isReactive(object)) return object;

  const graph = new WeakMap();
  const callbacks: ReactiveEventCallback[] = [];
  const derived: Map<string, any> = new Map();

  const stringifyKey = (key: string | symbol) => {
    return typeof key === "symbol" ? key.description ?? String(key) : key;
  };

  const notify = (e: ReactiveEvent) => {
    if (
      (e.type === "update" || e.type === "delete") &&
      typeof e.path === "string" && derived.has(e.path)
    ) {
      e.oldValue = derived.get(e.path);
      // invalidate the cache
      derived.delete(e.path);
    }

    for (const callback of callbacks) {
      scheduler.schedule(proxy, callback, e);
    }

    // topological scheduling
    const parents = [...roots.entries()];
    parents.sort(([p1], [p2]) => p1[HAS_PARENT](p2) ? -1 : 1);

    for (const [parent, map] of parents) {
      for (const [rootPath, { isDerived, deps }] of map.entries()) {
        const path = isDerived ? rootPath : rootPath + stringifyKey(e.path);

        if (
          !isDerived ||
          isDerived && typeof e.path === "string" && deps?.has(e.path)
        ) {
          parent[NOTIFY]({ ...e, path });
        }
      }
    }
  };

  const readPath = (path: string) => {
    return path.split(".").slice(1).reduce(
      (acc, curr) => (acc[curr]),
      proxy as Record<string, any>,
    );
  };

  const hasParent = (p: Record<PropertyKey, any>): boolean => {
    for (const [root] of roots.entries()) {
      if (root === p || root[HAS_PARENT](p)) return true;
    }
    return false;
  };

  const addListener = (callback: ReactiveEventCallback) => {
    callbacks.push(callback);
  };

  const addParent = (
    options: Omit<Root, "deps"> & { dep?: string | undefined },
  ) => {
    const { parent, rootPath, isDerived, dep } = options;

    // idempotent inserts: only one entry for a given (parent, path) pair
    const parentEntry = roots.get(parent);
    if (parentEntry) {
      const pathEntry = parentEntry.get(rootPath);
      if (pathEntry && dep) {
        if (pathEntry.deps) {
          pathEntry.deps.add(dep);
        } else {
          pathEntry.deps = new Set([dep]);
        }
      } else {
        parentEntry.set(rootPath, {
          rootPath,
          isDerived,
          deps: dep ? new Set([dep]) : undefined,
        });
      }
    } else {
      roots.set(
        parent,
        new Map([[rootPath, {
          rootPath,
          isDerived,
          deps: dep ? new Set([dep]) : undefined,
        }]]),
      );
    }
  };

  const proxy = new Proxy(object, {
    get(target, property, receiver) {
      const path = "." + stringifyKey(property);
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);

      if (root && root.parent !== proxy) {
        addParent({ ...root, dep: path });
      }

      // if its a derived value, check if it's cached first
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

        // avoid double-proxying
        if (!isReactive(value)) {
          proxiedValue = reactive(value, {
            roots: new Map([[
              proxy,
              new Map([[path, { rootPath: path, isDerived: false }]]),
            ]]),
          });
        } else {
          proxiedValue = value;
          // adopt
          (proxiedValue[ADD_PARENT] as typeof addParent)({
            parent: proxy,
            rootPath: path,
            isDerived: false,
          });
        }

        graph.set(value, proxiedValue);

        return proxiedValue;
      }

      if (typeof value === "function") {
        let proxiedMethod = graph.get(value);
        if (proxiedMethod) return proxiedMethod;

        // @ts-ignore value is a function
        const bound = value.bind(object);
        proxiedMethod = new Proxy(bound, {
          apply(target, thisArg, argArray) {
            notify({ type: "apply", path, args: argArray });
            return Reflect.apply(target, thisArg, argArray);
          },
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
      const oldValue = Reflect.get(target, property, receiver);

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
        const value = Reflect.get(target, property);
        notify({ type: "delete", path, oldValue: value });
      }

      derived.delete(path);

      return Reflect.deleteProperty(target, property);
    },
  });

  if (!(ADD_LISTENER in proxy)) {
    Object.defineProperty(proxy, ADD_LISTENER, {
      value: addListener,
    });
  }

  if (!(ADD_PARENT in proxy)) {
    Object.defineProperty(proxy, ADD_PARENT, {
      value: addParent,
    });
  }

  if (!(HAS_PARENT in proxy)) {
    Object.defineProperty(proxy, HAS_PARENT, {
      value: hasParent,
    });
  }

  if (!(NOTIFY in proxy)) {
    Object.defineProperty(proxy, NOTIFY, {
      value: notify,
    });
  }

  if (!(READ_PATH in proxy)) {
    Object.defineProperty(proxy, READ_PATH, {
      value: readPath,
    });
  }

  if (!(IS_REACTIVE in proxy)) {
    Object.defineProperty(proxy, IS_REACTIVE, {
      value: true,
    });
  }

  return proxy;
};

export const isReactive = (
  value: unknown,
): value is Record<PropertyKey, any> => {
  return value !== null && typeof value === "object" && IS_REACTIVE in value;
};

export const addListener = (node: any, callback: ReactiveEventCallback) => {
  if (!isReactive(node)) {
    throw new Error("Can't add a listener on a non reactive node");
  }

  node[ADD_LISTENER]?.(callback);
};
