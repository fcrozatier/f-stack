import { listen, snapshot } from "@f-stack/functorial";
import { assert } from "@std/assert/assert";
import { assertExists } from "@std/assert/exists";
import { Boundary } from "./boundary.ts";
import {
  isAttachSink,
  isAttrSink,
  isClassSink,
  isOnSink,
  isStyleSink,
  type Sink,
} from "./sinks.ts";

/**
 * Type of the {@linkcode html} template tag
 */
export type TemplateTag = (
  strings: TemplateStringsArray,
  ...sinks: Sink[]
) => DocumentFragment;

const templateCache = new WeakMap<TemplateStringsArray, Template>();

let elementSinkId: number = 0;
let fragmentSinkId: number = 0;

/**
 * Creates a `DocumentFragment` from the passed in template string.
 *
 * Accepts interpolated values corresponding to the different sinks.
 */
export const html: TemplateTag = (strings, ...sinks) => {
  const template = getTemplate(strings, ...sinks);
  return template.hydrate(sinks);
};

function getTemplate(strings: TemplateStringsArray, ...sinks: Sink[]) {
  let template = templateCache.get(strings);

  if (!template) {
    let innerHTML = "";

    // sink id - sink index
    const elementSinks = new Map<number, number>();
    const fragmentSinks = new Map<number, number>();

    for (let index = 0; index < sinks.length; index++) {
      const string = strings[index]!;

      innerHTML += string;
      const data = sinks[index];

      if (isAttachSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` attach-🚰="${id}" `;
        elementSinks.set(id, index);
      } else if (isAttrSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` attr-🚰="${id}" `;
        elementSinks.set(id, index);
      } else if (isClassSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` classlist-🚰="${id}" `;
        elementSinks.set(id, index);
      } else if (isOnSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` on-🚰="${id}" `;
        elementSinks.set(id, index);
      } else if (isStyleSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` style-🚰="${id}" `;
        elementSinks.set(id, index);
      } else {
        const id = fragmentSinkId++;
        innerHTML += `<boundary boundary-🚰="${id}"></boundary>`;
        fragmentSinks.set(id, index);
      }
    }

    innerHTML += strings[strings.length - 1];

    const templateElement = document.createElement("template");
    templateElement.innerHTML = innerHTML;

    template = new Template(
      templateElement.content,
      elementSinks,
      fragmentSinks,
    );

    templateCache.set(strings, template);
  }

  return template;
}

class Template {
  fragment: DocumentFragment;
  elementSinks: Map<number, number>;
  fragmentSinks: Map<number, number>;

  constructor(
    fragment: DocumentFragment,
    elementSinks: Map<number, number>,
    fragmentSinks: Map<number, number>,
  ) {
    this.fragment = fragment;
    this.elementSinks = elementSinks;
    this.fragmentSinks = fragmentSinks;
  }

  hydrate(sinks: Sink[]) {
    const clone = document.importNode(this.fragment, true);
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);

    let element: Element;
    while ((element = walker.nextNode() as Element)) {
      // nextNode returns a Node | null that we keep Elements
      if (!element) break;

      if (element.tagName === "BOUNDARY") {
        const boundaryId = element.getAttribute("boundary-🚰");
        if (boundaryId !== null) {
          const index = this.fragmentSinks.get(+boundaryId);
          if (index !== undefined) {
            const sink = sinks[index];
            const start = document.createComment("");
            const end = document.createComment("");
            const boundary = new Boundary(sink);

            boundary.start = start;
            boundary.end = end;

            element.replaceWith(start, end);
            boundary.render();
            walker.currentNode = end;
          }
        }
        continue;
      }

      // Attach
      const attachId = element.getAttribute("attach-🚰");
      if (attachId !== null) {
        const index = this.elementSinks.get(+attachId);
        if (index !== undefined) {
          const attach = sinks[index];
          assert(isAttachSink(attach));

          element.removeAttribute("attach-🚰");
          attach(element);
        }
      }

      // Attr
      const attrId = element.getAttribute("attr-🚰");
      if (attrId !== null) {
        const index = this.elementSinks.get(+attrId);
        if (index !== undefined) {
          const attr = sinks[index];
          assert(isAttrSink(attr));

          element.removeAttribute("attr-🚰");

          for (const [key, value] of Object.entries(attr)) {
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

          listen(attr, (e) => {
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
      }

      // ClassList
      const classlistId = element.getAttribute("classlist-🚰");
      if (classlistId !== null) {
        const index = this.elementSinks.get(+classlistId);
        if (index !== undefined) {
          const classList = sinks[index];
          assert(isClassSink(classList));

          element.removeAttribute(`classlist-🚰`);

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
      }

      // On
      const onId = element.getAttribute("on-🚰");
      if (onId !== null) {
        const index = this.elementSinks.get(+onId);
        if (index !== undefined) {
          const listeners = sinks[index];
          assert(isOnSink(listeners));

          element.removeAttribute(`on-🚰`);

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
            const [listener, options] = Array.isArray(params)
              ? params
              : [params];
            const ref = snapshot(listener);
            const bound = ref.bind(element);
            element.addEventListener(type, bound, options);
            elementListeners.set(ref, bound);
          };

          const removeListener = (
            type: string,
            params: ListenerParams,
          ) => {
            const [listener, options] = Array.isArray(params)
              ? params
              : [params];
            const ref = snapshot(listener);
            const bound = elementListeners.get(ref);
            element.removeEventListener(type, bound, options);
            elementListeners.delete(ref);
          };

          for (const [key, val] of Object.entries(listeners)) {
            addListener(key, val as ListenerParams);
          }

          listen(listeners, (e) => {
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
      }

      // Style
      const styleId = element.getAttribute("style-🚰");
      if (styleId !== null) {
        const index = this.elementSinks.get(+styleId);
        if (index !== undefined) {
          const style = sinks[index];
          assert(isStyleSink(style));
          assert(
            element instanceof HTMLElement ||
              element instanceof SVGElement ||
              element instanceof MathMLElement,
            "expected an html, svg or mathML element",
          );

          element.removeAttribute(`style-🚰`);

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
                (element as HTMLElement).style.setProperty(key, e.newValue);
                break;
              }
              case "delete":
                (element as HTMLElement).style.removeProperty(key);
                break;
            }
          });
        }
      }
    }

    return clone;
  }
}

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
