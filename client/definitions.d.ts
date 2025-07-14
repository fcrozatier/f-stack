export type Effect = () => void;

export type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

export interface Component {
  (...props: any[]): DocumentFragment;
  partial: (...props: any[]) => Component;
}

export type Render = (
  component: DocumentFragment,
  target: Node,
) => void;
