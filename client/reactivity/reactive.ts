let currentlyComputing: Computed<any> | null = null;

const removeDependent = Symbol();

export abstract class Signal<T> {
  abstract get value(): T;
  protected reactions: Set<Computed<any>> = new Set();
  protected watchers = new Set();

  [removeDependent](computed: Computed<any>) {
    this.reactions.delete(computed);
  }
}

export class State<T> extends Signal<T> {
  #value: T;

  constructor(initial: T) {
    super();
    this.#value = initial;

    if (currentlyComputing) {
      this.reactions.add(currentlyComputing);
      currentlyComputing[addSource](this);
    }
  }

  get value() {
    if (currentlyComputing) {
      this.reactions.add(currentlyComputing);
      currentlyComputing[addSource](this);
    }

    return this.#value;
  }

  set value(newValue: T) {
    if (!this.#compare(this.#value, newValue)) {
      this.#value = newValue;

      for (const reaction of this.reactions) {
        reaction[markStale]();
      }
    }
  }

  #compare(value1: T, value2: T) {
    return Object.is(value1, value2);
  }
}

const addSource = Symbol();
const markStale = Symbol();

export class Computed<T> extends Signal<T> {
  #computation: () => T;
  #value: T | undefined;
  #isStale = true;
  #sources: Set<Signal<any>> = new Set();

  constructor(computation: () => T) {
    super();
    this.#computation = computation;
  }

  get value(): T {
    if (this.#isStale) {
      this.#recompute();
    }

    if (currentlyComputing) {
      this.reactions.add(currentlyComputing);
      currentlyComputing[addSource](this);
    }

    return this.#value!;
  }

  #recompute() {
    for (const source of this.#sources) {
      source[removeDependent](this);
    }
    this.#sources.clear();

    const prevComputation = currentlyComputing;
    currentlyComputing = this;

    try {
      this.#value = this.#computation();
      this.#isStale = false;
    } finally {
      currentlyComputing = prevComputation;
    }
  }

  [addSource](source: Signal<any>) {
    this.#sources.add(source);
  }

  [markStale]() {
    if (!this.#isStale) {
      this.#isStale = true;

      for (const reaction of this.reactions) {
        reaction[markStale]();
      }
    }
  }
}

export type ReactiveEventType = "create" | "update" | "delete" | "apply";
export type ReactiveEvent =
  | {
    type: "create";
    path: string | symbol;
    value?: any;
  }
  | { type: "update"; path: string | symbol; value?: any }
  | { type: "delete"; path: string | symbol }
  | { type: "apply"; path: string | symbol; args: any[] };

export type ReactiveEventCallback = (event: ReactiveEvent) => void;

export class Scheduler {
  #callback: () => void;
  #pending: [Record<PropertyKey, any>, ReactiveEventCallback, ReactiveEvent][] =
    [];

  constructor(callback: () => void) {
    this.#callback = callback;
  }

  getPending() {
    const pending = this.#pending;
    this.#pending = [];
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
    // topological enqueuing
    for (let index = this.#pending.length - 1; index >= 0; index--) {
      const [p] = this.#pending[index]!;

      if (p[HAS_PARENT](proxy)) {
        this.#pending.splice(index, 0, [proxy, callback, event]);
        this.#callback();
        return;
      }
    }

    this.#pending.push([proxy, callback, event]);
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
  for (const [proxy, callback, e] of scheduler.getPending()) {
    if (
      (e.type === "create" || e.type === "update") &&
      typeof e.path === "string"
    ) {
      // get the latest value and recache the derived values
      e.value = proxy[READ_PATH](e.path);
    }
    callback(e);
  }
};

const ADD_LISTENER = Symbol.for("add listener");
const ADD_PARENT = Symbol.for("add parent");
const HAS_PARENT = Symbol.for("has parent");
const IS_REACTIVE = Symbol.for("is reactive");
const NOTIFY = Symbol.for("notify");
const READ_PATH = Symbol.for("read path");

type Root = [parent: Record<PropertyKey, any>, path: string, reroot?: boolean];

let root: Root | undefined;

export const reactive = <T extends object>(
  object: T,
  { roots }: {
    roots: Map<Record<PropertyKey, any>, Map<string, boolean>>;
  } = { roots: new Map() },
) => {
  const graph = new WeakMap();
  const callbacks: ReactiveEventCallback[] = [];
  const derived: Map<string, any> = new Map();

  const stringifyKey = (key: string | symbol) => {
    return typeof key === "symbol" ? key.description ?? String(key) : key;
  };

  const notify = (e: ReactiveEvent) => {
    if (
      (e.type === "create" || e.type === "update") &&
      typeof e.path === "string" && derived.has(e.path)
    ) {
      // invalidate the cache
      derived.delete(e.path);
    }

    for (const callback of callbacks) {
      scheduler.schedule(proxy, callback, e);
    }

    for (const [parent, map] of roots.entries()) {
      for (const [rootPath, reroot] of map.entries()) {
        const path = reroot ? rootPath : rootPath + stringifyKey(e.path);
        parent[NOTIFY]({ ...e, path });
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

  const addParent = (parent: any, path: string, reroot?: boolean) => {
    // idempotent: only one entry for a given (parent, path) pair
    const map = roots.get(parent);
    if (map) {
      map.set(path, !!reroot);
    } else {
      roots.set(parent, new Map([[path, !!reroot]]));
    }
  };

  const proxy = new Proxy(object, {
    get(target, property, receiver) {
      if (root && root[0] !== proxy) {
        addParent(...root);
      }

      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);

      let value;
      const path = "." + stringifyKey(property);

      // if its a derived value, check if it's cached first
      if (descriptor?.get && derived.has(path)) {
        return derived.get(path);
      } else {
        try {
          var prevParent = root;
          root = [proxy, path, !!descriptor?.get];
          value = Reflect.get(target, property, receiver);
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
            roots: new Map([[proxy, new Map([[path, false]])]]),
          });
        } else {
          proxiedValue = value;
          // adopt
          proxiedValue[ADD_PARENT](proxy, path);
        }

        graph.set(value, proxiedValue);

        return proxiedValue;
      }

      if (typeof value === "function") {
        let proxiedMethod = graph.get(value);
        if (proxiedMethod) return proxiedMethod;

        proxiedMethod = new Proxy(() => {}, {
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
      const value = Reflect.get(target, property, receiver);

      // set invariants
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (
        descriptor?.configurable === false &&
        descriptor?.writable === false &&
        value !== newValue
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
        if (value !== newValue) {
          Reflect.set(target, property, newValue, receiver);
          notify({ type: "update", path, value: newValue });
        }
      } else {
        Reflect.set(target, property, newValue, receiver);
        notify({ type: "create", path, value: newValue });
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
        notify({ type: "delete", path });
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
