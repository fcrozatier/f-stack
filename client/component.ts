export type { Component } from "../definitions.d.ts";

export const isComponent = (value: unknown): value is Component<any> => {
  return value instanceof Component;
};

class Component<Props extends Record<string, any>> implements Component<Props> {
  #callback: (props: Props) => DocumentFragment;
  #props: Props | undefined;

  constructor(callback: (props: Props) => DocumentFragment) {
    this.#callback = callback;
  }

  bind(props: Props) {
    this.#props = props;
    return this;
  }

  call() {
    if (!this.#props) throw new TypeError("Props are undefined");
    return this.#callback.call(null, this.#props);
  }
}

export const component = <Props extends Record<string, any>>(
  callback: (props: Props) => DocumentFragment,
) => {
  return new Component(callback);
};
