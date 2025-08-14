import { effect } from "./reactivity/signals.ts";
import type { TemplateTag } from "../definitions.d.ts";
import { assertExists } from "./assert.ts";
import {
  type Attachment,
  type AttrSink,
  isAttachment,
  isAttrSink,
} from "./sinks.ts";
import { Boundary } from "./Boundary.ts";
import { nanoId } from "./utils.ts";
import { addListener } from "./reactivity/reactive.ts";

export const html: TemplateTag = (strings, ...values) => {
  let innerHTML = "";

  const boundaries = new Map<number, Boundary>();
  const attachments = new Map<string, Attachment>();
  const attributes = new Map<string, AttrSink>();

  for (let index = 0; index < values.length; index++) {
    const string = strings[index]!;

    innerHTML += string;
    const data = values[index];

    if (isAttrSink(data)) {
      const id = nanoId();
      attributes.set(id, data);

      innerHTML += ` attr-${id} `;
    } else if (isAttachment(data)) {
      const id = nanoId();
      attachments.set(id, data);

      innerHTML += ` attachment-${id} `;
    } else {
      const boundary = new Boundary(data);
      boundaries.set(boundary.id, boundary);

      innerHTML += String(boundary);
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
    const boundary = boundaries.get(id);

    // The boundary is managed elsewhere
    if (!boundary) continue;

    if (!match.groups.end) {
      boundary.start = comment;
      continue;
    }

    boundary.end = comment;
    boundary.render();
  }

  for (const [id, attachment] of attachments.entries()) {
    const element = content.querySelector(`[attachment-${id}]`);
    assertExists(element, `No element found with attachement id ${id}`);

    element.removeAttribute(`attachment-${id}`);
    effect(() => {
      attachment(element);
    });
  }

  for (const [id, attribute] of attributes.entries()) {
    const element = content.querySelector(`[attr-${id}]`);
    assertExists(element, `No element found with attribute attr-${id}`);

    element.removeAttribute(`attr-${id}`);

    for (const [key, val] of Object.entries(attribute)) {
      if (booleanAttributes.includes(key)) {
        if (val) {
          element.setAttribute(key, "");
        } else {
          element.removeAttribute(key);
        }
      } else {
        element.setAttribute(key, String(val));
      }
    }

    console.log("add listener");
    addListener(attribute, (e) => {
      if (!(typeof e.path === "string")) return;
      const key = e.path.slice(1);

      switch (e.type) {
        case "create":
        case "update": {
          const value = e.value;
          if (booleanAttributes.includes(key) && value) {
            element.setAttribute(key, "");
          } else {
            element.setAttribute(key, String(value));
          }
          break;
        }
        case "delete":
          element.removeAttribute(key);
          break;
      }
    });
  }

  return content;
};

/**
 * All the HTML boolean attributes
 */
export const booleanAttributes = [
  "allowfullscreen", // on <iframe>
  "async", // on <script>
  "autofocus", // on <button>, <input>, <select>, <textarea>
  "autoplay", // on <audio>, <video>
  "checked", // on <input type="checkbox">, <input type="radio">
  "controls", // on <audio>, <video>
  "default", // on <track>
  "defer", // on <script>
  "disabled", // on form elements like <button>, <fieldset>, <input>, <optgroup>, <option>,<select>, <textarea>
  "formnovalidate", // on <button>, <input type="submit">
  "hidden", // global
  "inert", // global
  "ismap", // on <img>
  "itemscope", // global; part of microdata
  "loop", // on <audio>, <video>
  "multiple", // on <input type="file">, <select>
  "muted", // on <audio>, <video>
  "nomodule", // on <script>
  "novalidate", // on <form>
  "open", // on <details>
  "readonly", // on <input>, <textarea>
  "required", // on <input>, <select>, <textarea>
  "reversed", // on <ol>
  "selected", // on <option>
];
