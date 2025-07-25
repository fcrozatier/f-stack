export type { Component } from "../definitions.d.ts";

export const isComponent = (value: unknown): value is Component<any> => {
  return value instanceof Component;
};

class Component<Props extends Record<string, any> | undefined = undefined>
  implements Component<Props> {
  #callback: (props: Props) => DocumentFragment;
  #props!: Props;

  constructor(callback: (props: Props) => DocumentFragment) {
    this.#callback = callback;
  }

  bind(props: Props) {
    this.#props = props;
    return this;
  }

  call() {
    return this.#callback.call(null, this.#props);
  }
}

export const component = <
  Props extends Record<string, any> | undefined = undefined,
>(
  callback: (props: Props) => DocumentFragment,
) => {
  return new Component<Props>(callback);
};
