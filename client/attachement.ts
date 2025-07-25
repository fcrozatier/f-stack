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
