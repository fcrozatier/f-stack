// @ts-self-types="./html.d.ts"

import {
  isPrimitive,
  isReactiveLeaf,
  listen,
  reactive,
  snapshot,
} from "@f-stack/functorial";

/**
 * @import { AttachSink, AttrSink, ClassListSink, MapSink, TagName, On, Prop, ShowSink,DerivedSink, StyleSink, TextSink, UnsafeSink, Sink, TemplateSink, EffectScope } from "./html.d.ts"
 *
 * @import { ReactiveLeaf, ReactiveEvent } from "@f-stack/functorial"
 */

/**
 * UTILS
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
 * HTML
 */

/**
 * @type {WeakMap<TemplateStringsArray, Template>}
 */
const templateCache = new WeakMap();

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

/**
 * @typedef {"html" | "svg" | "math"} Mode
 */

/**
 * @callback TemplateTag
 * @param {TemplateStringsArray} strings
 * @param {...Sink} sinks
 * @return {TemplateSink}
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
   * @return {TemplateSink}
   */
  hydrate(sinks) {
    const clone = document.importNode(this.fragment, true);
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
    const disposer = new DisposableStack();

    /**
     * @type {Element|null}
     */
    let currentElement;
    while (
      (currentElement = /** @type {Element | null} */ (walker.nextNode()))
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
          listen(attr, (/** @type {ReactiveEvent} */ e) => {
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

        /**
         * @typedef {  EventListener | [EventListener,options?: boolean | AddEventListenerOptions]} ListenerParams
         */

        /**
         * @param {string} type
         * @param {ListenerParams} params
         */
        const addListener = (type, params) => {
          const [listener, options] = Array.isArray(params) ? params : [params];
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
          const [listener, options] = Array.isArray(params) ? params : [params];
          const ref = snapshot(listener);
          const bound = elementListeners.get(ref);
          element.removeEventListener(type, bound, options);
          elementListeners.delete(ref);
        };

        for (const [key, val] of Object.entries(listeners)) {
          addListener(key, /** @type {ListenerParams} */ (val));
        }

        disposer.use(
          listen(listeners, (/** @type {ReactiveEvent} */ e) => {
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
          listen(props, (/** @type {ReactiveEvent} */ e) => {
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
          listen(style, (/** @type {ReactiveEvent} */ e) => {
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

/**
 * @param {Element} element
 * @param {string} key
 */
function isNonReflectedAttribute(element, key) {
  return element instanceof HTMLInputElement &&
    ["value", "checked"].includes(key);
}

/**
 * A {@linkcode Boundary} is a disposable live `DocumentFragment` with a start and end `Comment` nodes.
 *
 * @internal
 */
class Boundary {
  #start = document.createComment("");
  #end = document.createComment("");

  disposer = new DisposableStack();

  cleanup() {
    this.disposer.dispose();
    this.disposer = new DisposableStack();
  }

  [Symbol.dispose]() {
    this.disposer.dispose();
  }

  range = new Range();

  /**
   * Holds the data the {@linkcode Boundary} manages, which can be any of the different sorts of sinks, a {@linkcode ReactiveLeaf} or a {@linkcode Primitive}
   *
   * @type {Sink}
   */
  data;

  /**
   * Creates a new {@linkcode Boundary}
   *
   * @param {Sink} data
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * Returns the start `Comment` of the {@linkcode Boundary}
   *
   * @return {Comment}
   */
  get start() {
    return this.#start;
  }

  set start(comment) {
    this.#start = comment;
  }

  /**
   * Returns the end `Comment` of the {@linkcode Boundary}
   *
   * @returns {Comment}
   */
  get end() {
    return this.#end;
  }

  set end(comment) {
    this.#end = comment;
  }

  /**
   * Removes the {@linkcode Boundary} content, leaving the start and end `Comment` in place.
   *
   * Like `Range.deleteContents`
   */
  deleteContents() {
    this.range.setStartAfter(this.#start);
    this.range.setEndBefore(this.#end);
    this.range.deleteContents();
  }

  /**
   * Removes the {@linkcode Boundary} from its parent node.
   *
   * This also removes the start and end `Comment`
   *
   * Like `Element.remove()`
   */
  remove() {
    this.range.setStartBefore(this.#start);
    this.range.setEndAfter(this.#end);
    this.range.deleteContents();
    this.disposer.dispose();
  }

  /**
   * Moves the {@linkcode Boundary} before the target provided they have a common parent.
   *
   * @param {Node} target The target `Node` where to move the {@linkcode Boundary} before
   */
  moveBefore(target) {
    const start = this.start;

    /** @type {Node[]} */
    const nodes = [start];

    /** @type {Node|null} */
    let currentNode = start;

    while (true) {
      currentNode = currentNode.nextSibling;
      assertExists(currentNode, "Unexpected null node");
      nodes.push(currentNode);
      if (currentNode === this.end) break;
    }

    /** @type {Element | null} */
    const parentElement = target.parentElement;
    assertExists(parentElement);
    for (const node of nodes) {
      // @ts-ignore moveBefore types missing
      parentElement.moveBefore(node, target);
    }
  }

  /**
   * Returns the {@linkcode Boundary}'s parent `Element` or null
   *
   * @returns {HTMLElement | null}
   */
  get parentElement() {
    return this.start.parentElement;
  }

  /**
   * Renders a {@linkcode Boundary} and sets up the required listeners for granular updates
   */
  render() {
    const data = this.data;

    if (isPrimitive(data)) {
      this.#end.before(String(data ?? ""));
    } else if (
      isTemplateSink(data) ||
      (isReactiveLeaf(data) && !isUnsafeHTML(data))
    ) {
      this.disposer.use(this.renderDerivedSink(data));
    } else if (isMapSink(data)) {
      const thisEnd = this.end;
      const values = data.values;
      const mapper = data.mapper;

      /**
       * @type {{ index: ReactiveLeaf<number>; data: any; boundary: Boundary; }[]}
       */
      const boundaries = [];
      /**
       * @type { [string, string][]}
       */
      let labels = [];

      /**
       * @typedef {{ start: number; deleteCount: number; values: any[]; }} SpliceOptions
       */

      /**
       * @type {(() => void)[]}
       */
      const updates = [];

      // removes/inserts adjacent values by deleting/creating boundaries to trigger the right View Transitions
      /**
       * @param {number} start
       * @param {number} deleteCount
       * @param {...any} values
       */
      const spliceBoundaries = (start, deleteCount = 0, ...values) => {
        for (
          const { boundary } of boundaries.slice(
            start,
            start + deleteCount,
          )
        ) boundary.remove();

        /**
         * @type {{ index: ReactiveLeaf<number>; data: any; boundary: Boundary; }[]}
         */
        const newBoundaries = [];

        for (const value of values) {
          const index = reactive({ value: start + newBoundaries.length });
          const newBoundary = new Boundary(mapper(value, index));
          newBoundaries.push({ index, data: value, boundary: newBoundary });
        }

        const next = boundaries[start + deleteCount]
          ?.boundary?.start ?? thisEnd;

        for (const { index } of boundaries.slice(start + deleteCount)) {
          index.value += newBoundaries.length - deleteCount;
        }

        boundaries.splice(start, deleteCount, ...newBoundaries);

        for (const { boundary } of newBoundaries) {
          next.before(boundary.start);
          next.before(boundary.end);
          boundary.render();
        }
      };

      // partitions the splice operation into a minimal set of moves (relabels) and adjacent (atomic) insertions/deletions (sub) splices
      /**
       * @param {number} start
       * @param {number} deleteCount
       * @param {...any} values
       */
      const moveAndSpliceBoundaries = (start, deleteCount = 0, ...values) => {
        /**
         * @type {SpliceOptions[]}
         */
        const splices = [];

        /**
         * @typedef {{ type: "insert" | "delete" | "swap" } | { type: "move"; from: number; to: number }} Tag
         */

        /**
         * @type {{ deleteRange: Tag[]; insertRange: Tag[] }}
         */
        const tags = {
          deleteRange: Array.from({ length: deleteCount }),
          insertRange: Array.from({ length: values.length }),
        };

        const deleteRange = boundaries.slice(start, start + deleteCount);

        // tag values from the insert range
        for (let index = 0; index < values.length; index++) {
          const value = values[index];

          /**
           * Moves are values from the insert range that also appear in the delete range
           *
           * m
           * ● • •   (delete range)
           *   ↘︎
           * • • ● • (insert range)
           *     m
           */
          const isMoveIndex = deleteRange.findIndex(({ data }) =>
            // ensure we compare refs
            snapshot(data) === snapshot(value)
          );

          if (isMoveIndex !== -1) {
            tags.insertRange[index] = {
              type: "move",
              from: isMoveIndex,
              to: index,
            };
            tags.deleteRange[isMoveIndex] = {
              type: "move",
              from: isMoveIndex,
              to: index,
            };
          } else {
            // it could be a swap or a pure insert we don't know yet
            /**
             * A pure insert
             *
             *  ●      (delete range)
             *    ↘︎
             *  ○   ●  (insert range)
             *  i
             */
            tags.insertRange[index] = { type: "insert" };
          }
        }

        /**
         * Pure insertions and pure deletions need to be taken care of before computing permutations. Here the transposition is 0 ↔︎ 1 before the insert is done
         *
         * ● ●    (delete range)
         *  ↙︎↘︎
         * ● ○ ●  (insert range)
         *   i
         *
         * becomes:
         *
         * Transposition  0 ↔︎ 1      +       Atomic splice (pure insert)
         * ●  ●   (delete range)
         *  ↙︎↘︎
         * ●  ●   (insert range)             ○
         *                                   i (insert at index 1)
         *
         * Swaps keep the arrays balanced (1 deletion paired with one insert) with no impact on permutations.
         *
         * So the order of operations is:
         * 1. Pure deletions
         * 2. Moves
         * 3. Swaps and pure insertions
         */

        let pureDeletions = 0;
        let lastIndex = -1;
        /**
         * @type {SpliceOptions}
         */
        let currentAtomicSplice = {
          start,
          deleteCount: 0,
          values: [],
        };

        // 1. tag values from the delete range
        // 2. also adjust move indices to take into account pure deletions
        // 3. and perform pure deletions
        for (let index = 0; index < deleteRange.length; index++) {
          const tag = tags.deleteRange[index];
          // Moves are already tagged from the previous pass
          if (tag?.type === "move") {
            // Account for pure deletions in moves indices
            tag.from -= pureDeletions;

            // @ts-ignore update the corresponding tag in the insertRange
            tags.insertRange[tag.to].from -= pureDeletions;
            continue;
          }

          const insertTag = tags.insertRange[index];
          if (insertTag?.type === "insert") {
            /**
             * It's a swap if it's not a move and there's a corresponding deletion in the delete range
             *
             *   d
             * • ✕ •   (delete range)
             *   ↓
             * • ○ • • (insert range)
             *   i
             */
            insertTag.type = "swap";
            tags.deleteRange[index] = {
              type: "swap",
            };
          } else {
            // it's a pure deletion
            pureDeletions++;

            tags.deleteRange[index] = {
              type: "delete",
            };

            // if it's an atomic (adjacent) splice: group all deletions
            if (index === lastIndex + 1) {
              currentAtomicSplice.deleteCount++;
            } else {
              if (currentAtomicSplice.deleteCount > 0) {
                // perform deletions
                updates.push(
                  spliceBoundaries.bind(
                    null,
                    currentAtomicSplice.start,
                    currentAtomicSplice.deleteCount,
                  ),
                );
              }
              currentAtomicSplice = {
                start: start + index,
                deleteCount: 1,
                values: [],
              };
            }

            lastIndex = index;
          }
        }

        if (currentAtomicSplice.deleteCount > 0) {
          updates.push(
            spliceBoundaries.bind(
              null,
              currentAtomicSplice.start,
              currentAtomicSplice.deleteCount,
            ),
          );
        }

        // at this point everything is correctly tagged

        /**
         * @type {[from: number, to: number][]}
         */
        const moves = [];
        let pureInsertions = 0;
        lastIndex = -1;
        currentAtomicSplice = { start, deleteCount: 0, values: [] };

        // 1. compute moves
        // 2. take into account pure insertions to adjust move indices
        // 3. and perform swaps and inserts
        for (let index = 0; index < values.length; index++) {
          const tag = tags.insertRange[index];
          const type = tag?.type;

          if (type === "insert" || type === "swap") {
            const value = values[index];

            if (type === "insert") {
              pureInsertions++;
            }

            // it's an atomic (adjacent) splice: group all inserts or swaps
            if (index === lastIndex + 1) {
              currentAtomicSplice.values.push(value);

              if (type === "swap") {
                currentAtomicSplice.deleteCount++;
              }
            } else {
              if (currentAtomicSplice.values.length > 0) {
                splices.push(currentAtomicSplice);
              }

              currentAtomicSplice = {
                start: start + index,
                deleteCount: type === "swap" ? 1 : 0,
                values: [value],
              };
            }

            lastIndex = index;
          } else if (tag?.type === "move") {
            // Account for pure deletions in moves indices
            tag.to -= pureInsertions;
            moves.push([start + tag.from, start + tag.to]);
          }
        }

        if (currentAtomicSplice.values.length > 0) {
          splices.push(currentAtomicSplice);
        }

        if (moves.length > 0) {
          updates.push(moveBoundaries.bind(null, moves));
        }

        for (const { start, deleteCount, values } of splices) {
          updates.push(
            spliceBoundaries.bind(null, start, deleteCount, ...values),
          );
        }
      };

      /**
       * @param {[number, number][]} relabels
       */
      const moveBoundaries = (relabels) => {
        const permutation = computeCycles(relabels);
        const transpositions = permutationDecomposition(permutation);

        for (const [from, to] of transpositions) {
          swapBoundaries(from, to);
        }
      };

      /**
       * @param {number} i
       * @param {number} j
       */
      const swapBoundaries = (i, j) => {
        assert(i !== j, "Swap expected distinct elements");
        const from = Math.min(i, j);
        const to = Math.max(i, j);

        const boundaryFrom = boundaries[from];
        const boundaryTo = boundaries[to];
        assertExists(boundaryFrom);
        assertExists(boundaryTo);

        // update position in boundaries array
        boundaries[from] = boundaryTo;
        boundaries[to] = boundaryFrom;

        // update indices
        boundaryTo.index.value = from;
        boundaryFrom.index.value = to;

        // for adjacent swaps only move `to` before `from`
        const isAdjacentSwap = to === from + 1;

        // compute the non adjacent target before doing the first move
        const nonAdjacentSwapTarget = boundaryTo.boundary.end.nextSibling ??
          thisEnd;

        boundaryTo.boundary.moveBefore(boundaryFrom.boundary.start);

        if (!isAdjacentSwap) {
          boundaryFrom.boundary.moveBefore(nonAdjacentSwapTarget);
        }
      };

      // insert initial values
      spliceBoundaries(0, 0, ...values);

      // Creates a functorial relation with the original reactive array
      this.disposer.use(
        listen(values, (/** @type {ReactiveEvent} */ e) => {
          switch (e.type) {
            case "relabel": {
              labels = e.labels;
              return;
            }
            case "update": {
              if (typeof e.path !== "string") return;
              // Ignore derived updates of the length property
              if (e.path === ".length") return;
              const index = Number(e.path.split(".")[1]);
              const b = boundaries[index];
              assertExists(b);

              // updates are already handled are the reactive object level for non primitive types
              if (isPrimitive(b.data)) {
                b.data = e.newValue;
                b.boundary.data = mapper(
                  e.newValue,
                  reactive({ value: index }),
                );
                b.boundary.deleteContents();
                b.boundary.render();
              }
              break;
            }
            case "apply": {
              if (![".reverse", ".sort", ".splice"].includes(String(e.path))) {
                labels = [];
              }

              switch (e.path) {
                case ".push":
                  updates.push(
                    spliceBoundaries.bind(
                      null,
                      boundaries.length,
                      0,
                      ...e.args,
                    ),
                  );
                  break;
                case ".unshift":
                  updates.push(
                    spliceBoundaries.bind(null, 0, 0, ...e.args),
                  );
                  break;
                case ".concat":
                  updates.push(
                    spliceBoundaries.bind(
                      null,
                      boundaries.length,
                      0,
                      ...e.args[0],
                    ),
                  );
                  break;

                case ".pop":
                  updates.push(
                    spliceBoundaries.bind(null, boundaries.length - 1, 1),
                  );
                  break;
                case ".shift":
                  updates.push(spliceBoundaries.bind(null, 0, 1));
                  break;

                case ".splice": {
                  const [start, deleteCount, ...values] = e.args;
                  moveAndSpliceBoundaries(start, deleteCount, ...values);
                  break;
                }
                case ".fill": {
                  const [value, start, end] = e.args;
                  for (const b of boundaries.slice(start, end)) {
                    b.data = value;
                  }
                  break;
                }
                case ".copyWithin": {
                  const [target, start, end] = e.args;

                  for (let index = 0; index < end - start; index++) {
                    const targetBoundary = boundaries[target + index];
                    const sourceBoundary = boundaries[start + index];

                    assertExists(targetBoundary);
                    assertExists(sourceBoundary);

                    targetBoundary.data = sourceBoundary.data;
                  }
                  break;
                }
                case ".reverse":
                case ".sort": {
                  if (labels.length > 0) {
                    /**
                     * @type {[number, number][]}
                     */
                    const moves = labels.map(
                      ([a, b]) => [+a.slice(1), +b.slice(1)],
                    );

                    updates.push(moveBoundaries.bind(null, moves));
                    labels = [];
                  }
                  break;
                }
              }

              if (updates.length > 0) {
                maybeViewTransition(() => {
                  for (const update of updates) {
                    update();
                  }
                  updates.length = 0;
                });
              }
            }
          }
        }),
      );
    } else if (isTextSink(data)) {
      const content = data.data;
      const key = data.key;
      const textNode = new Text(String(content[key] ?? ""));
      this.#end.before(textNode);

      this.disposer.use(
        listen(content, (/** @type {ReactiveEvent} */ e) => {
          if (e.type !== "update") return;
          if (e.path !== `.${key}`) return;
          textNode.data = String(e.newValue ?? "");
        }),
      );
    } else if (isShowSink(data)) {
      /**
       * @param  {(() => DerivedSink) | undefined} currentCase
       * @returns {DisposableStack | undefined}
       */
      const setup = (currentCase) => {
        if (currentCase) {
          return this.renderDerivedSink(currentCase());
        }
      };

      let cleanup = setup(data.cond ? data.ifCase : data.elseCase);

      this.disposer.use(
        listen(data, (/** @type {ReactiveEvent} */ e) => {
          // ensure we're in the right case before cleaning up
          if (e.type !== "update" || e.path !== ".cond") return;
          cleanup?.[Symbol.dispose]();
          this.deleteContents();
          cleanup = setup(e.newValue ? data.ifCase : data.elseCase);
        }),
      );
    } else if (isUnsafeHTML(data)) {
      // unsafe sink
      const template = document.createElement("template");
      template.innerHTML = data.value;
      this.replaceChildren(template.content);

      this.disposer.use(
        listen(data, (/** @type {ReactiveEvent} */ e) => {
          switch (e.type) {
            case "update":
              template.innerHTML = e.newValue;
              this.replaceChildren(template.content);
              break;
          }
        }),
      );
    } else {
      throw new Error(`Unexpected sink: ${data}`);
    }
  }

  /**
   * Interpolates {@linkcode ReactiveLeaf | ReactiveLeaves} and {@linkcode Primitive | Primitives} as safe `Text` nodes and inserts nested {@linkcode TemplateSink}
   *
   * @param {DerivedSink} data
   * @returns {DisposableStack}
   */
  renderDerivedSink(data) {
    const content = isReactiveLeaf(data) ? data.value : data;
    const disposable = new DisposableStack();

    if (isPrimitive(content)) {
      // a text node is a safe sink
      this.#end.before(String(content ?? ""));
    } else {
      disposable.use(content);
      this.#end.before(content.fragment);
    }

    disposable.use(
      listen(data, (/** @type {ReactiveEvent} */ e) => {
        if (e.type !== "update" && e.type !== "delete") return;
        if (e.path !== ".value") return;

        switch (e.type) {
          case "update": {
            const newValue = snapshot(e.newValue);
            if (isPrimitive(newValue)) {
              this.replaceChildren(String(e.newValue ?? ""));
            } else {
              this.replaceChildren(newValue);
            }
            break;
          }

          case "delete":
            this.deleteContents();
            break;
        }
      }),
    );

    return disposable;
  }

  /**
   * Replaces the existing children of a Boundary with a specified new set of children.
   * These can be string or Node objects.
   *
   * @param {...(Node | string)} nodes
   */
  replaceChildren(...nodes) {
    if (this.parentElement) {
      this.range.setStartAfter(this.#start);
      this.range.setEndBefore(this.#end);
      this.range.deleteContents();
      this.#end.before(...nodes);
    }
  }
}

/**
 * @typedef {undefined | (() => void | Promise<void>)} UpdateCallback
 */

/**
 * @typedef  {object} StartViewTransitionOptions
 * @property {string[]} [types]
 * @property {UpdateCallback} [update]
 */

/**
 * @param {StartViewTransitionOptions | UpdateCallback} param
 * @param {HTMLElement | null | undefined} [element]
 */
function maybeViewTransition(param, element) {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // @ts-ignore FUTUR
    if (element?.startViewTransition) {
      // @ts-ignore FUTUR
      return element.startViewTransition(param);
    }

    if (document.startViewTransition) {
      // @ts-ignore Document types are not up to date
      return document.startViewTransition(param);
    }
  }

  if (typeof param === "function") {
    param();
  } else if (typeof param === "object") {
    param.update?.();
  }
}

/**
 * Computes a permutation cycles
 *
 * @example
 * [[1,2], [2,3], [3,1], [4,5], [5,4]] -> [[1,2,3], [4,5]]
 *
 * @param {[number, number][]} permutation
 */
function computeCycles(permutation) {
  if (permutation.length === 0) return [];

  /**
   * @type {number[][]}
   */
  const cycles = [];

  const first = permutation[0];
  assertExists(first);
  let from = first[0];

  /**
   * @type {number[]}
   */
  let currentCycle = [from];

  while (permutation.length > 0) {
    const index = permutation.findIndex(([f]) => f === from);
    const target = permutation[index];
    assertExists(target);
    const to = target[1];

    if (currentCycle.includes(to)) {
      cycles.push(currentCycle);
      permutation.splice(index, 1);

      if (permutation.length === 0) break;
      const first = permutation[0];
      assertExists(first);
      from = first[0];
      currentCycle = [from];
    } else {
      currentCycle.push(to);
      permutation.splice(index, 1);

      from = to;
    }
  }

  return cycles;
}

/**
 * Decomposes a permutation into transpositions
 *
 * @example
 * [1,2,3] -> [[1,2], [1,3]]
 *
 * @param {number[][]} cycles
 */
function permutationDecomposition(cycles) {
  /**
   * @type {[number, number][]}
   */
  const decomposition = [];

  for (const cycle of cycles) {
    const start = cycle[0];
    assertExists(start, "Unexpected empty cycle");

    for (const element of cycle.slice(1)) {
      decomposition.push([start, element]);
    }
  }

  return decomposition;
}

/**
 * SINKS
 */

// attach

const ATTACH_SINK = Symbol.for("attach sink");

/**
 * Creates an {@linkcode attach} sink.
 *
 * The callback hook runs on the element it is attached to.
 *
 * @template {Node} T
 * @param {AttachSink<T>} hook
 * @returns {AttachSink<T>}
 */
export function attach(hook) {
  Object.defineProperty(hook, ATTACH_SINK, { value: true });
  return hook;
}

/**
 * Checks whether a sink is an {@linkcode attach} sink
 *
 * @param {unknown} value
 * @returns {value is AttachSink}
 */
export const isAttachSink = (value) => {
  return typeof value === "function" && Object.hasOwn(value, ATTACH_SINK);
};

// attr

const ATTR_SINK = Symbol.for("attr sink");

/**
 * Creates an {@linkcode attr} sink that manages attributes on an `Element`
 *
 * @template {TagName} T
 * @param {AttrSink<T>} attributes
 * @returns {AttrSink<T>}
 */
export function attr(attributes) {
  const attrSink = reactive(attributes);
  Object.defineProperty(attrSink, ATTR_SINK, { value: true });
  return attrSink;
}

/**
 * Checks whether a sink is an {@linkcode attr} sink
 *
 * @param {unknown} value
 * @returns {value is AttrSink}
 */
export function isAttrSink(value) {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, ATTR_SINK);
}

// classList

const CLASSLIST_SINK = Symbol.for("classList sink");

/**
 * Creates a {@linkcode classList} sink that handles conditional classes on an `Element`
 *
 * @param {ClassListSink} classes
 * @return {ClassListSink}
 */
export function classList(classes) {
  const classSink = reactive(classes);
  Object.defineProperty(classSink, CLASSLIST_SINK, { value: true });
  return classSink;
}

/**
 * Checks whether a sink is a {@linkcode classList} sink
 *
 * @param {unknown} value
 * @returns {value is ClassListSink}
 */
export function isClassSink(value) {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, CLASSLIST_SINK);
}

// map

const MAP_SINK = Symbol.for("map sink");

/**
 * Creates a {@linkcode map} sink for iterating over a {@linkcode reactive} array
 *
 * @template T
 * @param {T[]} values The {@linkcode reactive} array to iterate on
 * @param {(value: T, index: ReactiveLeaf<number>) => TemplateSink} mapper A callback taking as input a single `value` from the array and its `index`
 * @returns {MapSink<T>}
 */
export function map(values, mapper) {
  return {
    values,
    mapper,
    // @ts-ignore internal
    [MAP_SINK]: true,
  };
}

/**
 * Checks whether a sink is a {@linkcode map} sink
 *
 * @param {unknown} value
 * @returns {value is MapSink}
 */
export function isMapSink(value) {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, MAP_SINK);
}

// on

const ON_SINK = Symbol.for("on sink");

/**
 * @typedef {On<HTMLElement, HTMLElementEventMap>} DefaultedOn
 */

/**
 * Creates an {@linkcode on} sink that manages event handlers on an `Element`
 *
 * @param {DefaultedOn} listeners
 * @returns {DefaultedOn}
 */
export function on(listeners) {
  const onSink = reactive(listeners);
  Object.defineProperty(onSink, ON_SINK, { value: true });
  return onSink;
}

/**
 * Checks whether a sink is an {@linkcode on} sink
 *
 * @param {unknown} value
 * @returns {value is On}
 */
export function isOnSink(value) {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, ON_SINK);
}

// prop

const PROP_SINK = Symbol.for("prop sink");

/**
 * Creates a {@linkcode prop} sink that manages an `Element` properties
 *
 * @template {Element} T
 * @param {Prop<T>} props
 * @returns {Prop}
 */
export function prop(props) {
  const propSink = reactive(props);
  Object.defineProperty(propSink, PROP_SINK, { value: true });
  return propSink;
}

/**
 * Checks whether a sink is an {@linkcode on} sink
 *
 * @param {unknown} value
 * @returns {value is Prop}
 */
export function isPropSink(value) {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, PROP_SINK);
}

// show

const SHOW_SINK = Symbol.for("show sink");

/**
 * Creates a `show` sink to handle alternations. It takes 3 callbacks:
 *
 * @param {() => boolean} condition Returns a boolean corresponding to whether we're in the `true` or `false` case
 * @param {() => DerivedSink} ifCase Returns the template or value to show when the condition is `true`
 * @param {  (() => DerivedSink)     | undefined} [elseCase] Optionally returns the template or value to show when the condition is `false`
 * @returns {ShowSink}
 */
export function show(
  condition,
  ifCase,
  elseCase,
) {
  return reactive({
    get cond() {
      return condition();
    },
    ifCase,
    elseCase,
    [SHOW_SINK]: true,
  });
}

/**
 * Checks whether a sink is a {@linkcode show} sink
 *
 * @param {unknown} value
 * @returns {value is ShowSink}
 */
export function isShowSink(value) {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, SHOW_SINK);
}

// style

/**
 * CSS Typed Object Model is not implemented in Firefox
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1278697
 */

const STYLE_SINK = Symbol.for("style sink");

/**
 * Creates a `style` sink that handles inline styles on an `Element`
 *
 * @param {StyleSink} styles
 * @return {StyleSink}
 */
export function style(styles) {
  const styleSink = reactive(styles);
  Object.defineProperty(styleSink, STYLE_SINK, { value: true });
  return styleSink;
}

/**
 * Checks whether a sink is a {@linkcode style} sink
 *
 * @param {unknown} value
 * @returns {value is StyleSink}
 */
export function isStyleSink(value) {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, STYLE_SINK);
}

// template

const TEMPLATE_SINK = Symbol.for("template sink");

/**
 * Checks whether a sink is an {@linkcode attach} sink
 *
 * @param {unknown} value
 * @returns {value is TemplateSink}
 */
export function isTemplateSink(value) {
  return value !== null && typeof value === "object" &&
    Object.hasOwn(value, TEMPLATE_SINK);
}

// text

const TEXT_SINK = Symbol.for("text sink");

/**
 * Creates a text sink from a {@linkcode reactive} object reference and a key
 *
 * @template {Record<string, any>} T
 * @param {T} node the {@linkcode reactive} object reference
 * @param {keyof T & string} key the key to read as text. Defaults to `value`
 *  @returns {TextSink}
 *
 * @see {@linkcode derived}
 */
export function text(node, key = "value") {
  const textSink = { data: node, key, [TEXT_SINK]: true };
  return textSink;
}

/**
 * Checks whether a sink is a {@linkcode text} sink
 *
 * @param {unknown} value
 * @returns {value is TextSink}
 */
export function isTextSink(value) {
  return value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, TEXT_SINK);
}

// unsafe

const UNSAFE_SINK = Symbol.for("unsafe sink");

/**
 * Creates a raw HTML sink.
 *
 * The passed-in string or {@linkcode ReactiveLeaf<string>} is parsed as HTML and written to the DOM.
 *
 * Only use this with trusted inputs.
 *
 * @param {string | ReactiveLeaf<string>} unsafe
 * @returns {UnsafeSink}
 */
export function unsafeHTML(unsafe) {
  const unsafeSink = typeof unsafe === "string" || !isReactiveLeaf(unsafe)
    ? reactive({ value: unsafe })
    : unsafe;
  Object.defineProperty(unsafeSink, UNSAFE_SINK, { value: true });
  return unsafeSink;
}

/**
 * Checks whether a sink is an {@link unsafeHTML} sink
 *
 * @param {unknown} value
 * @returns {value is UnsafeSink}
 */
export function isUnsafeHTML(value) {
  return typeof value === "object" &&
    value !== null &&
    Object.hasOwn(value, UNSAFE_SINK);
}

/**
 * Creates a component
 *
 * @template {any[]} T
 * @param {(this: EffectScope, ...args:T) => TemplateSink} callback
 * @returns {(...args: T) => TemplateSink}
 */
export function component(callback) {
  return (...args) => {
    const disposer = new DisposableStack();

    /** @type {EffectScope} */
    const scope = {
      disposer,
      // wtf
      // @ts-ignore
      listen: (node, callback) => disposer.use(listen(node, callback)),
      [Symbol.dispose]() {
        disposer.dispose();
      },
    };

    const templateSink = disposer.use(callback.apply(scope, args));

    return {
      fragment: templateSink.fragment,
      [Symbol.dispose]() {
        scope[Symbol.dispose]();
      },
    };
  };
}
