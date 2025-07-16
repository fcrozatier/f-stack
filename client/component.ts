import { withBindFully } from "./bindFully.ts";
import type { Component } from "../definitions.d.ts";

const componentBrand = Symbol();

export const isComponent = (
  value: unknown,
): value is () => DocumentFragment => {
  if (typeof value === "function" && componentBrand in value) return true;
  return false;
};

export const createComponent = <
  Props extends Record<string, unknown>,
>(
  component: (props: Props) => DocumentFragment,
): Component<Props> => {
  Object.assign(component, { [componentBrand]: true });

  return withBindFully(component);
};

// Components look like a generic class, with a method bind, and tracking their own state, like whether it has been bound, they're also not called directly
