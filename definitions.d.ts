export type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

export interface Component<Props extends Record<string, any>> {
  bind(props: Props): Component<Props>;
  call(): DocumentFragment;
}

export type Render = (
  component: Component<any>,
  target: Node,
) => void;
