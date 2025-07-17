export type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

/**
 * `FullyBindableFunction`s have a `bindFully` property which binds all arguments, returning a nullary function, and also preserves assigned properties.
 */
export type FullyBindableFunction<
  Props extends Record<string, unknown>,
  R,
> =
  & ((props: Props) => R)
  & {
    bindFully(p: Props): () => R;
  };

export type Component<Props extends Record<string, unknown>> =
  FullyBindableFunction<Props, DocumentFragment>;

export type Render = (
  component: DocumentFragment,
  target: Node,
) => void;
