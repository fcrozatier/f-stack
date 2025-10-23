import { listen, snapshot } from "@f-stack/functorial";
import { assert } from "@std/assert/assert";
import { assertExists } from "@std/assert/exists";
import { Boundary } from "./boundary.ts";
import {
  type AttachSink,
  type AttrSink,
  type ClassListSink,
  isAttachSink,
  isAttrSink,
  isClassSink,
  isOnSink,
  isStyleSink,
  type On,
  type StyleSink,
} from "./sinks.ts";
import { nanoId } from "./utils.ts";

/**
 * Type of the {@linkcode html} template tag
 */
export type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => DocumentFragment;

/**
 * Creates a `DocumentFragment` from the passed in template string.
 *
 * Accepts interpolated values corresponding to the different sinks.
 */
export const html: TemplateTag = (strings, ...values) => {
  let innerHTML = "";

  const boundaries = new Map<number, Boundary>();
  const attachments = new Map<string, AttachSink>();
  const listeners = new Map<string, On>();
  const attributes = new Map<string, AttrSink>();
  const classLists = new Map<string, ClassListSink>();
  const styles = new Map<string, StyleSink>();

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
    } else if (isAttachSink(data)) {
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

    type ListenerParams =
      | EventListener
      | [
        EventListener,
        options?: boolean | AddEventListenerOptions,
      ];

    const addListener = (
      type: string,
      params: ListenerParams,
    ) => {
      const [listener, options] = Array.isArray(params) ? params : [params];
      const ref = snapshot(listener);
      const bound = ref.bind(element);
      element.addEventListener(type, bound, options);
      elementListeners.set(ref, bound);
    };

    const removeListener = (
      type: string,
      params: ListenerParams,
    ) => {
      const [listener, options] = Array.isArray(params) ? params : [params];
      const ref = snapshot(listener);
      const bound = elementListeners.get(ref);
      element.removeEventListener(type, bound, options);
      elementListeners.delete(ref);
    };

    for (const [key, val] of Object.entries(maybeReactive)) {
      addListener(key, val as ListenerParams);
    }

    listen(maybeReactive, (e) => {
      if (e.type === "relabel" || !(typeof e.path === "string")) return;
      const key = e.path.split(".")[1];
      assertExists(key);

      switch (e.type) {
        case "create": {
          const newValue = e.newValue;
          addListener(key, newValue);
          break;
        }
        case "update": {
          const oldValue = e.oldValue;
          const newValue = e.newValue;

          removeListener(key, oldValue);
          addListener(key, newValue);
          break;
        }
        case "delete": {
          const oldValue = e.oldValue;
          removeListener(key, oldValue);
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

    for (const [key, value] of Object.entries(attribute)) {
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

    listen(attribute, (e) => {
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
            if (isNonReflectedAttribute(element, key)) {
              // @ts-ignore element has property [key]
              element[key] = Boolean(value);
            }
          } else {
            element.setAttribute(key, String(value));

            if (isNonReflectedAttribute(element, key)) {
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

    for (const [key, value] of Object.entries(classList)) {
      const classes = key.split(" ");

      if (value) {
        element.classList.add(...classes);
      } else {
        element.classList.remove(...classes);
      }
    }

    listen(classList, (e) => {
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

    for (const [key, value] of Object.entries(style)) {
      element.style.setProperty(key, String(value));
    }

    listen(style, (e) => {
      if (e.type === "relabel" || (typeof e.path !== "string")) return;
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

function isNonReflectedAttribute(element: Element, key: string) {
  return element instanceof HTMLInputElement &&
    ["value", "checked"].includes(key);
}
