// @ts-self-types="./types.d.ts"

import { listen, snapshot } from "@f-stack/functorial";
import { Boundary } from "./boundary.js";
import {
  isAttachSink,
  isAttrSink,
  isClassSink,
  isOnSink,
  isPropSink,
  isStyleSink,
} from "./sinks.js";

/**
 * @import {Sink, TemplateTag} from "./types.d.ts"
 */

/**
 * Makes an assertion and throws if `expr` does not have a truthy value.
 *
 * @param {unknown} expr The expression to test.
 * @param msg The optional message to display if the assertion fails.
 * @return {asserts expr}
 */
function assert(expr, msg = "") {
  if (!expr) throw new Error(msg);
}

/**
 * Makes an assertion that `actual` is not null or undefined.
 * If not then throws.
 *
 * @template T
 * @param {T} actual The actual value to check.
 * @param {string} [msg] The optional message to include in the error if the assertion fails.
 * @return {asserts actual is NonNullable<T>}
 */
function assertExists(actual, msg) {
  if (actual === undefined || actual === null) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    msg =
      `Expected actual: "${actual}" to not be null or undefined${msgSuffix}`;
    throw new Error(msg);
  }
}

/**
 * @type {WeakMap<TemplateStringsArray, Template>}
 */
const templateCache = new WeakMap();

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

/**
 * @typedef {"html" | "svg" | "math"} Mode
 */

/**
 * @param {Mode} mode
 * @returns {TemplateTag}
 */
function makeTemplateTag(mode) {
  return (strings, ...sinks) => {
    const template = getTemplate(mode, strings, ...sinks);
    return template.hydrate(sinks);
  };
}

/**
 * The `HTML` template tag
 *
 * @type {TemplateTag}
 */
export const html = makeTemplateTag("html");

/**
 * The `SVG` template tag
 *
 * @type {TemplateTag}
 */
export const svg = makeTemplateTag("svg");

/**
 * The `MathML` template tag
 *
 * @type {TemplateTag}
 */
export const math = makeTemplateTag("math");

/**
 * @param {Mode} mode
 * @param {TemplateStringsArray} strings
 * @param {...Sink} sinks
 */
function getTemplate(mode, strings, ...sinks) {
  let template = templateCache.get(strings);

  if (!template) {
    let innerHTML = mode !== "html" ? `<${mode}>` : "";

    // sink id - sink index
    /**
     * @type {Map<number, number>}
     */
    const elementSinks = new Map();

    /**
     * @type {Map<number, number>}
     */
    const fragmentSinks = new Map();

    for (let index = 0; index < sinks.length; index++) {
      const string = strings[index];

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
  /**  @type {Mode}   */
  mode;

  /** @type {DocumentFragment} */
  fragment;

  /** @type {Map<number, number>} */
  elementSinks;

  /** @type {Map<number, number>} */
  fragmentSinks;

  /**
   * @param {Mode} mode
   * @param {DocumentFragment} fragment
   * @param {Map<number, number>} elementSinks
   * @param {Map<number, number>} fragmentSinks
   */
  constructor(
    mode,
    fragment,
    elementSinks,
    fragmentSinks,
  ) {
    this.mode = mode;
    this.fragment = fragment;
    this.elementSinks = elementSinks;
    this.fragmentSinks = fragmentSinks;
  }

  /**
   * @param {Sink[]} sinks
   */
  hydrate(sinks) {
    const clone = document.importNode(this.fragment, true);
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);

    /**
     * @type {Element|null}
     */
    let currentElement;
    while (
      (currentElement = /** @type {Element | null} */ (walker.nextNode()))
    ) {
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

          /**
           * @typedef {  EventListener | [EventListener,options?: boolean | AddEventListenerOptions]} ListenerParams
           */

          /**
           * @param {string} type
           * @param {ListenerParams} params
           */
          const addListener = (type, params) => {
            const [listener, options] = Array.isArray(params)
              ? params
              : [params];
            const ref = snapshot(listener);
            const bound = ref.bind(currentElement);
            element.addEventListener(type, bound, options);
            elementListeners.set(ref, bound);
          };

          /**
           * @param {string} type
           * @param {ListenerParams} params
           */
          const removeListener = (type, params) => {
            const [listener, options] = Array.isArray(params)
              ? params
              : [params];
            const ref = snapshot(listener);
            const bound = elementListeners.get(ref);
            element.removeEventListener(type, bound, options);
            elementListeners.delete(ref);
          };

          for (const [key, val] of Object.entries(listeners)) {
            addListener(key, /** @type {ListenerParams} */ (val));
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
const booleanAttributes = [
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

/**
 * @param {Element} element
 * @param {string} key
 */
function isNonReflectedAttribute(element, key) {
  return element instanceof HTMLInputElement &&
    ["value", "checked"].includes(key);
}
