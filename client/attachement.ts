import { type Signal } from "./signals.ts";

export interface Attachment<T extends Node = Element> {
  (element: T): void | (() => void);
}

export class Attachment<T extends Node> extends Function {
  constructor(fn: Attachment<T>) {
    super();
    return Object.setPrototypeOf(fn, new.target.prototype);
  }
}

export const attach = <T extends Node>(attachment: Attachment<T>) => {
  return new Attachment(attachment);
};

export const isAttachment = (value: unknown): value is Attachment => {
  return value instanceof Attachment;
};

const isUnsafe = Symbol();

type UnsafeHTML = {
  unsafe: string | Signal<string>;
  [isUnsafe]: boolean;
};

export const unsafeHTML = (unsafe: string | Signal<string>): UnsafeHTML => {
  return {
    unsafe,
    [isUnsafe]: true,
  };
};

export const isUnsafeHTML = (value: unknown): value is UnsafeHTML => {
  return typeof value === "object" && value !== null && isUnsafe in value;
};
