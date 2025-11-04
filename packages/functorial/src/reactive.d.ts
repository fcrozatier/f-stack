/**
 * This type can be assigned to any constructor
 */
export type AnyConstructor = new (...args: any[]) => any;

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

export type NotificationTarget = {
  subscriber: Record<PropertyKey, any>;
  rootPath: string;
  isDerived: boolean;
  deps?: string[] | undefined;
};

/**
 * A `ReactiveLeaf` is a {@linkcode reactive} object with a `value` property having a {@linkcode Primitive} type
 */
export type ReactiveLeaf<T extends Primitive = Primitive> = { value: T };
