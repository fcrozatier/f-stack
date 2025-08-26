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

export const flushSync = () => {
  for (const signal of watcher.getPending()) {
    signal.value;
  }
};

export const untrack = <T>(fn: () => T): T => {
  const previousComputing = currentlyComputing;
  currentlyComputing = null;

  try {
    return fn();
  } finally {
    currentlyComputing = previousComputing;
  }
};

export class ReactiveArray<T> extends Array<T> {
  private callbacks: Record<
    keyof ProxyHandler<ArrayLike<T>>,
    ((...args: any[]) => void)[]
  > = {
    "apply": [],
    "construct": [],
    "defineProperty": [],
    "deleteProperty": [],
    "get": [],
    "getOwnPropertyDescriptor": [],
    "getPrototypeOf": [],
    "has": [],
    "isExtensible": [],
    "ownKeys": [],
    "preventExtensions": [],
    "set": [],
    "setPrototypeOf": [],
  };

  constructor(...args: T[]) {
    super(...args);

    const length = state(
      args.length === 1 && typeof args[0] === "number" ? args[0] : args.length,
    );

    const sources: Map<string | symbol, State<any>> = new Map(
      [["length", length]],
    );
    const callbacks = this.callbacks;

    return new Proxy(this, {
      defineProperty(target, property, descriptor) {
        effect(() => {
          untrack(() => {
            for (const callback of callbacks["defineProperty"]) {
              callback(target, property, descriptor);
            }
          });
        });
        return Reflect.defineProperty(target, property, descriptor);
      },
      deleteProperty(target, property) {
        effect(() => {
          untrack(() => {
            for (const callback of callbacks["deleteProperty"]) {
              callback(target, property);
            }
          });
        });
        sources.delete(property);
        return Reflect.deleteProperty(target, property);
      },
      get(target, property, receiver) {
        const source = sources.get(property);

        if (source) {
          return source.value;
        }

        if (
          typeof property === "string" &&
          Object.hasOwn(target, property)
        ) {
          const value = Reflect.get(target, property, receiver);
          sources.set(property, state(value));
          return value;
        }

        return Reflect.get(target, property, receiver);
      },
      set(target, property, newValue, receiver) {
        const source = sources.get(property);

        // When setting the length directly, remove all sources above the new length
        if (property === "length" && newValue < source?.value) {
          for (let index = newValue; index < source?.value; index++) {
            sources.delete(String(index));
          }
        }

        if (source) {
          source.value = newValue;
        } else if (
          typeof property === "string" &&
          Object.hasOwn(target, property)
        ) {
          sources.set(property, state(newValue));
        }

        return Reflect.set(target, property, newValue, receiver);
      },
    });
  }

  on<E extends keyof ProxyHandler<ArrayLike<T>>>(
    event: E,
    callback: (
      ...args: Parameters<NonNullable<ProxyHandler<ArrayLike<T>>[E]>>
    ) => void,
  ): void {
    this.callbacks[event].push(callback);
  }
}

export class ReactiveObject<T extends Record<string, any>> extends Object {
  private callbacks: Record<
    keyof ProxyHandler<ArrayLike<T>>,
    ((...args: any[]) => void)[]
  > = {
    "apply": [],
    "construct": [],
    "defineProperty": [],
    "deleteProperty": [],
    "get": [],
    "getOwnPropertyDescriptor": [],
    "getPrototypeOf": [],
    "has": [],
    "isExtensible": [],
    "ownKeys": [],
    "preventExtensions": [],
    "set": [],
    "setPrototypeOf": [],
  };

  constructor(object: T) {
    super(object);
    const sources: Map<string | symbol, State<any>> = new Map();
    const callbacks = this.callbacks;

    return new Proxy(this, {
      defineProperty(target, property, descriptor) {
        effect(() => {
          untrack(() => {
            for (const callback of callbacks["defineProperty"]) {
              callback(target, property, descriptor);
            }
          });
        });
        return Reflect.defineProperty(target, property, descriptor);
      },
      deleteProperty(target, property) {
        effect(() => {
          untrack(() => {
            for (const callback of callbacks["deleteProperty"]) {
              callback(target, property);
            }
          });
        });
        sources.delete(property);
        return Reflect.deleteProperty(target, property);
      },
      get(target, property, receiver) {
        const source = sources.get(property);

        if (source) {
          return source.value;
        }

        if (
          typeof property === "string" &&
          Object.hasOwn(target, property)
        ) {
          const value = Reflect.get(target, property, receiver);
          sources.set(property, state(value));
          return value;
        }

        return Reflect.get(target, property, receiver);
      },
      set(target, property, newValue, receiver) {
        const source = sources.get(property);

        // When setting the length directly, remove all sources above the new length
        if (property === "length" && newValue < source?.value) {
          for (let index = newValue; index < source?.value; index++) {
            sources.delete(String(index));
          }
        }

        if (source) {
          source.value = newValue;
        } else if (
          typeof property === "string" &&
          Object.hasOwn(target, property)
        ) {
          sources.set(property, state(newValue));
        }

        return Reflect.set(target, property, newValue, receiver);
      },
    });
  }

  on<E extends keyof ProxyHandler<ArrayLike<T>>>(
    event: E,
    callback: (
      ...args: Parameters<NonNullable<ProxyHandler<ArrayLike<T>>[E]>>
    ) => void,
  ): void {
    this.callbacks[event].push(callback);
  }
}

const o = new ReactiveObject({ a: 1 });

export const reactiveProxy = <T extends Record<string, any>>(o: T) => {
  const callbacks: Record<keyof ProxyHandler<T>, ((...args: any[]) => void)[]> =
    {
      "apply": [],
      "construct": [],
      "defineProperty": [],
      "deleteProperty": [],
      "get": [],
      "getOwnPropertyDescriptor": [],
      "getPrototypeOf": [],
      "has": [],
      "isExtensible": [],
      "ownKeys": [],
      "preventExtensions": [],
      "set": [],
      "setPrototypeOf": [],
    };

  const sources: Map<string | symbol, State<any>> = new Map();

  return new Proxy(o, {
    defineProperty(target, property, descriptor) {
      effect(() => {
        untrack(() => {
          for (const callback of callbacks["defineProperty"]) {
            callback(target, property, descriptor);
          }
        });
      });
      return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
      effect(() => {
        untrack(() => {
          for (const callback of callbacks["deleteProperty"]) {
            callback(target, property);
          }
        });
      });
      sources.delete(property);
      return Reflect.deleteProperty(target, property);
    },
    get(target, property, receiver) {
      const source = sources.get(property);

      if (source) {
        return source.value;
      }

      if (
        typeof property === "string" &&
        Object.hasOwn(target, property)
      ) {
        const value = Reflect.get(target, property, receiver);
        sources.set(property, state(value));
        return value;
      }

      return Reflect.get(target, property, receiver);
    },
    set(target, property, newValue, receiver) {
      const source = sources.get(property);

      // When setting the length directly, remove all sources above the new length
      if (property === "length" && newValue < source?.value) {
        for (let index = newValue; index < source?.value; index++) {
          sources.delete(String(index));
        }
      }

      if (source) {
        source.value = newValue;
      } else if (
        typeof property === "string" &&
        Object.hasOwn(target, property)
      ) {
        sources.set(property, state(newValue));
      }

      return Reflect.set(target, property, newValue, receiver);
    },
  });
};
