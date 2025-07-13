export type Effect = () => void;

export type Tag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

export type Component<Context> = (context?: Context) => DocumentFragment;

export type Render = <Context>(
  component: Component<Context>,
  target: Node,
) => void;
