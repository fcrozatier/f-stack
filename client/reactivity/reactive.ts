let currentlyComputing: Computed<any> | null = null;

const addWatcher = Symbol();
const removeWatcher = Symbol();
const removeDependent = Symbol();

export abstract class Signal<T> {
  abstract get value(): T;
  protected reactions: Set<Computed<any>> = new Set();
  protected watchers: Set<Watcher> = new Set();

  [addWatcher](watcher: Watcher) {
    this.watchers.add(watcher);
  }

  [removeWatcher](watcher: Watcher) {
    this.watchers.delete(watcher);
  }

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

      for (const watcher of this.watchers) {
        watcher.notify(this);
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

      for (const watcher of this.watchers) {
        watcher.notify(this);
      }
    }
  }
}

export const isState = (value: unknown): value is State<any> => {
  return value instanceof State;
};

export const isComputed = (value: unknown): value is Computed<any> => {
  return value instanceof Computed;
};

export const isSignal = (value: unknown): value is Signal<any> => {
  return isState(value) || isComputed(value);
};

export const state = <T>(initialValue: T) => {
  return new State(initialValue);
};

export const computed = <T>(computation: () => T) => {
  return new Computed(computation);
};

export class Watcher {
  #callback: () => void;
  #watchedSignals: Set<Signal<any>> = new Set();
  #pendingSignals: Set<Signal<any>> = new Set();

  constructor(callback: () => void) {
    this.#callback = callback;
  }

  watch(signal: Signal<any>) {
    this.#watchedSignals.add(signal);
    signal[addWatcher](this);
  }

  unwatch(signal: Signal<any>) {
    this.#watchedSignals.delete(signal);
    this.#pendingSignals.delete(signal);
    signal[removeWatcher](this);
  }

  getPending() {
    const pending = Array.from(this.#pendingSignals);
    this.#pendingSignals.clear();
    return pending;
  }

  notify(signal: Signal<any>) {
    this.#pendingSignals.add(signal);
    this.#callback();
  }
}

let pending = false;

const watcher = new Watcher(() => {
  if (!pending) {
    pending = true;
    queueMicrotask(() => {
      pending = false;

      for (const signal of watcher.getPending()) {
        signal.value;
        // console.log(signal);
      }
    });
  }
});

type EffectCallback = () => (() => void) | void;

export const effect = (cb: EffectCallback): () => void => {
  let destructor: (() => void) | void;
  const c = new Computed(() => {
    destructor?.();
    destructor = cb();
  });
  watcher.watch(c);
  c.value;

  return () => {
    destructor?.();
    watcher.unwatch(c);
  };
};

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

const ADD_LISTENER = Symbol.for("add listener");
const ADD_PARENT = Symbol.for("add parent");
const IS_REACTIVE = Symbol.for("is reactive");
const NOTIFY = Symbol.for("notify");
const READ_PATH = Symbol.for("read path");

type Root = [parent: Record<PropertyKey, any>, path: string, reroot?: boolean];

let root: Root | undefined;

export const reactive = <T extends object>(
  object: T,
  { roots }: {
    roots: Map<Record<PropertyKey, any>, Map<string, boolean>>;
  } = {
    roots: new Map(),
  },
) => {
  const graph = new WeakMap();
  const callbacks: ReactiveEventCallback[] = [];
  const derived: Set<string> = new Set();

  const stringifyKey = (key: string | symbol) => {
    return typeof key === "symbol" ? key.description ?? String(key) : key;
  };

  const notify = (e: ReactiveEvent) => {
    for (const callback of callbacks) {
      if (
        (e.type === "create" || e.type === "update") &&
        typeof e.path === "string" && derived.has(e.path)
      ) {
        e.value = readPath(e.path);
      }

      callback(e);
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
      object as Record<string, any>,
    );
  };

  const addListener = (callback: ReactiveEventCallback) => {
    callbacks.push(callback);
  };

  const addParent = (p: any, path: string, reroot?: boolean) => {
    // idempotent: only one entry from same (parent, path) pair
    const map = roots.get(p);
    if (map) {
      map.set(path, !!reroot);
    } else {
      roots.set(p, new Map([[path, !!reroot]]));
    }
  };

  const proxy = new Proxy(object, {
    get(target, property, receiver) {
      if (root && root[0] !== proxy) {
        addParent(...root);
      }

      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);

      let value;
      try {
        var prevParent = root;
        root = [proxy, "." + stringifyKey(property), !!descriptor?.get];
        value = Reflect.get(target, property, receiver);
      } finally {
        root = prevParent;
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
              new Map([["." + stringifyKey(property), false]]),
            ]]),
          });
        } else {
          proxiedValue = value;
          // adopt
          proxiedValue[ADD_PARENT](proxy, "." + stringifyKey(property));
        }

        graph.set(value, proxiedValue);

        return proxiedValue;
      }

      if (typeof value === "function") {
        let proxiedMethod = graph.get(value);
        if (proxiedMethod) return proxiedMethod;

        proxiedMethod = new Proxy(() => {}, {
          apply(target, thisArg, argArray) {
            notify({
              type: "apply",
              path: "." + stringifyKey(property),
              args: argArray,
            });
            return Reflect.apply(target, thisArg, argArray);
          },
        });

        graph.set(value, proxiedMethod);

        return proxiedMethod;
      }

      if (descriptor?.get) {
        derived.add("." + stringifyKey(property));
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

export const isReactive = (value: unknown): boolean => {
  return value !== null && typeof value === "object" && IS_REACTIVE in value;
};

export const addListener = (node: any, callback: ReactiveEventCallback) => {
  if (!isReactive(node)) {
    throw new Error("Can't add a listener on a non reactive node");
  }

  node[ADD_LISTENER]?.(callback);
};
