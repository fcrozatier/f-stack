import { assert, assertExists } from "../assert.ts";
import { isPrimitive, type Primitive } from "../utils.ts";

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
  | {
    type: "update";
    path: string | symbol;
    newValue: any;
    oldValue?: any;
  }
  | {
    type: "delete";
    path: string | symbol;
    oldValue: any;
  }
  | { type: "apply"; path: string | symbol; args: any[] }
  | { type: "relabel"; labels: [string, string][] };

export type ReactiveEventCallback = (event: ReactiveEvent) => void;

export class Scheduler {
  #callback: () => void;
  #pending: Map<Record<PropertyKey, any>, ReactiveEvent[]> = new Map();

  constructor(callback: () => void) {
    this.#callback = callback;
  }

  getPending() {
    const pending = this.#pending;
    this.#pending = new Map();
    return pending;
  }

  schedule(proxy: Record<PropertyKey, any>, event: ReactiveEvent) {
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

const insert = (
  map: Map<Record<PropertyKey, any>, ReactiveEvent[]>,
  proxy: Record<PropertyKey, any>,
  event: ReactiveEvent,
) => {
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
 * All data structures are faithfully representable as labelled directed multigraphs.
 * We model the labelled multigraph capability of this topos by storing data on the edges.
 */
type Edge = {
  label: string;
  isDerivedLabel?: boolean | undefined;
  isDerivedValue?: boolean | undefined;
  isWritableDerivedValue?: boolean | undefined;
  updateChannels?: string[] | undefined;
};

type NotificationTarget = {
  subscriber: Record<PropertyKey, any>;
  rootPath: string;
  isDerived: boolean;
  deps?: string[] | undefined;
};

let current: NotificationTarget | undefined;

export function reactive<T extends object>(object: T): T {
  // avoids double proxying
  if (isReactive(object)) return object;

  // only creates one proxy per object reference
  if (reactiveCache.has(object)) return reactiveCache.get(object);

  // will be notified of updates
  const subscribers: Map<
    Record<PropertyKey, any>,
    Map<string, Omit<NotificationTarget, "subscriber">>
  > = new Map();

  const proxyOwnProperties = new Map<string | symbol, PropertyDescriptor>();
  const derivedValues = new Map<string, any>();
  const derivedLabels = new Map<string, any>();
  const callbacks: Set<ReactiveEventCallback> = new Set();

  function emit(e: ReactiveEvent) {
    // recompute to ensure the correct newValue in the case of batched updates
    bubble({
      ...e,
      // @ts-ignore internal
      [RECOMPUTE]: true,
    });
  }

  function bubble(e: ReactiveEvent) {
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

  function recompute(e: ReactiveEvent) {
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

  function notify(e: ReactiveEvent) {
    for (const callback of callbacks) {
      callback(e);
    }
  }

  function readPath(path: string) {
    return path.split(".").slice(1).reduce(
      (acc, curr) => {
        return acc instanceof Map ? acc.get(curr) : acc[curr];
      },
      proxy as Record<string, any>,
    );
  }

  function updateLabels(): [string, string][] {
    const labels: [string, string][] = [];

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
        ) as typeof updateSubscriber)(proxy, "." + oldLabel, "." + newLabel);
      }
    }

    derivedLabels.clear();

    return labels;
  }

  function addListener(callback: ReactiveEventCallback) {
    callbacks.add(callback);
    return () => callbacks.delete(callback);
  }

  function addSubscriber(options: NotificationTarget) {
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

  function hasSubscriber(subscriber: Record<PropertyKey, any>): boolean {
    for (const [other] of subscribers.entries()) {
      if (
        other === subscriber || getOwn(other, ns.HAS_SUBSCRIBER)(subscriber)
      ) return true;
    }
    return false;
  }

  function removeSubscriber(subscriber: Record<PropertyKey, any>) {
    subscribers.delete(subscriber);
  }

  // relabels a parent path
  function updateSubscriber(
    subscriber: Record<PropertyKey, any>,
    oldPath: string,
    newPath: string,
  ) {
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
                ) as typeof addSubscriber)(
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
                ) as typeof addSubscriber)({
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
          } else {
            throw e;
          }
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
        (getOwn(proxiedValue, ns.ADD_SUBSCRIBER) as typeof addSubscriber)({
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

        (getOwn(proxiedMethod, ns.ADD_SUBSCRIBER) as typeof addSubscriber)({
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

  const proxyOwnPropertiesMap = new Map<symbol, any>([
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
  ]);

  for (const [key, value] of proxyOwnPropertiesMap.entries()) {
    Object.defineProperty(proxy, key, {
      value,
      configurable: true, // respects `getOwnPropertyDescriptor` invariant
    });
  }

  reactiveCache.set(object, proxy);

  return proxy;
}

const stringifyKey = (key: string | symbol) => {
  return typeof key === "symbol" ? key.description ?? String(key) : key;
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
  return snapshot(a) === snapshot(b);
};

export const snapshot = (p: unknown) => {
  return isReactive(p) ? getOwn(p, ns.TARGET) : p;
};

export const isReactive = (
  value: unknown,
): value is Record<PropertyKey, any> => {
  return (value !== null && typeof value === "object" &&
    ns.IS_REACTIVE in value) ||
    (typeof value === "function" && ns.IS_REACTIVE in value);
};

export type ReactiveLeaf<T extends Primitive = Primitive> = { value: T };

/**
 * By convention a reactive object with a `value` property having a primitive type
 */
export const isReactiveLeaf = (data: unknown): data is ReactiveLeaf => {
  return (data !== null && typeof data === "object" &&
    ns.IS_REACTIVE in data && "value" in data && isPrimitive(data.value));
};

function noop() {}

/**
 * Adds a listener to a reactive graph node
 *
 * Does nothing if the argument is not reactive
 *
 * @return A cleanup function removing the listener
 */
export const addListener = <T extends Record<PropertyKey, any>>(
  node: T,
  callback: ReactiveEventCallback,
): () => void => {
  // doing the sanity check here to avoid spreading these checks all over the code
  if (!isReactive(node)) return noop;
  return getOwn(node, ns.ADD_LISTENER)(callback);
};

// derived

export const derived = <T>(fn: () => T): { value: T } => {
  return reactive({
    get value() {
      return fn();
    },
  });
};
