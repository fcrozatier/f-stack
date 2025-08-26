import { type Signal } from "./reactivity/signals.ts";

const ATTACHMENT_SINK = Symbol();

export interface Attachment<T extends Node = Element> {
  (element: T): void | (() => void);
  [ATTACHMENT_SINK]?: true;
}

export const attach = <T extends Node>(attachment: Attachment<T>) => {
  Object.defineProperty(attachment, ATTACHMENT_SINK, { value: true });
  return attachment;
};

export const isAttachment = (value: unknown): value is Attachment => {
  return typeof value === "function" && Object.hasOwn(value, ATTACHMENT_SINK);
};

const ON_SINK = Symbol();

/**
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

export const on = <U = HTMLElement, V = HTMLElementEventMap>(
  listeners: On<U, V>,
) => {
  Object.defineProperty(listeners, ON_SINK, { value: true });
  return listeners;
};

export const isOnSink = (value: unknown): value is On => {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, ON_SINK);
};

const UNSAFE_SINK = Symbol();

type UnsafeHTML = {
  unsafe: string | Signal<string>;
  [UNSAFE_SINK]?: true;
};

export const unsafeHTML = (unsafe: string | Signal<string>): UnsafeHTML => {
  return {
    unsafe,
    [UNSAFE_SINK]: true,
  };
};

export const isUnsafeHTML = (value: unknown): value is UnsafeHTML => {
  return typeof value === "object" &&
    value !== null &&
    Object.hasOwn(value, UNSAFE_SINK);
};

const ARRAY_SINK = Symbol();

type ArraySink<T = any> = {
  arrayLike: ArrayLike<T>;
  mapper: (value: T, index: number, array?: T[]) => DocumentFragment;
  [ARRAY_SINK]?: true;
};

export const map = <T>(
  arrayLike: ArrayLike<T>,
  mapper: (value: T, index: number, array?: T[]) => DocumentFragment,
): ArraySink<T> => {
  return {
    arrayLike,
    mapper,
    [ARRAY_SINK]: true,
  };
};

export const isArraySink = (value: unknown): value is ArraySink => {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, ARRAY_SINK);
};

// Attr

const ATTR_SINK = Symbol.for("attr sink");

type Primitive = string | number | boolean | null | undefined;
type ReactiveValue<T = Primitive> = { value: T };

export interface AttrSink extends Record<string, Primitive | ReactiveValue> {
  [ATTR_SINK]?: true;
}

export const attr = (attributes: AttrSink) => {
  Object.defineProperty(attributes, ATTR_SINK, { value: true });
  return attributes;
};

export const isAttrSink = (value: unknown): value is AttrSink => {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, ATTR_SINK);
};

// classList

const CLASS_SINK = Symbol.for("class sink");

export interface ClassSink extends Record<string, Primitive | ReactiveValue> {
  [CLASS_SINK]?: true;
}

export type ClassListValue = Record<
  string,
  boolean | null | undefined | ReactiveValue
>;

export const classList = (classes: ClassListValue) => {
  Object.defineProperty(classes, CLASS_SINK, { value: true });
  return classes;
};

export const isClassSink = (value: unknown): value is ClassListValue => {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, CLASS_SINK);
};

// style

/**
 * CSS Typed Object Model is not implemented on Firefox
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1278697
 */

const STYLE_SINK = Symbol.for("style sink");

export type CamelToKebab<T extends string> = T extends
  `${infer First}${infer Rest}` ? Rest extends "" ? Lowercase<First>
  : Rest extends Capitalize<Rest> ? `${Lowercase<First>}-${CamelToKebab<Rest>}`
  : `${Lowercase<First>}${CamelToKebab<Rest>}`
  : T;

export interface StyleSink extends Record<string, Primitive | ReactiveLeaf> {
  [STYLE_SINK]?: true;
}

export type ReactiveStyles = {
  [
    K in CamelToKebab<keyof CSSStyleDeclaration & string> | `--${string}`
  ]?: string | number | ReactiveLeaf<string | number>;
};

export const style = (styles: ReactiveStyles) => {
  const styleSink = reactive(styles);
  Object.defineProperty(styleSink, STYLE_SINK, { value: true });
  return styleSink;
};

export const isStyleSink = (
  value: unknown,
): value is ReactiveStyles => {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, STYLE_SINK);
};
