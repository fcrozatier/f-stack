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

const ARRAY_LIKE_SINK = Symbol();

type ArrayLikeSink<T = any> = {
  arrayLike: ArrayLike<T>;
  mapper: (value: T, index?: number, array?: T[]) => DocumentFragment;
  [ARRAY_LIKE_SINK]?: true;
};

export const each = <T>(
  arrayLike: ArrayLike<T>,
  mapper: (value: T, index?: number, array?: T[]) => DocumentFragment,
): ArrayLikeSink<T> => {
  return {
    arrayLike,
    mapper,
    [ARRAY_LIKE_SINK]: true,
  };
};

export const isArrayLikeSink = (value: unknown): value is ArrayLikeSink => {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, ARRAY_LIKE_SINK);
};
