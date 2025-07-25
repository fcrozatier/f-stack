import { effect, isSignal } from "../client/signals.ts";
import type { TemplateTag } from "../definitions.d.ts";
import { assertExists } from "./assert.ts";
import { type Attachment, isAttachment } from "./attachement.ts";
import { Boundary } from "./Boundary.ts";
import { isComponent } from "./component.ts";
import { nanoId } from "./utils.ts";

export const html: TemplateTag = (
  strings,
  ...values
) => {
  let innerHTML = "";

  const boundariesMap = new Map<number, Boundary>();
  const attachmentsMap = new Map<string, Attachment>();

  for (let index = 0; index < values.length; index++) {
    const string = strings[index]!;

    innerHTML += string;
    const data = values[index];

    if (isAttachment(data)) {
      const id = nanoId();
      attachmentsMap.set(id, data);

      innerHTML += ` attachment-${id} `;
    } else if (
      isSignal(data) ||
      isComponent(data) ||
      typeof data === "function"
    ) {
      const boundary = new Boundary(data);
      boundariesMap.set(boundary.id, boundary);

      innerHTML += String(boundary);
    } else {
      innerHTML += String(data);
    }
  }

  innerHTML += strings[strings.length - 1];
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

    if (!match.groups.end) {
      boundary.start = comment;
      continue;
    }

    boundary.end = comment;
    boundary.render();
  }

  for (const [id, attachment] of attachmentsMap.entries()) {
    const element = content.querySelector(`[attachment-${id}]`);
    assertExists(element, `No element found with attachement id ${id}`);

    element.removeAttribute(`attachment-${id}`);
    effect(() => {
      attachment(element);
    });
  }

  return content;
};
