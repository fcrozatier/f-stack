import { addListener, isReactive, snapshot } from "$functorial/reactive.ts";
import { nanoId } from "$functorial/utils.ts";
import { assert } from "@std/assert/assert";
import { assertExists } from "@std/assert/exists";
import { Boundary } from "./boundary.ts";
import {
  type Attachment,
  type AttrSink,
  type ClassListValue,
  isAttachment,
  isAttrSink,
  isClassSink,
  isOnSink,
  isStyleSink,
  type On,
  type ReactiveStyles,
} from "./sinks.ts";

export type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

export const html: TemplateTag = (strings, ...values) => {
  let innerHTML = "";

  const boundaries = new Map<number, Boundary>();
  const attachments = new Map<string, Attachment>();
  const listeners = new Map<string, On>();
  const attributes = new Map<string, AttrSink>();
  const classLists = new Map<string, ClassListValue>();
  const styles = new Map<string, ReactiveStyles>();

  for (let index = 0; index < values.length; index++) {
    const string = strings[index]!;

    innerHTML += string;
    const data = values[index];

    const id = nanoId();
    if (isAttrSink(data)) {
      attributes.set(id, data);

      innerHTML += ` attr-${id} `;
    } else if (isOnSink(data)) {
      listeners.set(id, data);

      innerHTML += ` on-${id} `;
    } else if (isClassSink(data)) {
      classLists.set(id, data);

      innerHTML += ` class-${id} `;
    } else if (isStyleSink(data)) {
      styles.set(id, data);

      innerHTML += ` style-${id} `;
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

  // Attachements
  for (const [id, attachment] of attachments.entries()) {
    const element = content.querySelector(`[attachment-${id}]`);
    assertExists(element, `No element found with attachement id ${id}`);

    element.removeAttribute(`attachment-${id}`);
    attachment(element);
  }

  // Listeners
  for (const [id, maybeReactive] of listeners.entries()) {
    const element = content.querySelector(`[on-${id}]`);
    assertExists(element, `No element found with attribute on-${id}`);
    assert(
      element instanceof HTMLElement,
      `No element found with attribute on-${id}`,
    );

    element.removeAttribute(`on-${id}`);
    const elementListeners = new WeakMap();

    for (const [key, val] of Object.entries(maybeReactive)) {
      if (Array.isArray(val)) {
        const [listener, options] = val;
        const bound = snapshot(listener).bind(element);
        elementListeners.set(listener, bound);
        element.addEventListener(key, bound, options);
      } else {
        const bound = snapshot(val).bind(element);
        elementListeners.set(val, bound);
        element.addEventListener(key, bound);
      }
    }

    addListener(maybeReactive, (e) => {
      if (e.type === "relabel" || !(typeof e.path === "string")) return;
      const key = e.path.split(".")[1];
      assertExists(key);

      switch (e.type) {
        case "create": {
          const newValue = e.newValue;

          if (Array.isArray(newValue)) {
            const [listener, options] = newValue;
            const bound = snapshot(listener).bind(element);
            elementListeners.set(listener, bound);
            element.addEventListener(key, bound, options);
          } else {
            const bound = snapshot(newValue).bind(element);
            elementListeners.set(newValue, bound);
            element.addEventListener(key, bound);
          }
          break;
        }
        case "update": {
          const oldValue = e.oldValue;
          const newValue = e.newValue;

          if (Array.isArray(oldValue)) {
            const [listener, options] = oldValue;
            const bound = elementListeners.get(listener);
            element.removeEventListener(key, bound, options);
          } else {
            const bound = elementListeners.get(oldValue);
            element.removeEventListener(key, bound);
          }

          if (Array.isArray(newValue)) {
            const [listener, options] = newValue;
            const bound = snapshot(listener).bind(element);
            elementListeners.set(listener, bound);
            element.addEventListener(key, bound, options);
          } else {
            const bound = snapshot(newValue).bind(element);
            elementListeners.set(newValue, bound);
            element.addEventListener(key, bound);
          }
          break;
        }
        case "delete": {
          const oldValue = e.oldValue;

          if (Array.isArray(oldValue)) {
            const [listener, options] = oldValue;
            const bound = elementListeners.get(listener);
            element.removeEventListener(key, bound, options);
            elementListeners.delete(listener);
          } else {
            const bound = elementListeners.get(oldValue);
            element.removeEventListener(key, bound);
            elementListeners.delete(oldValue);
          }
          break;
        }
      }
    });
  }

  // Attributes
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
      if (e.type === "relabel" || !(typeof e.path === "string")) return;
      const key = e.path.split(".")[1];
      assertExists(key);

      switch (e.type) {
        case "create":
        case "update": {
          const value = e.newValue;
          if (booleanAttributes.includes(key)) {
            if (value) {
              element.setAttribute(key, "");
            } else {
              element.removeAttribute(key);
            }
            if (
              nonReflectedAttributes
                // @ts-ignore element has the constructor property
                .get(element.constructor)?.includes(key)
            ) {
              // @ts-ignore element has property [key]
              element[key] = Boolean(value);
            }
          } else {
            element.setAttribute(key, String(value));

            if (
              nonReflectedAttributes
                // @ts-ignore element has the constructor property
                .get(element.constructor)?.includes(key)
            ) {
              // @ts-ignore element has property [key]
              element[key] = value;
            }
          }
          break;
        }
        case "delete":
          element.removeAttribute(key);
          break;
      }
    });
  }

  // ClassList
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
      if (e.type === "relabel" || !(typeof e.path === "string")) return;
      const key = e.path.split(".")[1];
      assertExists(key);

      const classes = key.split(" ");

      switch (e.type) {
        case "create":
        case "update": {
          const value = e.newValue;

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

  // Style
  for (const [id, style] of styles.entries()) {
    const element = content.querySelector(`[style-${id}]`);
    assert(
      element instanceof HTMLElement ||
        element instanceof SVGElement ||
        element instanceof MathMLElement,
      "expected an html, svg or mathML element",
    );
    assertExists(element, `No element found with attribute style-${id}`);

    element.removeAttribute(`style-${id}`);

    for (const [key, val] of Object.entries(style)) {
      const value = val && isReactive(val) && "value" in val ? val.value : val;

      element.style.setProperty(key, String(value));
    }

    addListener(style, (e) => {
      if (e.type === "relabel" || !(typeof e.path === "string")) return;
      const key = e.path.split(".")[1];
      assertExists(key);

      switch (e.type) {
        case "create":
        case "update": {
          element.style.setProperty(key, e.newValue);
          break;
        }
        case "delete":
          element.style.removeProperty(key);
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

const nonReflectedAttributes = new Map([
  [HTMLInputElement, ["value", "checked"]],
]);
