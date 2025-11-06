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
  TEMPLATE_SINK,
  type TemplateSink,
  type TemplateTag,
} from "./sinks.ts";

const templateCache = new WeakMap<TemplateStringsArray, Template>();

const ATTACH_MARKER = "attach-🚰";
const ATTR_MARKER = "attr-🚰";
const CLASSLIST_MARKER = "classlist-🚰";
const ON_MARKER = "on-🚰";
const PROP_MARKER = "prop-🚰";
const STYLE_MARKER = "style-🚰";
const BOUNDARY_MARKER = "boundary-🚰";

const BOUNDARY_ELEMENT = "boundary";

let elementSinkId = 0;
let fragmentSinkId = 0;

type Mode = "html" | "svg" | "math";

function makeTemplateTag(mode: Mode): TemplateTag {
  return (strings, ...sinks) => {
    const template = getTemplate(mode, strings, ...sinks);
    return template.hydrate(sinks);
  };
}

/**
 * The `HTML` template tag
 */
export const html: TemplateTag = makeTemplateTag("html");

/**
 * The `SVG` template tag
 */
export const svg: TemplateTag = makeTemplateTag("svg");

/**
 * The `MathML` template tag
 */
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
      const string = strings[index];

      innerHTML += string;
      const data = sinks[index];

      if (isAttachSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${ATTACH_MARKER}="${id}" `;
        elementSinks.set(id, index);
      } else if (isAttrSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${ATTR_MARKER}="${id}" `;
        elementSinks.set(id, index);
      } else if (isClassSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${CLASSLIST_MARKER}="${id}" `;
        elementSinks.set(id, index);
      } else if (isOnSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${ON_MARKER}="${id}" `;
        elementSinks.set(id, index);
      } else if (isPropSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${PROP_MARKER}="${id}" `;
        elementSinks.set(id, index);
      } else if (isStyleSink(data)) {
        const id = elementSinkId++;
        innerHTML += ` ${STYLE_MARKER}="${id}" `;
        elementSinks.set(id, index);
      } else {
        const id = fragmentSinkId++;
        innerHTML +=
          `<${BOUNDARY_ELEMENT} ${BOUNDARY_MARKER}="${id}"></${BOUNDARY_ELEMENT}>`;
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

  hydrate(sinks: Sink[]): TemplateSink {
    const clone = document.importNode(this.fragment, true);
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
    const disposer = new DisposableStack();

    let currentElement: Element | null;
    while (
      (currentElement = walker.nextNode() as Element | null)
    ) {
      if (!currentElement) break;

      if (currentElement.tagName.toLowerCase() === BOUNDARY_ELEMENT) {
        const boundaryId = currentElement.getAttribute(BOUNDARY_MARKER);
        assertExists(boundaryId, "Unexpected boundary without a boundary-id");

        const index = this.fragmentSinks.get(+boundaryId);
        assertExists(index, "Couldn't find boundary data");

        const sink = sinks[index];
        const start = document.createComment("");
        const end = document.createComment("");
        const boundary = new Boundary(sink);

        boundary.start = start;
        boundary.end = end;

        currentElement.replaceWith(start, end);
        boundary.render();
        walker.currentNode = end;

        disposer.use(boundary);
        continue;
      }

      // Attach
      const attachId = currentElement.getAttribute(ATTACH_MARKER);
      if (attachId !== null) {
        const index = this.elementSinks.get(+attachId);
        assertExists(index, "Couldn't find attach sink data");

        const attach = sinks[index];
        assert(isAttachSink(attach));

        currentElement.removeAttribute(ATTACH_MARKER);
        attach(currentElement);
      }

      // Attr
      const attrId = currentElement.getAttribute(ATTR_MARKER);
      if (attrId !== null) {
        const index = this.elementSinks.get(+attrId);
        assertExists(index, "Couldn't find attr sink data");

        const attr = sinks[index];
        assert(isAttrSink(attr));

        const element = currentElement;
        element.removeAttribute(ATTR_MARKER);

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

        disposer.use(
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
          }),
        );
      }

      // ClassList
      const classlistId = currentElement.getAttribute(CLASSLIST_MARKER);
      if (classlistId !== null) {
        const index = this.elementSinks.get(+classlistId);
        assertExists(index, "Couldn't find classList sink data");

        const classList = sinks[index];
        assert(isClassSink(classList));

        const element = currentElement;
        element.removeAttribute(CLASSLIST_MARKER);

        for (const [key, value] of Object.entries(classList)) {
          const classes = key.split(" ");

          if (value) {
            element.classList.add(...classes);
          } else {
            element.classList.remove(...classes);
          }
        }

        disposer.use(
          listen(classList, (/** @type {ReactiveEvent} */ e) => {
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
          }),
        );
      }

      // On
      const onId = currentElement.getAttribute(ON_MARKER);
      if (onId !== null) {
        const index = this.elementSinks.get(+onId);
        assertExists(index, "Couldn't find on sink data");

        const listeners = sinks[index];
        assert(isOnSink(listeners));

        const element = currentElement;
        element.removeAttribute(ON_MARKER);
        const elementListeners = new WeakMap();

        type ListenerParams = EventListener | [
          EventListener,
          options?: boolean | AddEventListenerOptions,
        ];

        const addListener = (type: string, params: ListenerParams) => {
          const [listener, options] = Array.isArray(params) ? params : [params];
          const ref = snapshot(listener);
          const bound = ref.bind(currentElement);
          element.addEventListener(type, bound, options);
          elementListeners.set(ref, bound);
        };

        const removeListener = (type: string, params: ListenerParams) => {
          const [listener, options] = Array.isArray(params) ? params : [params];
          const ref = snapshot(listener);
          const bound = elementListeners.get(ref);
          element.removeEventListener(type, bound, options);
          elementListeners.delete(ref);
        };

        for (const [key, val] of Object.entries(listeners)) {
          addListener(key, val as ListenerParams);
        }

        disposer.use(
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
          }),
        );
      }

      // Prop
      const propId = currentElement.getAttribute(PROP_MARKER);
      if (propId !== null) {
        const index = this.elementSinks.get(+propId);
        assertExists(index, "Couldn't find prop sink data");

        const props = sinks[index];
        assert(isPropSink(props));

        const element = currentElement;
        element.removeAttribute(PROP_MARKER);

        for (const [key, value] of Object.entries(props)) {
          // @ts-ignore key in element
          element[key] = value;
        }

        disposer.use(
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
          }),
        );
      }

      // Style
      const styleId = currentElement.getAttribute(STYLE_MARKER);
      if (styleId !== null) {
        const index = this.elementSinks.get(+styleId);
        assertExists(index, "Couldn't find style sink data");

        const style = sinks[index];
        assert(isStyleSink(style));
        assert(
          currentElement instanceof HTMLElement ||
            currentElement instanceof SVGElement ||
            currentElement instanceof MathMLElement,
          "Expected an html, svg or mathML element",
        );

        const element = currentElement;
        element.removeAttribute(STYLE_MARKER);

        for (const [key, value] of Object.entries(style)) {
          currentElement.style.setProperty(key, String(value));
        }

        disposer.use(
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
          }),
        );
      }
    }

    let fragment = clone;

    if (this.mode !== "html") {
      const wrapper = clone.firstElementChild;
      const result = document.createDocumentFragment();
      assertExists(wrapper, "Unexpected null wrapper");

      // no `children` spreading to avoid array conversion from `HTMLCollection`
      while (wrapper.firstChild) result.append(wrapper.firstChild);
      fragment = result;
    }

    return {
      fragment,
      [Symbol.dispose]() {
        disposer.dispose();
      },
      // @ts-ignore
      [TEMPLATE_SINK]: true,
    };
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

function isNonReflectedAttribute(element: Element, key: string) {
  return element instanceof HTMLInputElement &&
    ["value", "checked"].includes(key);
}
