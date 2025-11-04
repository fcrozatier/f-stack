/**
 * This type can be assigned to any constructor
 */
type AnyConstructor = new (...args: any[]) => any;

/**
 * Describes primitives
 */
export type Primitive = string | number | boolean | null | undefined;

/**
 * Represents the type of a {@linkcode ReactiveEvent}
 */
export type ReactiveEventType =
  | "create"
  | "update"
  | "delete"
  | "apply"
  | "relabel";

/**
 * A `ReactiveEvent` is fired every time a change or method call is detected on a {@linkcode reactive} data structure
 */
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

/**
 * Represents the callbacks of the {@linkcode listen} function
 */
export type ReactiveEventCallback = (event: ReactiveEvent) => void;

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

/**
 * A `ReactiveLeaf` is a {@linkcode reactive} object with a `value` property having a {@linkcode Primitive} type
 */
export type ReactiveLeaf<T extends Primitive = Primitive> = { value: T };

/**
 * Executes all pending event notifications immediately instead of in the next microtask
 */
export function flushSync(): void;

/**
 * Creates a `reactive` data structure
 *
 * @template {object} T
 * @param {T} object Can be an object, an array, a `Map` etc.
 * @returns {T}
 */
export function reactive<T extends object>(object: T): T;

/**
 * Returns the underlying target object of a {@linkcode reactive} `Proxy`
 *
 * @template T
 * @param {T} p
 * @returns {T}
 */
export function snapshot<T>(p: T): T;

/**
 * Checks whether `data` is reactive
 *
 * @param {unknown} data
 * @returns {data is Record<PropertyKey, any>}
 */
export function isReactive(data: unknown): data is Record<PropertyKey, any>;

/**
 * Checks whether `data` is a {@linkcode ReactiveLeaf}
 *
 * @param {unknown} data
 * @returns {data is ReactiveLeaf}
 */
export function isReactiveLeaf(data: unknown): data is ReactiveLeaf;

/**
 * Checks whether a value is a primitive
 *
 * @param {unknown} value
 * @returns {value is Primitive}
 */
export function isPrimitive(value: unknown): value is Primitive;

/**
 * Listens to a {@linkcode reactive} graph and runs the provided callback whenever a change or call is detected
 *
 * Does nothing if the argument is not reactive
 *
 * @example Usage
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
export function listen<T>(node: T, callback: ReactiveEventCallback): () => void;

/**
 * Creates a derived {@linkcode reactive} with a `value` getter
 *
 * @example Usage
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
export function derived<T>(fn: () => T): { value: T };
