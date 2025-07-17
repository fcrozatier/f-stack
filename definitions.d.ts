import type { Component } from "./client/component.ts";

export type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

export type Render = (
  component: Component<any>,
  target: Node,
) => void;
