import type { Tag } from "./definitions.d.ts";
import { createEffect, isSignal } from "../client/signals.ts";

export const html: Tag = (
  strings,
  ...values
) => {
  let innerHTML = strings[0];

  for (let index = 0; index < values.length; index++) {
    const string = strings[index + 1];
    const rawValue = values[index];
    const value = isSignal(rawValue) ? rawValue.value : rawValue;
    innerHTML += `<!---->${value}<!--${index}-->${string}`;
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
      const rawValue = values[index];
      const is_signal = isSignal(rawValue);
      const value = is_signal ? rawValue.value : rawValue;
      const text = document.createTextNode(String(value));
      node.previousSibling?.replaceWith(text);

      if (is_signal) {
        createEffect(() => {
          const value = is_signal ? rawValue.value : rawValue;
          text.textContent = String(value);
        });
      }
    }
  }

  for (const comment of comments) {
    comment.remove();
  }

  return content;
};
