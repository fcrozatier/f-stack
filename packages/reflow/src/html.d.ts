import type { listen, Primitive, ReactiveLeaf } from "@f-stack/functorial";
import type { DOMAttributesTagNameMap } from "./elements.d.ts";

/**
 * Type of the template tag functions
 *
 * @see {@linkcode html}
 * @see {@linkcode svg}
 * @see {@linkcode math}
 */
export type TemplateTag = (
  strings: TemplateStringsArray,
  ...sinks: Sink[]
) => TemplateSink;

/**
 * A sink is either an {@linkcode ElementSink} or a {@linkcode FragmentSink}
 */
export type Sink = ElementSink | FragmentSink;

/**
 * The type of an element sink
 */
export type ElementSink =
  | AttachSink<any>
  | AttrSink
  | ClassListSink
  | On<any, any>
  | Prop<any>
  | StyleSink;

/**
 * The type of a fragment sink
 */
export type FragmentSink =
  | DerivedSink
  | MapSink
  | ShowSink
  | TemplateSink
  | TextSink
  | UnsafeSink;

/**
 * The `HTML` template tag
 */
export const html: TemplateTag;

/**
 * The `SVG` template tag
 */
export const svg: TemplateTag;

/**
 * The `MathML` template tag
 */
export const math: TemplateTag;

// attach

/**
 * Type of a {@linkcode attach} sink
 */
export interface AttachSink<T extends Node = Element> {
  (element: T): void;
}

/**
 * Creates an {@linkcode attach} sink.
 *
 * The callback hook runs on the element it is attached to.
 *
 * @example
 *
 * ```ts
 * import { attach, html, on } from "@f-stack/reflow";
 * import { reactive } from "@f-stack/functorial";
 *
 * export const UseDemo = () => {
 *   const form = reactive({ value: "Bob" });
 *
 *   return html`
 *     <form>
 *       <label>username:
 *         <input type="text"
 *           ${attach((i: HTMLInputElement) => {
 *             i.defaultValue = form.value;
 *           })}
 *           ${on<HTMLInputElement>({
 *             input: function () {
 *               form.value = this.value;
 *             },
 *           })}>
 *       </label>
 *       <button type="reset">Reset</button>
 *     </form>
 *   `;
 * };
 * ```
 */
export function attach<T extends Node>(hook: AttachSink<T>): AttachSink<T>;

/**
 * Checks whether a sink is an {@linkcode attach} sink
 */
export function isAttachSink(value: unknown): value is AttachSink;

// attr

/**
 * All tag names of HTML, SVG and MathML elements
 */
export type TagName =
  | keyof HTMLElementTagNameMap
  | keyof SVGElementTagNameMap
  | keyof MathMLElementTagNameMap;

/**
 * Type of an {@linkcode attr} sink
 */
export type AttrSink<T extends TagName = "div"> = T extends
  keyof DOMAttributesTagNameMap ? DOMAttributesTagNameMap[T]
  : never;

/**
 * Creates an {@linkcode attr} sink that manages attributes on an `Element`
 *
 * @template {TagName} T
 * @param {AttrSink<T>} attributes
 * @returns {AttrSink<T>}
 */
export function attr<T extends TagName>(attributes: AttrSink<T>): AttrSink<T>;

/**
 * Checks whether a sink is an {@linkcode attr} sink
 *
 * @param {unknown} value
 * @returns {value is AttrSink}
 */
export function isAttrSink(value: unknown): value is AttrSink;

// classList

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
export function classList(classes: ClassListSink): ClassListSink;

/**
 * Checks whether a sink is a {@linkcode classList} sink
 */
export function isClassSink(value: unknown): value is ClassListSink;

// map

/**
 * Type of a {@linkcode map} sink
 */
export type MapSink<T = any> = {
  values: T[];
  mapper: (value: T, index: ReactiveLeaf<number>) => TemplateSink;
};

/**
 * Creates a {@linkcode map} sink for iterating over a {@linkcode reactive} array
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
 *     ${map(arr, (letter, index) => {
 *       return html`<li>${index}: ${letter}<li>`
 *     })}
 *   </ul>`
 * }
 * ```
 */
export function map<T>(
  values: T[],
  mapper: (value: T, index: ReactiveLeaf<number>) => TemplateSink,
): MapSink<T>;

/**
 * Checks whether a sink is a {@linkcode map} sink
 */
export function isMapSink(value: unknown): value is MapSink;

// on

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
): On<U, V>;

/**
 * Checks whether a sink is an {@linkcode on} sink
 */
export function isOnSink(value: unknown): value is On;

// prop

// https://github.com/Microsoft/TypeScript/issues/27024
type Equals<X, Y> = (<T>() => T extends X ? 1 : 0) extends
  <U>() => U extends Y ? 1 : 0 ? true : false;

/** @internal */
type WritableKeys<T> = {
  [K in keyof T]:
    Equals<{ [P in K]: T[K] }, { -readonly [P in K]: T[K] }> extends true ? K
      : never;
}[keyof T];

/**
 * Type of the {@linkcode prop} sink
 */
export type Prop<T extends Element = Element> = {
  [K in WritableKeys<T> as T[K] extends Function ? never : K]?: T[K];
};

/**
 * Creates a {@linkcode prop} sink that manages an `Element` properties
 *
 * @example
 *
 * ```ts
 * import { html, prop } from "@f-stack/reflow";
 *
 * export const PropDemo = () => {
 *   return html`
 *     <form>
 *       <input type="checkbox" ${prop<HTMLInputElement>({
 *         indeterminate: true,
 *       })}>
 *       <input type="text" ${prop<HTMLInputElement>({ defaultValue: "Bob" })}>
 *       <p>
 *         <button type="reset">Reset</button>
 *       </p>
 *     </form>
 *   `;
 * };
 *
 * ```
 */
export function prop<T extends Element>(props: Prop<T>): Prop;

/**
 * Checks whether a sink is an {@linkcode on} sink
 */
export function isPropSink(value: unknown): value is Prop;

// show

/**
 * Type of a {@linkcode show} sink
 */
export type ShowSink = {
  cond: boolean;
  ifCase: () => DerivedSink;
  elseCase?:
    | (() => DerivedSink)
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
  ifCase: () => DerivedSink,
  elseCase?: () => DerivedSink,
): ShowSink;

/**
 * Checks whether a sink is a {@linkcode show} sink
 */
export function isShowSink(value: unknown): value is ShowSink;

// style

/**
 * Type helper converting camel case to kebab case
 *
 * @internal
 */
type CamelToKebab<T extends string> = T extends `${infer First}${infer Rest}`
  ? Rest extends "" ? Lowercase<First>
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
export function style(styles: StyleSink): StyleSink;

/**
 * Checks whether a sink is a {@linkcode style} sink
 */
export function isStyleSink(value: unknown): value is StyleSink;

// template

/**
 * A `TemplateSink` is a type of sink that's `Disposable`
 *
 * @see {@linkcode TemplateTag}
 */
export interface TemplateSink extends Disposable {
  fragment: DocumentFragment;
}

/**
 * Checks whether a sink is a template sink
 *
 * @param {unknown} value
 * @returns {value is TemplateSink}
 */
export function isTemplateSink(value: unknown): value is TemplateSink;

// text

/**
 * Type of a {@linkcode text} sink
 */
export interface TextSink {
  /** A reactive object reference */
  data: Record<string, any>;
  /** The key to read from `data` */
  key: string;
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
 * import { reactive } from "@f-stack/functorial";
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

 * @param  node the {@linkcode reactive} object reference
 * @param  key the key to read as text. Defaults to `value`

 *
 * @see {@linkcode derived}
 */
export function text<T extends Record<string, any>>(
  node: T,
  key: keyof T & string,
): TextSink;

/**
 * Checks whether a sink is a {@linkcode text} sink
 */
export function isTextSink(value: unknown): value is TextSink;

// unsafe

/**
 * Type of the {@linkcode unsafeHTML} sink
 */
export type UnsafeSink = ReactiveLeaf<string>;

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
 * import { reactive } from "@f-stack/functorial";
 *
 * export const UnsafeDemo = () => {
 *   const unsafeInput = reactive({ value: "<em>Raw HTML</em>" });
 *
 *   return html`${unsafeHTML(unsafeInput)}`
 * }
 * ```
 */
export function unsafeHTML(unsafe: string | ReactiveLeaf<string>): UnsafeSink;

/**
 * Checks whether a sink is an {@link unsafeHTML} sink
 */
export function isUnsafeHTML(value: unknown): value is UnsafeSink;

/**
 * Return type of the {@linkcode derived} sink callback when inlined in the template
 */
export type DerivedSink = Primitive | ReactiveLeaf | TemplateSink;

/**
 * An `EffectScope` is a disposable scope used in components that provides a local {@linkcode listen} function.
 *
 * This `listen` function is cleaned up automatically when the scope is disposed of.
 */
export interface EffectScope extends Disposable {
  disposer: DisposableStack;
  listen: typeof listen;
}

/**
 * Creates a component
 *
 * Provides a local {@linkcode listen} function that's automatically cleaned up when the component unmounts
 */
export function component<T extends any[]>(
  callback: (this: EffectScope, ...args: T) => TemplateSink,
): (...args: NoInfer<T>) => TemplateSink;
