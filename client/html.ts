import { effect, isSignal } from "../client/signals.ts";
import type { TemplateTag } from "../definitions.d.ts";
import { assertExists } from "./assert.ts";
import { Boundary } from "./Boundary.ts";
import { isComponent } from "./component.ts";

export const html: TemplateTag = (
  strings,
  ...values
) => {
  assertExists(strings[0]);
  let innerHTML: string = strings[0];

  const boundariesMap = new Map<number, Boundary<any>>();

  for (let index = 0; index < values.length; index++) {
    const string = strings[index + 1];
    const data = values[index];

    if (
      isSignal(data) ||
      isComponent(data) ||
      typeof data === "function"
    ) {
      const boundary = new Boundary(data);
      boundariesMap.set(boundary.id, boundary);

      innerHTML += `${boundary}${string}`;
    } else {
      innerHTML += `${data}${string}`;
    }
  }

  const template = document.createElement("template");
  template.innerHTML = innerHTML;
  const content = template.content;

  const tw = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT);
  let comment: Comment;

  while ((comment = tw.nextNode() as Comment)) {
    const match = /^<(?<end>\/?)(?<id>\d+)>$/.exec(comment.data);

    // Unrelated comment
    if (!match || !match.groups?.id) continue;

    const id = Number(match.groups.id);
    const boundary = boundariesMap.get(id);

    // The boundary is managed elsewhere
    if (!boundary) continue;

    if (match.groups.end) boundary.setEnd(comment);
    else {
      boundary.setStart(comment);
      continue;
    }

    const data = boundary.data;

    if (isSignal(data)) {
      if (!(data.value instanceof DocumentFragment)) {
        const text = document.createTextNode("");
        comment.before(text);

        effect(() => {
          text.textContent = String(data.value);
        });
      } else {
        // ... setup a node group, the inner html`` template will manage its reactivity
        // cleanup the whole group when needed
      }
    } else if (isComponent(data)) {
      const fragments = data.call();
      comment.before(fragments);
    }
  }

  return content;
};
