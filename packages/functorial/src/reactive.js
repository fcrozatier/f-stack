/**
 * Main Functorial exports
 *
 * @module
 */

import { assert } from "@std/assert/assert";
import { assertExists } from "@std/assert/exists";

/**
 * @import {ReactiveEvent, NotificationTarget, ReactiveEventCallback, AnyConstructor, Primitive, ReactiveLeaf} from "./types.d.ts"
 */

class Scheduler {
  /**
   * @type {() => void}
   */
  #callback;

  /**
   * @type {Map<Record<PropertyKey, any>, ReactiveEvent[]>}
   */
  #pending = new Map();

  /**
   * @param {()=>void} callback
   */
  constructor(callback) {
    this.#callback = callback;
  }

  getPending() {
    const pending = this.#pending;
    this.#pending = new Map();
    return pending;
  }

  /**
   * @param {Record<PropertyKey, any>} proxy
   * @param {ReactiveEvent} event
   */
  schedule(proxy, event) {
    insert(this.#pending, proxy, event);
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

/**
 * @param {Map<Record<PropertyKey, any>, ReactiveEvent[]>} map
 * @param {Record<PropertyKey, any>} proxy
 * @param {ReactiveEvent} event
 */
const insert = (map, proxy, event) => {
  const proxyEvents = map.get(proxy);
  if (proxyEvents) {
    const index = proxyEvents.findIndex((e) => {
      if (e.type !== event.type) return false;

      if (e.type === "relabel" && event.type === "relabel") {
        return e.labels === event.labels;
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
      proxyEvents.push(event);
    } else if (event.type === "apply") {
      proxyEvents.push(event);
    }
  } else {
    map.set(proxy, [event]);
  }
};

/**
 * Executes all pending event notifications immediately instead of in the next microtask
 */
export function flushSync() {
  pending = false;
  const pendingEvents = scheduler.getPending();

  // topological dequeuing
  const scheduled = [...pendingEvents.entries()]
    .sort(([p1], [p2]) => getOwn(p1, ns.HAS_SUBSCRIBER)(p2) ? -1 : 1);

  // for glitch freedom we need to sort events before computing new derived values
  for (const [proxy, events] of scheduled) {
    for (const e of events) {
      if (e.type === "apply" && !e.path) continue;
      if (RECOMPUTE in e) getOwn(proxy, ns.RECOMPUTE)(e);
      if (e.type === "relabel" && !e.labels.length) continue;
      if (e.type === "update" && e.newValue === e.oldValue) continue;
      getOwn(proxy, ns.NOTIFY)(e);
    }
  }
}

// gives guaranties on identities
const reactiveCache = new WeakMap();

// internal property on events
const RECOMPUTE = Symbol.for("recompute");

const ns = {
  ADD_LISTENER: Symbol.for("add listener"),
  ADD_SUBSCRIBER: Symbol.for("add subscriber"),
  REMOVE_SUBSCRIBER: Symbol.for("remove subscriber"),
  UPDATE_SUBSCRIBER: Symbol.for("update subscriber"),
  HAS_SUBSCRIBER: Symbol.for("has subscriber"),
  IS_REACTIVE: Symbol.for("is reactive"),
  NOTIFY: Symbol.for("notify"),
  READ_PATH: Symbol.for("read path"),
  BUBBLE_EVENT: Symbol.for("bubble event"),
  RECOMPUTE: Symbol.for("recompute values"),
  UPDATE_LABELS: Symbol.for("update labels"),
  TARGET: Symbol.for("target"),
};

/**
 * @type {NotificationTarget | undefined}
 */
let current;

/**
 * Creates a `reactive` data structure
 *
 * @template {object} T
 * @param {T} object Can be an object, an array, a `Map` etc.
 * @returns {T}
 */
export function reactive(object) {
  // avoids double proxying
  if (isReactive(object)) return object;

  // only creates one proxy per object reference
  if (reactiveCache.has(object)) return reactiveCache.get(object);

  // will be notified of updates
  /**
   * @type {Map<Record<PropertyKey, any>,Map<string, Omit<NotificationTarget, "subscriber">>>}
   */
  const subscribers = new Map();

  /**
   * @type {Map<string | symbol, PropertyDescriptor>}
   */
  const proxyOwnProperties = new Map();
  /**
   * @type {Map<string, any>}
   */
  const derivedValues = new Map();

  /** @type {Map<string, any>} */
  const derivedLabels = new Map();
  /**
   * @type {Set<ReactiveEventCallback>}
   */
  const callbacks = new Set();

  /**
   * @param {ReactiveEvent} e
   */
  function emit(e) {
    // recompute to ensure the correct newValue in the case of batched updates
    bubble({
      ...e,
      // @ts-ignore internal
      [RECOMPUTE]: true,
    });
  }

  /**
   * @param {ReactiveEvent} e
   */
  function bubble(e) {
    const type = e.type;
    const path = "path" in e ? e.path : "";

    if (
      type === "apply" &&
      Array.isArray(object) && typeof path === "string" &&
      mutationMethods.get(Array)?.includes(path)
    ) {
      // track labels
      for (const [key, value] of object.entries()) {
        derivedLabels.set(`.${key}`, value);
      }

      // notify relabelling of tracked labels
      bubble({
        type: "relabel",
        labels: [],
        // @ts-ignore internal
        [RECOMPUTE]: true,
      });
    }

    scheduler.schedule(proxy, e);

    // topological ordering
    const entries = [...subscribers.entries()];
    entries.sort(([p1], [p2]) => getOwn(p1, ns.HAS_SUBSCRIBER)(p2) ? -1 : 1);

    for (const [subscriber, edges] of entries) {
      for (const [rootPath, { isDerived, deps }] of edges.entries()) {
        const reroute = isDerived ? rootPath : rootPath + stringifyKey(path);

        if (type !== "relabel") {
          if (!isDerived) {
            getOwn(subscriber, ns.BUBBLE_EVENT)({
              ...e,
              path: reroute,
              [RECOMPUTE]: e,
            });
          } else if (
            isDerived && typeof path === "string" &&
            // all self-derived updates are filtered via deps
            // as well as non-self derived apply calls
            // but a direct value update also notifies non-self derived subscribers
            (proxy !== subscriber && e.type === "update" ||
              deps?.includes(path))
          ) {
            getOwn(subscriber, ns.BUBBLE_EVENT)({
              type: "update",
              path: reroute,
              [RECOMPUTE]: true,
            });
          }
        } else if (e.type === "relabel") {
          if (!isDerived) {
            getOwn(subscriber, ns.BUBBLE_EVENT)({
              ...e,
              // update the rootPath prefix for computing the relabelling
              [RECOMPUTE]: {
                // @ts-ignore we're fine
                rootPath: rootPath + (e?.[RECOMPUTE]?.rootPath ?? ""),
              },
            });
          } else {
            getOwn(subscriber, ns.BUBBLE_EVENT)({
              type: "update",
              path: reroute,
              [RECOMPUTE]: true,
            });
          }
        }
      }
    }
  }

  /**
   * @param {ReactiveEvent} e
   */
  function recompute(e) {
    assert(RECOMPUTE in e, "Expected RECOMPUTE property in e");

    const type = e.type;

    if (e[RECOMPUTE] === true) {
      const path = "path" in e ? e.path : "";

      // recompute derived
      if (
        (type === "update" || type === "delete") &&
        typeof path === "string" && derivedValues.has(path)
      ) {
        e.oldValue = derivedValues.get(path);
        // invalidate the cache
        derivedValues.delete(path);
      }

      // get the latest values and recache derived values
      if (
        (type === "create" || type === "update") && typeof path === "string"
      ) {
        e.newValue = readPath(path);
      }

      if (type === "relabel") {
        const newLabels = updateLabels();
        // e.labels is a shared reference so we mutate it rather than reassign it
        e.labels.length = 0;
        e.labels.push(...newLabels);
      }
    } else if (typeof e[RECOMPUTE] === "object" && e[RECOMPUTE] !== null) {
      switch (type) {
        case "delete":
          assert(
            "oldValue" in e[RECOMPUTE],
            "Expected oldValue property in e[RECOMPUTE]",
          );
          e.oldValue = e[RECOMPUTE].oldValue;
          break;
        case "update":
          assert(
            "oldValue" in e[RECOMPUTE],
            "Expected oldValue property in e[RECOMPUTE]",
          );
          assert(
            "newValue" in e[RECOMPUTE],
            "Expected newValue property in e[RECOMPUTE]",
          );
          e.oldValue = e[RECOMPUTE].oldValue;
          e.newValue = e[RECOMPUTE].newValue;
          break;
        case "create":
          assert(
            "newValue" in e[RECOMPUTE],
            "Expected newValue property in e[RECOMPUTE]",
          );
          e.newValue = e[RECOMPUTE].newValue;
          break;
        case "apply":
          break;
        case "relabel": {
          assert(
            "rootPath" in e[RECOMPUTE],
            "Expected rootPath property in e[RECOMPUTE]",
          );
          // recompute is a covariant prefixing in the relabelling case
          const rootPath = e[RECOMPUTE].rootPath;
          e.labels = e.labels.map(([o, n]) => [rootPath + o, rootPath + n]);
          break;
        }
        default:
          throw new Error("Unimplemented recompute");
      }
    }

    delete e[RECOMPUTE];
  }

  /**
   * @param {ReactiveEvent} e
   */
  function notify(e) {
    for (const callback of callbacks) {
      callback(e);
    }
  }

  /**
   * @param {string} path
   */
  function readPath(path) {
    return path.split(".").slice(1).reduce(
      (acc, curr) => {
        return acc instanceof Map ? acc.get(curr) : acc[curr];
      },
      /** @type {any} */ (proxy),
    );
  }

  /**
   * @returns {[string, string][]}
   */
  function updateLabels() {
    /**
     * @type {[string, string][]}
     */
    const labels = [];

    for (const [oldLabel, value] of derivedLabels.entries()) {
      let newLabel = ".";

      derivedLabels.delete(oldLabel);

      if (Array.isArray(object)) {
        const i = Array.prototype.indexOf.call(object, value);
        if (i === -1) continue;
        newLabel += String(i);
      } else {
        // comparing target values (no proxies here)
        newLabel += Object.entries(object).find(([_, v]) => v === value)?.[0] ??
          "";
        if (newLabel === ".") continue;
      }

      if (oldLabel === newLabel) continue;

      labels.push([oldLabel, newLabel]);

      const maybeReactive = proxy[newLabel];
      // update subscribers
      if (isReactive(maybeReactive)) {
        (getOwn(
          maybeReactive,
          ns.UPDATE_SUBSCRIBER,
        ))(proxy, "." + oldLabel, "." + newLabel);
      }
    }

    derivedLabels.clear();

    return labels;
  }

  /**
   * @param {ReactiveEventCallback} callback
   */
  function addListener(callback) {
    callbacks.add(callback);
    return () => callbacks.delete(callback);
  }

  /**
   * @param {NotificationTarget} options
   */
  function addSubscriber(options) {
    const { subscriber, rootPath, isDerived, deps } = options;
    const dependencies = deps ?? [];

    // idempotent inserts: only one subscriber for a given edge label
    const edges = subscribers.get(subscriber);
    if (edges) {
      const edge = edges.get(rootPath);
      if (edge && deps) {
        if (edge.deps) {
          for (const d of dependencies) {
            if (!edge.deps.includes(d)) {
              edge.deps.push(d);
            }
          }
        } else {
          edge.deps = dependencies;
        }
      } else {
        edges.set(rootPath, {
          rootPath,
          isDerived,
          deps: dependencies,
        });
      }
    } else {
      subscribers.set(
        subscriber,
        new Map([[rootPath, {
          rootPath,
          isDerived,
          deps: dependencies,
        }]]),
      );
    }
  }

  /**
   * @param {Record<PropertyKey, any>} subscriber
   * @returns {boolean}
   */
  function hasSubscriber(subscriber) {
    for (const [other] of subscribers.entries()) {
      if (
        other === subscriber || getOwn(other, ns.HAS_SUBSCRIBER)(subscriber)
      ) return true;
    }
    return false;
  }

  /**
   * @param {Record<PropertyKey, any>} subscriber
   */
  function removeSubscriber(subscriber) {
    subscribers.delete(subscriber);
  }

  // relabels a parent path
  /**
   * @param {Record<PropertyKey, any>} subscriber
   * @param {string} oldPath
   * @param {string} newPath
   */
  function updateSubscriber(subscriber, oldPath, newPath) {
    const parentEntry = subscribers.get(subscriber);
    assertExists(parentEntry);

    const pathLevel = parentEntry.get(oldPath);
    if (!pathLevel) return;

    parentEntry.delete(oldPath);
    parentEntry.set(newPath, { ...pathLevel, rootPath: newPath });
  }

  const proxy = new Proxy(object, {
    apply(target, thisArg, argArray) {
      emit({ type: "apply", path: "", args: argArray });

      return Reflect.apply(target, thisArg, argArray);
    },
    get(target, property, receiver) {
      const path = "." + stringifyKey(property);
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      // @ts-ignore all non-null objects have this on the prototype
      const constructor = target.constructor;

      if (current) {
        if (mutationMethods.has(constructor)) {
          addSubscriber({ ...current, deps: mutationMethods.get(constructor) });
        } else {
          addSubscriber({ ...current, deps: [path] });
        }
      }

      if (property === Symbol.iterator) {
        // @ts-ignore object is iterable
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
              const itemPath = `.${key}`;

              if (typeof value === "object") {
                const proxiedValue = reactive(value);

                // track dynamic labels
                if (
                  dynamicLabelMap.get(constructor)?.test(key) &&
                  !derivedLabels.has(itemPath) && key in target
                ) {
                  derivedLabels.set(itemPath, value);
                }

                (getOwn(
                  proxiedValue,
                  ns.ADD_SUBSCRIBER,
                ))(
                  {
                    subscriber: proxy,
                    rootPath: "." + key,
                    isDerived: false,
                  },
                );

                value = proxiedValue;
              } else if (typeof value === "function") {
                const bound = value.bind(object);
                const proxiedMethod = reactive(bound);

                (getOwn(
                  proxiedMethod,
                  ns.ADD_SUBSCRIBER,
                ))({
                  subscriber: proxy,
                  rootPath: "." + key,
                  isDerived: false,
                });

                Object.defineProperty(proxiedMethod, ns.TARGET, {
                  value,
                  configurable: true,
                });

                value = proxiedMethod;
              }

              return {
                done,
                value: /**@type {any}*/ (object) instanceof Map
                  ? [key, value]
                  : value,
              };
            },
            /** @param {any} value */
            return(value) {
              return { done: true, value };
            },
            /** @param {any} value */
            throw(value) {
              return iterator.throw(value);
            },
          });
        }
      }

      // if it's a derived value, check if it's cached first
      if (descriptor?.get && derivedValues.has(path)) {
        return derivedValues.get(path);
      } else {
        try {
          var prevParent = current;
          current = {
            subscriber: proxy,
            rootPath: path,
            isDerived: !!descriptor?.get,
          };
          var value = Reflect.get(target, property, receiver);
        } catch (e) {
          // Some objects have exotic properties like Map.size
          if (e instanceof TypeError) {
            value = target[property];
          } else throw e;
        } finally {
          current = prevParent;
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
        const proxiedValue = reactive(value);

        // subscribe
        (getOwn(proxiedValue, ns.ADD_SUBSCRIBER))({
          subscriber: proxy,
          rootPath: path,
          isDerived: false,
        });

        return proxiedValue;
      }

      if (typeof value === "function") {
        // @ts-ignore value is a function
        const bound = value.bind(object);
        const proxiedMethod = reactive(bound);

        (getOwn(proxiedMethod, ns.ADD_SUBSCRIBER))({
          subscriber: proxy,
          rootPath: path,
          isDerived: false,
        });

        Object.defineProperty(proxiedMethod, ns.TARGET, {
          value,
          configurable: true,
        });

        return proxiedMethod;
      }

      if (descriptor?.get) {
        derivedValues.set(path, value);
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

      const isArrayLengthProperty = Array.isArray(target) &&
        property === "length";
      if (
        descriptor?.configurable === false &&
        descriptor?.set === undefined &&
        // exception: the `length` property of arrays can actually be set
        !isArrayLengthProperty
      ) return false;

      const path = "." + stringifyKey(property);
      if (property in target) {
        // optional fancy equality check here
        if (newValue !== oldValue) {
          // does the reactive oldValue projects down to the same target
          if (isReactive(oldValue) && snapshot(oldValue) === newValue) {
            return true;
          }

          // For Arrays we distinguish setting the length directly (it's a writable derived)
          const type = isArrayLengthProperty ? "create" : "update";

          emit({ type, path, newValue, oldValue });
          Reflect.set(target, property, newValue, receiver);
        }
      } else {
        emit({ type: "create", path, newValue });
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
        emit({ type: "delete", path, oldValue });

        // prune graph
        if (isReactive(oldValue)) {
          getOwn(oldValue, ns.REMOVE_SUBSCRIBER)(proxy);
        }
      }

      derivedValues.delete(path);

      return Reflect.deleteProperty(target, property);
    },
    defineProperty(target, property, descriptor) {
      if (
        typeof property === "symbol" &&
        Object.values(ns).includes(property)
      ) {
        // don't pollute the original object with the proxy's own properties
        proxyOwnProperties.set(property, descriptor);
        return true;
      }

      Reflect.defineProperty(target, property, descriptor);
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

  const proxyOwnPropertiesMap = new Map(
    /** @type {[symbol, any][]} */ ([
      [ns.ADD_LISTENER, addListener],
      [ns.ADD_SUBSCRIBER, addSubscriber],
      [ns.REMOVE_SUBSCRIBER, removeSubscriber],
      [ns.UPDATE_SUBSCRIBER, updateSubscriber],
      [ns.HAS_SUBSCRIBER, hasSubscriber],
      [ns.READ_PATH, readPath],
      [ns.NOTIFY, notify],
      [ns.BUBBLE_EVENT, bubble],
      [ns.RECOMPUTE, recompute],
      [ns.UPDATE_LABELS, updateLabels],
      [ns.IS_REACTIVE, true],
      [ns.TARGET, object],
    ]),
  );

  for (const [key, value] of proxyOwnPropertiesMap.entries()) {
    Object.defineProperty(proxy, key, {
      value,
      configurable: true, // respects `getOwnPropertyDescriptor` invariant
    });
  }

  reactiveCache.set(object, proxy);

  return proxy;
}

/**
 * @param {string | symbol} key
 */
function stringifyKey(key) {
  return typeof key === "symbol" ? key.description ?? String(key) : key;
}

/**
 * @type {Map<AnyConstructor, RegExp>}
 */
const dynamicLabelMap = new Map([[Array, /\d+/]]);

const mutationMethods = new Map(
  /** @type {[AnyConstructor, string[]][]} */ ([
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
  ]),
);

// we grab the proxy's virtual properties by [[GetOwnProperty]] semantics instead of [[Get]] to avoid having to add logic to the main get trap that would have to be executed for every property access of the target
/**
 * @param {Record<string, any>} proxy
 * @param {symbol} symbol
 */
function getOwn(proxy, symbol) {
  return Object.getOwnPropertyDescriptor(proxy, symbol)?.value;
}

/**
 * Returns the underlying target object of a {@linkcode reactive} `Proxy`
 *
 * @template T
 * @param {T} p
 * @returns {T}
 */
export function snapshot(p) {
  return isReactive(p) ? getOwn(p, ns.TARGET) : p;
}

/**
 * Checks whether `data` is reactive
 *
 * @param {unknown} data
 * @returns {data is Record<PropertyKey, any>}
 */
export function isReactive(data) {
  return (data !== null && typeof data === "object" &&
    ns.IS_REACTIVE in data) ||
    (typeof data === "function" && ns.IS_REACTIVE in data);
}

/**
 * Checks whether `data` is a {@linkcode ReactiveLeaf}
 *
 * @param {unknown} data
 * @returns {data is ReactiveLeaf}
 */
export function isReactiveLeaf(data) {
  return (data !== null && typeof data === "object" &&
    ns.IS_REACTIVE in data && "value" in data && isPrimitive(data.value));
}

/**
 * Checks whether a value is a primitive
 *
 * @param {unknown} value
 * @returns {value is Primitive}
 */
export function isPrimitive(value) {
  return value === null ||
    ["string", "number", "boolean", "undefined"].includes(typeof value);
}

function noop() {}

/**
 * Listens to a {@linkcode reactive} graph and runs the provided callback whenever a change or call is detected
 *
 * Does nothing if the argument is not reactive
 *
 * @example
 *
 * ```ts
 * import { reactive, listen } from "@f-stack/functorial";
 *
 * const state = reactive({ count: 0 });
 *
 * listen(state, (e) => {
 *   // types are "create", "update", "delete", "apply" and "relabel"
 *   if(e.type === "update" && e.path === ".count") {
 *     console.log(`old: ${e.oldValue}, new: ${e.newValue}`);
 *   }
 * });
 *
 * state.count = 1;
 * // old: 0, new: 1
 * ```
 *
 * @template T
 * @param {T} node
 * @param {ReactiveEventCallback} callback
 * @return {() => void} A cleanup function to remove the listener
 */
export function listen(node, callback) {
  // doing the sanity check here to avoid spreading these checks all over the codebase
  if (!isReactive(node)) return noop;
  return getOwn(node, ns.ADD_LISTENER)(callback);
}

// derived

/**
 * Creates a derived {@linkcode reactive} with a `value` getter
 *
 * @example
 *
 * ```ts
 * import { reactive, derived } from "@f-stack/functorial";
 * import { assertEquals } from "@std/assert";
 *
 * const count = reactive({ value: 1 });
 * const double = derived(() => count.value * 2);
 *
 * assertEquals(double.value, 2);
 * ```
 *
 * @template T
 * @param {()=>T} fn
 * @returns {{ value: T }}
 */
export function derived(fn) {
  return reactive({
    get value() {
      return fn();
    },
  });
}
