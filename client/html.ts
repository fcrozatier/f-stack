import type { TemplateTag } from "../definitions.d.ts";
import { assertExists } from "./assert.ts";
import { Boundary } from "./Boundary.ts";
import { addListener } from "./reactivity/reactive.ts";
import { effect } from "./reactivity/signals.ts";
import {
  type Attachment,
  type AttrSink,
  type ClassListValue,
  isAttachment,
  isAttrSink,
  isClassSink,
} from "./sinks.ts";
import { nanoId } from "./utils.ts";

export const html: TemplateTag = (strings, ...values) => {
  let innerHTML = "";

  const boundaries = new Map<number, Boundary>();
  const attachments = new Map<string, Attachment>();
  const attributes = new Map<string, AttrSink>();
  const classLists = new Map<string, ClassListValue>();

  for (let index = 0; index < values.length; index++) {
    const string = strings[index]!;

    innerHTML += string;
    const data = values[index];

    const id = nanoId();
    if (isAttrSink(data)) {
      attributes.set(id, data);

      innerHTML += ` attr-${id} `;
    } else if (isClassSink(data)) {
      classLists.set(id, data);

      innerHTML += ` class-${id} `;
    } else if (isAttachment(data)) {
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
      const value = val && typeof val === "object" ? val.value : val;

      if (booleanAttributes.includes(key)) {
        if (value) {
          element.setAttribute(key, "");
        } else {
          element.removeAttribute(key);
        }
      } else {
        element.setAttribute(key, String(value));
      }
    }

    addListener(attribute, (e) => {
      if (!(typeof e.path === "string")) return;
      const key = e.path.split(".")[1];
      assertExists(key);

      switch (e.type) {
        case "create":
        case "update": {
          const value = e.value;
          if (booleanAttributes.includes(key)) {
            if (value) {
              element.setAttribute(key, "");
            } else {
              element.removeAttribute(key);
            }
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

  for (const [id, classList] of classLists.entries()) {
    const element = content.querySelector(`[class-${id}]`);
    assertExists(element, `No element found with attribute class-${id}`);

    element.removeAttribute(`class-${id}`);

    for (const [key, val] of Object.entries(classList)) {
      const value = val && typeof val === "object" ? val.value : val;
      const classes = key.split(" ");

      if (value) {
        element.classList.add(...classes);
      } else {
        element.classList.remove(...classes);
      }
    }

    addListener(classList, (e) => {
      if (!(typeof e.path === "string")) return;
      const key = e.path.split(".")[1];
      assertExists(key);

      const classes = key.split(" ");

      switch (e.type) {
        case "create":
        case "update": {
          const value = e.value;

          if (value) {
            element.classList.add(...classes);
          } else {
            element.classList.remove(...classes);
          }

          break;
        }
        case "delete":
          element.classList.remove(...classes);
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
