import { withPartial } from "./partial.ts";
import type { Component } from "../definitions.d.ts";

const componentBrand = Symbol();

export const isComponent = (
  value: unknown,
): value is Component<Record<string, unknown>> => {
  if (typeof value === "function" && componentBrand in value) return true;
  return false;
};

export const createComponent = <
  Props extends Record<string, unknown>,
>(
  component: (props: Props) => DocumentFragment,
): Component<Props> => {
  Object.assign(component, { [componentBrand]: true });

  return withPartial(component);
};
