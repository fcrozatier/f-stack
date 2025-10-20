import {
  isReactiveLeaf,
  reactive,
  type ReactiveLeaf,
} from "@f-stack/functorial";
import type { Primitive } from "@f-stack/functorial/utils.ts";

// attach

const ATTACHMENT_SINK = Symbol.for("attachment sink");

export interface Attachment<T extends Node = Element> {
  (element: T): void | (() => void);
  [ATTACHMENT_SINK]?: true;
}

export const attach = <T extends Node>(attachment: Attachment<T>) => {
  const attachmentSink = reactive(attachment);
  Object.defineProperty(attachmentSink, ATTACHMENT_SINK, { value: true });
  return attachmentSink;
};

export const isAttachment = (value: unknown): value is Attachment => {
  return typeof value === "function" && Object.hasOwn(value, ATTACHMENT_SINK);
};

// attr

const ATTR_SINK = Symbol.for("attr sink");

export interface AttrSink extends Record<string, Primitive | ReactiveLeaf> {
  [ATTR_SINK]?: true;
}

export const attr = (attributes: AttrSink) => {
  const attrSink = reactive(attributes);
  Object.defineProperty(attrSink, ATTR_SINK, { value: true });
  return attrSink;
};

export const isAttrSink = (value: unknown): value is AttrSink => {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, ATTR_SINK);
};

// classList

const CLASS_SINK = Symbol.for("class sink");

export interface ClassSink extends Record<string, Primitive | ReactiveLeaf> {
  [CLASS_SINK]?: true;
}

export type ClassListValue = Record<
  string,
  boolean | null | undefined | ReactiveLeaf
>;

export const classList = (classes: ClassListValue) => {
  const classSink = reactive(classes);
  Object.defineProperty(classSink, CLASS_SINK, { value: true });
  return classSink;
};

export const isClassSink = (value: unknown): value is ClassListValue => {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, CLASS_SINK);
};

// map

const MAP_SINK = Symbol.for("map sink");

export type MapSink<T = any> = {
  values: T[];
  mapper: (reactive: { value: T; index: number }) => DocumentFragment;
  [MAP_SINK]?: true;
};

export const map = <T>(
  values: T[],
  mapper: (reactive: { value: T; index: number }) => DocumentFragment,
): MapSink<T> => {
  return {
    values,
    mapper,
    [MAP_SINK]: true,
  };
};

export const isArraySink = (value: unknown): value is MapSink => {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, MAP_SINK);
};

// on

const ON_SINK = Symbol.for("on sink");

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
  const onSink = reactive(listeners);
  Object.defineProperty(onSink, ON_SINK, { value: true });
  return onSink;
};

export const isOnSink = (value: unknown): value is On => {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, ON_SINK);
};

// show

const SHOW_SINK = Symbol.for("show sink");

type ShowSink = {
  cond: boolean;
  ifCase: () => DocumentFragment | ReactiveLeaf | Primitive;
  elseCase?:
    | (() => DocumentFragment | ReactiveLeaf | Primitive)
    | undefined;
  [SHOW_SINK]: true;
};

export const show = (
  condition: () => boolean,
  ifCase: () => DocumentFragment | ReactiveLeaf | Primitive,
  elseCase?:
    | (() => DocumentFragment | ReactiveLeaf | Primitive)
    | undefined,
): ShowSink => {
  return reactive({
    get cond() {
      return condition();
    },
    ifCase,
    elseCase,
    [SHOW_SINK]: true,
  });
};

export const isShowSink = (value: unknown): value is ShowSink => {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, SHOW_SINK);
};

// style

/**
 * CSS Typed Object Model is not implemented in Firefox
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

// text

const TEXT_SINK = Symbol.for("text sink");

export interface TextSink {
  data: Record<string, any>;
  key: string;
  [TEXT_SINK]?: true;
}

export const text = <T extends Record<string, any>>(
  node: T,
  key: keyof T & string = "value",
): TextSink => {
  return { data: node, key, [TEXT_SINK]: true };
};

export const isTextSink = (value: unknown): value is TextSink => {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, TEXT_SINK);
};

// unsafe

const UNSAFE_SINK = Symbol.for("unsafe sink");

interface UnsafeHTML extends ReactiveLeaf<string> {
  [UNSAFE_SINK]?: true;
}

export const unsafeHTML = (
  unsafe: string | ReactiveLeaf<string>,
): UnsafeHTML => {
  const unsafeSink = typeof unsafe === "string" || !isReactiveLeaf(unsafe)
    ? reactive({ value: unsafe })
    : unsafe;
  Object.defineProperty(unsafeSink, UNSAFE_SINK, { value: true });
  return unsafeSink;
};

export const isUnsafeHTML = (value: unknown): value is UnsafeHTML => {
  return typeof value === "object" &&
    value !== null &&
    Object.hasOwn(value, UNSAFE_SINK);
};
