import type { PartialArgs } from "../partial.ts";
import type { Component } from "./definitions.d.ts";

const componentBrand = Symbol();

export const isComponent = (value: unknown): value is Component => {
  if (typeof value === "function" && componentBrand in value) return true;
  return false;
};

export const createComponent = <A extends any[]>(
  component: (...args: A) => DocumentFragment,
): Component => {
  Object.defineProperty(component, componentBrand, { enumerable: true });
  Object.defineProperty(component, "partial", {
    enumerable: true,
    value: (...args: PartialArgs<A>) => {
      // @ts-ignore should be fine
      const bound = component.bind(null, ...args);
      Object.assign(bound, component);
      return bound;
    },
  });

  return component as Component;
};
