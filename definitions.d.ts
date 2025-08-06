export type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

type Page = () => DocumentFragment;

export type Render = (
  component: Page,
  target: Node,
) => void;
