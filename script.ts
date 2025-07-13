import { Counter } from "./components/Counter.ts";
import { createEffect, createSignal } from "./signals.ts";

type Tag<T> = (
  strings: TemplateStringsArray,
  ...values: T[]
) => DocumentFragment;

export type Component<Context> = (context?: Context) => DocumentFragment;

type Render = <Context>(component: Component<Context>, target: Node) => void;

export const html: Tag<(ReturnType<typeof createSignal<number>>)> = (
  strings,
  ...values
) => {
  let innerHTML = strings[0];

  for (let index = 0; index < values.length; index++) {
    const string = strings[index + 1];
    const signal = values[index];
    innerHTML += `<!---->${signal.value}<!--${index}-->${string}`;
  }

  const template = document.createElement("template");
  template.innerHTML = innerHTML;
  const content = template.content;

  const tw = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT);
  let node: Comment;

  const comments: Comment[] = [];

  while ((node = tw.nextNode() as Comment)) {
    comments.push(node);
    const data = node.data;

    if (!data) continue;

    const match = /^(\d+)$/.exec(data);

    if (data && match) {
      const index = Number(match[0]);
      const signal = values[index];
      const text = document.createTextNode(signal.value.toString());
      node.previousSibling?.replaceWith(text);

      createEffect(() => {
        const signal = values[index];
        text.textContent = signal.value.toString();
      });
    }
  }

  for (const comment of comments) {
    comment.remove();
  }

  return content;
};

const render: Render = (component, target) => {
  target.appendChild(component());
};

render(Counter, document.body);
