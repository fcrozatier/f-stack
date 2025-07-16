import { createEffect, isSignal } from "../client/signals.ts";
import { isComponent } from "./component.ts";
import type { TemplateTag } from "../definitions.d.ts";
import { assertExists } from "./assert.ts";

export const html: TemplateTag = (
  strings,
  ...values
) => {
  assertExists(strings[0]);
  let innerHTML: string = strings[0];

  for (let index = 0; index < values.length; index++) {
    const string = strings[index + 1];
    const rawValue = values[index];

    if (isSignal(rawValue) || isComponent(rawValue)) {
      innerHTML += `<!----><!--${index}-->${string}`;
    } else {
      innerHTML += `${rawValue}${string}`;
    }
  }

  const template = document.createElement("template");
  template.innerHTML = innerHTML;
  const content = template.content;

  const tw = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT);
  let comment: Comment;

  const comments: Comment[] = [];

  while ((comment = tw.nextNode() as Comment)) {
    comments.push(comment);
    const data = comment.data;

    if (!data) continue;

    const match = /^(\d+)$/.exec(data);

    if (data && match) {
      const index = Number(match[0]);
      const rawValue = values[index];

      if (isSignal(rawValue)) {
        const text = document.createTextNode("");
        comment.before(text);

        createEffect(() => {
          const data = String(rawValue.value);
          text.textContent = data;
        });
      } else if (isComponent(rawValue)) {
        const fragments = rawValue();
        comment.before(fragments);
      }
    }
  }

  for (const comment of comments) {
    comment.remove();
  }

  return content;
};
