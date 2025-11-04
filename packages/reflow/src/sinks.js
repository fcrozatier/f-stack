// @ts-self-types="./types.d.ts"

import { isReactiveLeaf, reactive } from "@f-stack/functorial";

/**
 * @import { AttachSink, AttrSink, ClassListSink, MapSink, TagName, On, Prop, ShowSink,DerivedSink, StyleSink, TextSink, UnsafeSink } from "./types.d.ts"
 * @import { ReactiveLeaf } from "@f-stack/functorial/types"
 */

// attach

const ATTACH_SINK = Symbol.for("attach sink");

/**
 * Creates an {@linkcode attach} sink.
 *
 * The callback hook runs on the element it is attached to.
 *
 * @example
 *
 * ```ts
 * import { attach, html, on } from "@f-stack/reflow";
 * import { reactive } from "@f-stack/reflow/reactivity";
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
 *
 * @template {Node} T
 * @param {AttachSink<T>} hook
 * @returns {AttachSink<T>}
 */
export function attach(hook) {
  Object.defineProperty(hook, ATTACH_SINK, { value: true });
  return hook;
}

/**
 * Checks whether a sink is an {@linkcode attach} sink
 *
 * @param {unknown} value
 * @returns {value is AttachSink}
 */
export const isAttachSink = (value) => {
  return typeof value === "function" && Object.hasOwn(value, ATTACH_SINK);
};

// attr

const ATTR_SINK = Symbol.for("attr sink");

/**
 * Creates an {@linkcode attr} sink that manages attributes on an `Element`
 *
 * @template {TagName} T
 * @param {AttrSink<T>} attributes
 * @returns {AttrSink<T>}
 */
export function attr(attributes) {
  const attrSink = reactive(attributes);
  Object.defineProperty(attrSink, ATTR_SINK, { value: true });
  return attrSink;
}

/**
 * Checks whether a sink is an {@linkcode attr} sink
 *
 * @param {unknown} value
 * @returns {value is AttrSink}
 */
export function isAttrSink(value) {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, ATTR_SINK);
}

// classList

const CLASSLIST_SINK = Symbol.for("classList sink");

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
 *
 * @param {ClassListSink} classes
 * @return {ClassListSink}
 */
export function classList(classes) {
  const classSink = reactive(classes);
  Object.defineProperty(classSink, CLASSLIST_SINK, { value: true });
  return classSink;
}

/**
 * Checks whether a sink is a {@linkcode classList} sink
 *
 * @param {unknown} value
 * @returns {value is ClassListSink}
 */
export function isClassSink(value) {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, CLASSLIST_SINK);
}

// map

const MAP_SINK = Symbol.for("map sink");

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
 * @template T
 * @param {T[]} values The {@linkcode reactive} array to iterate on
 * @param {(value: T, index: ReactiveLeaf<number>) => DocumentFragment} mapper A callback taking as input a single `value` from the array and its `index`
 * @returns {MapSink<T>}
 */
export function map(values, mapper) {
  return {
    values,
    mapper,
    // @ts-ignore internal
    [MAP_SINK]: true,
  };
}

/**
 * Checks whether a sink is a {@linkcode map} sink
 *
 * @param {unknown} value
 * @returns {value is MapSink}
 */
export function isMapSink(value) {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, MAP_SINK);
}

// on

const ON_SINK = Symbol.for("on sink");

/**
 * @typedef {On<HTMLElement, HTMLElementEventMap>} DefaultedOn
 */

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
 *
 * @param {DefaultedOn} listeners
 * @returns {DefaultedOn}
 */
export function on(listeners) {
  const onSink = reactive(listeners);
  Object.defineProperty(onSink, ON_SINK, { value: true });
  return onSink;
}

/**
 * Checks whether a sink is an {@linkcode on} sink
 *
 * @param {unknown} value
 * @returns {value is On}
 */
export function isOnSink(value) {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, ON_SINK);
}

// prop

const PROP_SINK = Symbol.for("prop sink");

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
 *
 * @template {Element} T
 * @param {Prop<T>} props
 * @returns {Prop}
 */
export function prop(props) {
  const propSink = reactive(props);
  Object.defineProperty(propSink, PROP_SINK, { value: true });
  return propSink;
}

/**
 * Checks whether a sink is an {@linkcode on} sink
 *
 * @param {unknown} value
 * @returns {value is Prop}
 */
export function isPropSink(value) {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, PROP_SINK);
}

// show

const SHOW_SINK = Symbol.for("show sink");

/**
 * Creates a `show` sink to handle alternations. It takes 3 callbacks:
 *
 * @param {() => boolean} condition Returns a boolean corresponding to whether we're in the `true` or `false` case
 * @param {() => DerivedSink} ifCase Returns the template or value to show when the condition is `true`
 * @param {  (() => DerivedSink)     | undefined} [elseCase] Optionally returns the template or value to show when the condition is `false`
 * @returns {ShowSink}
 */
export function show(
  condition,
  ifCase,
  elseCase,
) {
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
 *
 * @param {unknown} value
 * @returns {value is ShowSink}
 */
export function isShowSink(value) {
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
 *
 * @param {StyleSink} styles
 * @return {StyleSink}
 */
export function style(styles) {
  const styleSink = reactive(styles);
  Object.defineProperty(styleSink, STYLE_SINK, { value: true });
  return styleSink;
}

/**
 * Checks whether a sink is a {@linkcode style} sink
 *
 * @param {unknown} value
 * @returns {value is StyleSink}
 */
export function isStyleSink(value) {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, STYLE_SINK);
}

// text

const TEXT_SINK = Symbol.for("text sink");

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
 * @template {Record<string, any>} T
 * @param {T} node the {@linkcode reactive} object reference
 * @param {keyof T & string} key the key to read as text. Defaults to `value`
 *  @returns {TextSink}
 *
 * @see {@linkcode derived}
 */
export function text(
  node,
  key = "value",
) {
  const textSink = { data: node, key, [TEXT_SINK]: true };
  return textSink;
}

/**
 * Checks whether a sink is a {@linkcode text} sink
 *
 * @param {unknown} value
 * @returns {value is TextSink}
 */
export function isTextSink(value) {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, TEXT_SINK);
}

// unsafe

const UNSAFE_SINK = Symbol.for("unsafe sink");

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
 *
 * @param {string | ReactiveLeaf<string>} unsafe
 * @returns {UnsafeSink}
 */
export function unsafeHTML(unsafe) {
  const unsafeSink = typeof unsafe === "string" || !isReactiveLeaf(unsafe)
    ? reactive({ value: unsafe })
    : unsafe;
  Object.defineProperty(unsafeSink, UNSAFE_SINK, { value: true });
  return unsafeSink;
}

/**
 * Checks whether a sink is an {@link unsafeHTML} sink
 *
 * @param {unknown} value
 * @returns {value is UnsafeSink}
 */
export function isUnsafeHTML(value) {
  return typeof value === "object" &&
    value !== null &&
    Object.hasOwn(value, UNSAFE_SINK);
}
