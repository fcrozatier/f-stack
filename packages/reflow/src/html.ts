import { listen, snapshot } from "@f-stack/functorial";
import { assert } from "@std/assert/assert";
import { assertExists } from "@std/assert/exists";
import { Boundary } from "./boundary.ts";
import {
  isAttachSink,
  isAttrSink,
  isClassSink,
  isOnSink,
  isPropSink,
  isStyleSink,
  type Sink,
} from "./sinks.ts";

type Mode = "html" | "svg" | "math";

/**
 * Type of the template tag functions
 *
 * @see {@linkcode html}
 * @see {@linkcode svg}
 * @see {@linkcode math}
 */
export type TemplateTag = (
  strings: TemplateStringsArray,
  ...sinks: Sink[]
) => DocumentFragment;

const templateCache = new WeakMap<TemplateStringsArray, Template>();

const ATTACH_SINK = "attach-🚰";
const ATTR_SINK = "attr-🚰";
const CLASSLIST_SINK = "classlist-🚰";
const ON_SINK = "on-🚰";
const PROP_SINK = "prop-🚰";
const STYLE_SINK = "style-🚰";
const BOUNDARY_SINK = "boundary-🚰";

const BOUNDARY_ELEMENT = "boundary";

let elementSinkId = 0;
let fragmentSinkId = 0;

function makeTemplateTag(mode: Mode): TemplateTag {
  return ((strings, ...sinks) => {
    const template = getTemplate(mode, strings, ...sinks);
    return template.hydrate(sinks);
  });
}

/**
 * Creates a `DocumentFragment` from the passed in template string.
 *
 * Accepts interpolated values corresponding to the different sinks.
 */
export const html: TemplateTag = makeTemplateTag("html");

export const svg: TemplateTag = makeTemplateTag("svg");

export const math: TemplateTag = makeTemplateTag("math");

function getTemplate(
  mode: Mode,
  strings: TemplateStringsArray,
  ...sinks: Sink[]
) {
  let template = templateCache.get(strings);

  if (!template) {
    let innerHTML = mode !== "html" ? `<${mode}>` : "";

    // sink id - sink index
    const elementSinks = new Map<number, number>();
    const fragmentSinks = new Map<number, number>();

    for (let index = 0; index < sinks.length; index++) {
      const string = strings[index]!;

      innerHTML += string;
      const data = sinks[index];

      if (isAttachSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${ATTACH_SINK}="${id}" `;
        elementSinks.set(id, index);
      } else if (isAttrSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${ATTR_SINK}="${id}" `;
        elementSinks.set(id, index);
      } else if (isClassSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${CLASSLIST_SINK}="${id}" `;
        elementSinks.set(id, index);
      } else if (isOnSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${ON_SINK}="${id}" `;
        elementSinks.set(id, index);
      } else if (isPropSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${PROP_SINK}="${id}" `;
        elementSinks.set(id, index);
      } else if (isStyleSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${STYLE_SINK}="${id}" `;
        elementSinks.set(id, index);
      } else {
        const id = fragmentSinkId++;
        innerHTML +=
          `<${BOUNDARY_ELEMENT} ${BOUNDARY_SINK}="${id}"></${BOUNDARY_ELEMENT}>`;
        fragmentSinks.set(id, index);
      }
    }

    innerHTML += strings[strings.length - 1];
    innerHTML += mode !== "html" ? `</${mode}>` : "";

    const templateElement = document.createElement("template");
    templateElement.innerHTML = innerHTML;

    template = new Template(
      mode,
      templateElement.content,
      elementSinks,
      fragmentSinks,
    );

    templateCache.set(strings, template);
  }

  return template;
}

class Template {
  mode: Mode;
  fragment: DocumentFragment;
  elementSinks: Map<number, number>;
  fragmentSinks: Map<number, number>;

  constructor(
    mode: Mode,
    fragment: DocumentFragment,
    elementSinks: Map<number, number>,
    fragmentSinks: Map<number, number>,
  ) {
    this.mode = mode;
    this.fragment = fragment;
    this.elementSinks = elementSinks;
    this.fragmentSinks = fragmentSinks;
  }

  hydrate(sinks: Sink[]) {
    const clone = document.importNode(this.fragment, true);
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);

    let currentElement: Element | null;
    while ((currentElement = walker.nextNode() as Element | null)) {
      if (!currentElement) break;

      if (currentElement.tagName.toLowerCase() === BOUNDARY_ELEMENT) {
        const boundaryId = currentElement.getAttribute(BOUNDARY_SINK);
        if (boundaryId !== null) {
          const index = this.fragmentSinks.get(+boundaryId);
          if (index !== undefined) {
            const sink = sinks[index];
            const start = document.createComment("");
            const end = document.createComment("");
            const boundary = new Boundary(sink);

            boundary.start = start;
            boundary.end = end;

            currentElement.replaceWith(start, end);
            boundary.render();
            walker.currentNode = end;

            continue;
          }
        }
      }

      // Attach
      const attachId = currentElement.getAttribute(ATTACH_SINK);
      if (attachId !== null) {
        const index = this.elementSinks.get(+attachId);
        if (index !== undefined) {
          const attach = sinks[index];
          assert(isAttachSink(attach));

          currentElement.removeAttribute(ATTACH_SINK);
          attach(currentElement);
        }
      }

      // Attr
      const attrId = currentElement.getAttribute(ATTR_SINK);
      if (attrId !== null) {
        const index = this.elementSinks.get(+attrId);
        if (index !== undefined) {
          const attr = sinks[index];
          assert(isAttrSink(attr));

          const element = currentElement;
          element.removeAttribute(ATTR_SINK);

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
      const classlistId = currentElement.getAttribute(CLASSLIST_SINK);
      if (classlistId !== null) {
        const index = this.elementSinks.get(+classlistId);
        if (index !== undefined) {
          const classList = sinks[index];
          assert(isClassSink(classList));

          const element = currentElement;
          element.removeAttribute(CLASSLIST_SINK);

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
                if (e.newValue) {
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
      const onId = currentElement.getAttribute(ON_SINK);
      if (onId !== null) {
        const index = this.elementSinks.get(+onId);
        if (index !== undefined) {
          const listeners = sinks[index];
          assert(isOnSink(listeners));

          const element = currentElement;
          element.removeAttribute(ON_SINK);
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
            const bound = ref.bind(currentElement);
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

      // Prop
      const propId = currentElement.getAttribute(PROP_SINK);
      if (propId !== null) {
        const index = this.elementSinks.get(+propId);
        if (index !== undefined) {
          const props = sinks[index];
          assert(isPropSink(props));

          const element = currentElement;
          element.removeAttribute(PROP_SINK);

          for (const [key, value] of Object.entries(props)) {
            // @ts-ignore key in element
            element[key] = value;
          }

          listen(props, (e) => {
            if (e.type === "relabel" || !(typeof e.path === "string")) return;
            const key = e.path.split(".")[1];
            assertExists(key);
            assert(key in element);

            switch (e.type) {
              case "create":
              case "update": {
                // @ts-ignore key in element
                element[key] = e.newValue;
                break;
              }
              case "delete":
                // @ts-ignore key in element
                element[key] = null;
                break;
            }
          });
        }
      }

      // Style
      const styleId = currentElement.getAttribute(STYLE_SINK);
      if (styleId !== null) {
        const index = this.elementSinks.get(+styleId);
        if (index !== undefined) {
          const style = sinks[index];
          assert(isStyleSink(style));
          assert(
            currentElement instanceof HTMLElement ||
              currentElement instanceof SVGElement ||
              currentElement instanceof MathMLElement,
            "expected an html, svg or mathML element",
          );

          const element = currentElement;
          element.removeAttribute(STYLE_SINK);

          for (const [key, value] of Object.entries(style)) {
            currentElement.style.setProperty(key, String(value));
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
      }
    }

    if (this.mode !== "html") {
      const wrapper = clone.firstElementChild;
      const result = document.createDocumentFragment();
      if (!wrapper) return result;
      // no `children` spreading to avoid array conversion from `HTMLCollection`
      while (wrapper.firstChild) result.append(wrapper.firstChild);
      return result;
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
