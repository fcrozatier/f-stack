export type Effect = () => void;

export type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

export type PartiallyApplicableFunction<
  Props extends Record<string, unknown>,
  R,
> =
  & ((props: Props) => R)
  & {
    partial<P extends Partial<Props>>(
      partialProps: P,
    ): PartiallyApplicableFunction<P & Omit<Props, keyof P>, R>;
  };

export type Component<Props extends Record<string, unknown>> =
  PartiallyApplicableFunction<
    Props,
    DocumentFragment
  >;

export type Render = (
  component: DocumentFragment,
  target: Node,
) => void;
