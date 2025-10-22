import {
  isReactiveLeaf,
  reactive,
  type ReactiveLeaf,
} from "@f-stack/functorial";
import type { Primitive } from "@f-stack/functorial/utils";

// attach

const ATTACHMENT_SINK = Symbol.for("attachment sink");

/**
 * Type of an {@linkcode attach} sink
 */
export interface Attachment<T extends Node = Element> {
  (element: T): void | (() => void);
}

/**
 * Creates an {@linkcode attach} sink
 */
export function attach<T extends Node>(
  attachment: Attachment<T>,
): Attachment<T> {
  const attachmentSink = reactive(attachment);
  Object.defineProperty(attachmentSink, ATTACHMENT_SINK, { value: true });
  return attachmentSink;
}

/**
 * Checks whether a sink is an {@linkcode attach} sink
 */
export const isAttachSink = (value: unknown): value is Attachment => {
  return typeof value === "function" && Object.hasOwn(value, ATTACHMENT_SINK);
};

// attr

const ATTR_SINK = Symbol.for("attr sink");

/**
 * Type of an {@linkcode attr} sink
 */
export type AttrSink = Record<string, Primitive>;

/**
 * Creates an {@linkcode attr} sink that manages attributes on an `Element`
 */
export function attr(attributes: AttrSink): AttrSink {
  const attrSink = reactive(attributes);
  Object.defineProperty(attrSink, ATTR_SINK, { value: true });
  return attrSink;
}

/**
 * Checks whether a sink is an {@linkcode attr} sink
 */
export function isAttrSink(value: unknown): value is AttrSink {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, ATTR_SINK);
}

// classList

const CLASSLIST_SINK = Symbol.for("classList sink");

/**
 * Type of the {@linkcode classList} sink
 */
export type ClassListSink = Record<string, boolean | null | undefined>;

/**
 * Creates a {@linkcode classList} sink that handles conditional classes on an `Element`
 *
 * @example
 *
 * ```ts
 * import { html, classList } from "@f-stack/reflow";
 *
 * export const ClassListDemo = () => {
 *   return html`
 *     <span ${classList({ highlight: true })}>Hi</span>
 *
 *     <style>
 *       .highlight {
 *         color: red;
 *       }
 *     </style>
 *   `
 * }
 * ```
 */
export function classList(classes: ClassListSink): ClassListSink {
  const classSink = reactive(classes);
  Object.defineProperty(classSink, CLASSLIST_SINK, { value: true });
  return classSink;
}

/**
 * Checks whether a sink is a {@linkcode classList} sink
 */
export function isClassSink(value: unknown): value is ClassListSink {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, CLASSLIST_SINK);
}

// map

const MAP_SINK = Symbol.for("map sink");

/**
 * Type of a {@linkcode map} sink
 */
export type MapSink<T = any> = {
  values: T[];
  mapper: (reactive: { value: T; index: number }) => DocumentFragment;
};

/**
 * Creates a {@linkcode map} sink that handles iterations
 *
 * @example
 *
 * ```ts
 * import { html, map } from "@f-stack/reflow";
 *
 * export const MapDemo = () => {
 *   const arr = ["a", "b", "c"];
 *
 *   return html`
 *   <ul>
 *     ${map(arr, (letter) => {
 *       return html`<li>${letter.index}: ${letter.value}<li>`
 *     })}
 *   </ul>`
 * }
 * ```
 *
 * @param values The array to iterate on
 * @param mapper A callback taking as input an object with a `value` and `index` property
 */
export function map<T>(
  values: T[],
  mapper: (reactive: { value: T; index: number }) => DocumentFragment,
): MapSink<T> {
  const mapSink = {
    values,
    mapper,
    [MAP_SINK]: true,
  };
  Object.defineProperty(mapSink, MAP_SINK, { value: true });
  return mapSink;
}

/**
 * Checks whether a sink is a {@linkcode map} sink
 */
export function isMapSink(value: unknown): value is MapSink {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, MAP_SINK);
}

// on

const ON_SINK = Symbol.for("on sink");

/**
 * Type of the {@linkcode on} sink
 *
 * @template U, V
 * @param U The node receiving the event listener
 * @param V The global event list
 */
export type On<U = HTMLElement, V = HTMLElementEventMap> = {
  [K in keyof Partial<V>]:
    | ((this: U, event: V[K]) => any)
    | [
      (this: U, event: V[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ];
};

/**
 * Creates an {@linkcode on} sink that manages event handlers on an `Element`
 *
 * @example Simple click listener
 *
 * ```ts
 * import { html, on } from "@f-stack/reflow";
 *
 * export const ClickDemo = () => {
 *   return html`<button ${on({
 *     click: () => console.log('hi')
 *   })}>Click</button>`
 * }
 * ```
 *
 * @example Type parameter and `this` keyword
 *
 * Pass a type parameter to the {@linkcode on} sink for a more accurate typing of `this`
 *
 * ```ts
 * import { html, on } from "@f-stack/reflow";
 *
 * export const ThisDemo = () => {
 *   return html`<input ${on<HTMLInputElement>({
 *     input: function () {
 *       console.log(this.value)
 *     }
 *   })}>`
 * }
 * ```
 */
export function on<U = HTMLElement, V = HTMLElementEventMap>(
  listeners: On<U, V>,
): On<U, V> {
  const onSink = reactive(listeners);
  Object.defineProperty(onSink, ON_SINK, { value: true });
  return onSink;
}

/**
 * Checks whether a sink is an {@linkcode on} sink
 */
export function isOnSink(value: unknown): value is On {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, ON_SINK);
}

// show

const SHOW_SINK = Symbol.for("show sink");

/**
 * Type of a {@linkcode show} sink
 */
export type ShowSink = {
  cond: boolean;
  ifCase: () => DocumentFragment | ReactiveLeaf | Primitive;
  elseCase?:
    | (() => DocumentFragment | ReactiveLeaf | Primitive)
    | undefined;
};

/**
 * Creates a `show` sink to handle alternations. It takes 3 callbacks:
 *
 * @param condition Returns a boolean corresponding to whether we're in the `true` or `false` case
 * @param ifCase Returns the template or value to show when the condition is `true`
 * @param elseCase Optionally returns the template or value to show when the condition is `false`
 */
export function show(
  condition: () => boolean,
  ifCase: () => DocumentFragment | ReactiveLeaf | Primitive,
  elseCase?:
    | (() => DocumentFragment | ReactiveLeaf | Primitive)
    | undefined,
): ShowSink {
  return reactive({
    get cond() {
      return condition();
    },
    ifCase,
    elseCase,
    [SHOW_SINK]: true,
  });
}

/**
 * Checks whether a sink is a {@linkcode show} sink
 */
export function isShowSink(value: unknown): value is ShowSink {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, SHOW_SINK);
}

// style

/**
 * CSS Typed Object Model is not implemented in Firefox
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1278697
 */

const STYLE_SINK = Symbol.for("style sink");

/**
 * Type helper converting camel case to kebab case
 *
 * @internal
 */
export type CamelToKebab<T extends string> = T extends
  `${infer First}${infer Rest}` ? Rest extends "" ? Lowercase<First>
  : Rest extends Capitalize<Rest> ? `${Lowercase<First>}-${CamelToKebab<Rest>}`
  : `${Lowercase<First>}${CamelToKebab<Rest>}`
  : T;

/**
 * A {@linkcode StyleSink} is a `Record` such that:
 * - the keys are CSS properties or --dashed identifiers
 * - the values are strings or numbers
 *
 * @see {@linkcode style}
 */
export type StyleSink = {
  [
    K in CamelToKebab<keyof CSSStyleDeclaration & string> | `--${string}`
  ]?: string | number;
};

/**
 * Creates a `style` sink that handles inline styles on an `Element`
 *
 * @example
 *
 * ```ts
 * import { html, style } from "@f-stack/reflow";
 *
 * export const StyleDemo = () => {
 *   return html`
 *     <div ${style({
 *       "--bg": 'red',
 *       color: "var(--bg)"
 *     })}>Hello</div>`
 * }
 * ```
 */
export function style(styles: StyleSink): StyleSink {
  const styleSink = reactive(styles);
  Object.defineProperty(styleSink, STYLE_SINK, { value: true });
  return styleSink;
}

/** Checks whether a sink is a {@linkcode style} sink */
export function isStyleSink(
  value: unknown,
): value is StyleSink {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, STYLE_SINK);
}

// text

const TEXT_SINK = Symbol.for("text sink");

/**
 * Type of a {@linkcode text} sink
 */
export interface TextSink {
  /** A reactive object reference */
  data: Record<string, any>;
  /** The key to read from `data` */
  key: string;
  /** @internal */
  [TEXT_SINK]?: true;
}

/**
 * Creates a text sink from a {@linkcode reactive} object reference and a key
 *
 * __`text` sink vs `derived` sink__
 *
 * A {@linkcode derived} sink is more powerful than a {@linkcode text} sink but creates an additional `Proxy`, which is not always necessary: when the key is dynamic or you need to compute an expression from the returned value use a {@linkcode derived} sink, otherwise use a {@linkcode text} sink when just reading values
 *
 * @example
 *
 * ```ts
 * import { html, text } from "@f-stack/reflow";
 * import { reactive } from "@f-stack/reflow/reactivity";
 *
 * export const TextDemo = () => {
 *   const user = reactive({
 *     name: "Bob",
 *     age: 21
 *   })
 *
 *   return html`
 *     Name: ${text(user, "name")} Age: ${text(user, "age")}
 *   `
 * }
 * ```
 *
 * @param node the {@linkcode reactive} object reference
 * @param key the key to read as text. Defaults to `value`
 *
 * @see {@linkcode derived}
 */
export function text<T extends Record<string, any>>(
  node: T,
  key: keyof T & string = "value",
): TextSink {
  return { data: node, key, [TEXT_SINK]: true };
}

/**
 * Checks whether a sink is a {@linkcode text} sink
 */
export function isTextSink(value: unknown): value is TextSink {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, TEXT_SINK);
}

// unsafe

const UNSAFE_SINK = Symbol.for("unsafe sink");

/**
 * Type of the {@linkcode unsafeHTML} sink
 */
export interface UnsafeHTML extends ReactiveLeaf<string> {
  /** @internal */
  [UNSAFE_SINK]?: true;
}

/**
 * Creates a raw HTML sink.
 *
 * The passed-in string or {@linkcode ReactiveLeaf<string>} is parsed as HTML and written to the DOM.
 *
 * Only use this with trusted inputs.
 *
 * @example
 *
 * ```ts
 * import { html, unsafeHTML } from "@f-stack/reflow";
 * import { reactive } from "@f-stack/reflow/reactivity";
 *
 * export const UnsafeDemo = () => {
 *   const unsafeInput = reactive({ value: "<em>Raw HTML</em>" });
 *
 *   return html`${unsafeHTML(unsafeInput)}`
 * }
 * ```
 */
export function unsafeHTML(
  unsafe: string | ReactiveLeaf<string>,
): UnsafeHTML {
  const unsafeSink = typeof unsafe === "string" || !isReactiveLeaf(unsafe)
    ? reactive({ value: unsafe })
    : unsafe;
  Object.defineProperty(unsafeSink, UNSAFE_SINK, { value: true });
  return unsafeSink;
}

/**
 * Checks whether a sink is an {@link unsafeHTML} sink
 */
export function isUnsafeHTML(value: unknown): value is UnsafeHTML {
  return typeof value === "object" &&
    value !== null &&
    Object.hasOwn(value, UNSAFE_SINK);
}
