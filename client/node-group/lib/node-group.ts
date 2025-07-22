import {
  appendChild,
  asContent,
  asNodeList,
  attached,
  boundaries,
  detach,
  EMPTY_COMMENT,
  getInteriorNodes,
  groups,
  insertBefore,
  invalidBoundaryError,
  patched,
  removeChild,
  replaceChild,
  replaceChildren,
  start,
  symbol,
} from "./utils.ts";

const apprepend = (children: Node[], target: Node) => {
  const { parentNode } = target;
  insertBefore.call(parentNode, EMPTY_COMMENT, target);
  for (const child of children) {
    insertBefore.call(parentNode, child, EMPTY_COMMENT);
  }
  removeChild.call(parentNode, EMPTY_COMMENT);
};

export type IBoundaries = InstanceType<typeof Boundaries>;

class Boundaries {
  start: Comment;
  end: Comment;

  constructor(start: Comment, end: Comment) {
    this.start = start;
    this.end = end;
  }
}

/**
 * Checks whether a Node is an Element
 */
const children = (node: Node | Comment | Element | NodeGroup) =>
  node.nodeType === Node.ELEMENT_NODE;

/**
 * Checks whether a NodeGroup has children (is not empty)
 */
const hasChildNodes = ({ start, end }: Boundaries) => start.nextSibling !== end;

/**
 * Helper function to call a method on the parent of a Boundary
 */
const parent = (
  { start: { parentNode } }: Boundaries,
  method: string,
  ...args: any[]
) => parentNode?.[method](...args);

const validate = ({ data, nodeType }: Comment, valid: string) => {
  if (nodeType !== Node.COMMENT_NODE || data !== valid) {
    throw invalidBoundaryError();
  }
};

export const isNodeGroup = (node: unknown) => node instanceof NodeGroup;

export const asNodeGroup = <T>(node: T) =>
  isNodeGroup(node) ? asContent(node) : node;

export const asChildren = (
  children: (string | Node | NodeGroup)[],
  patch = false,
) => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isNodeGroup(child)) {
      children[i] = asContent(child);
    } else if (patch) {
      children[i] = document.createTextNode(String(child));
    }
  }
  return children;
};

export const asTarget = (node: Node | NodeGroup | null) =>
  isNodeGroup(node) ? start(node) : node;

const references = new WeakMap<Comment, WeakRef<NodeGroup>>();

let fromComments: Boundaries | null = null;

export type INodeGroup = InstanceType<typeof NodeGroup>;

class NodeGroup extends DocumentFragment {
  #name: string;

  // TBD: I am not sure I like this, I prefer just `document.groups`
  /**
   * ℹ️ hydration related
   * Creates a NodeGroup reference from 2 live comments as long
   * as these are not already owned by another instance.
   * Reason: NodeGroup should be unique just like ShadowRoots per each node.
   */
  static from(start: Comment, end: Comment) {
    const name = start.data.slice(1, -1);
    if (!name) throw invalidBoundaryError();
    validate(start, `<${name}>`);
    validate(end, `</${name}>`);
    const gnStart = references.get(start)?.deref();
    const gnEnd = references.get(end)?.deref();
    if (gnStart !== gnEnd) throw invalidBoundaryError();
    if (gnStart) return gnStart;
    const comments = new Boundaries(start, end);
    attached(comments);
    fromComments = comments;
    try {
      return new this(name);
    } finally {
      fromComments = null;
    }
  }

  constructor(name = "") {
    super();
    this.#name = name;

    const comments = fromComments || new Boundaries(
      document.createComment(`<${name}>`),
      document.createComment(`</${name}>`),
    );
    boundaries.set(this, comments);

    const ref = new WeakRef(this);
    references.set(comments.start, ref);
    references.set(comments.end, ref);

    if (name && !groups.has(name)) groups.set(name, ref);
  }

  get [Symbol.toStringTag]() {
    return `NodeGroup<${this.#name}>`;
  }

  override get childElementCount() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? getInteriorNodes(comments).filter(children).length
      : super.childElementCount;
  }

  override get childNodes() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? asNodeList(getInteriorNodes(comments))
      : super.childNodes;
  }

  override get children() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? asNodeList(getInteriorNodes(comments).filter(children))
      : super.children;
  }

  override get firstChild() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    if (attached(comments)) {
      const next = comments.start.nextSibling;
      return next === comments.end ? null : next;
    }
    return super.firstChild;
  }

  // @ts-ignore
  override get firstElementChild() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    return attached(comments)
      ? (getInteriorNodes(comments).find(children) || null)
      : super.firstElementChild;
  }

  override get isConnected() {
    return boundaries.get(this)?.start.isConnected;
  }

  override get lastChild() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    if (attached(comments)) {
      const prev = comments.end.previousSibling;
      return prev === comments.start ? null : prev;
    }
    return super.lastChild;
  }

  // @ts-ignore
  override get lastElementChild() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? (getInteriorNodes(comments).findLast(children) || null)
      : super.lastElementChild;
  }

  override get nextSibling() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments) ? comments.end.nextSibling : super.nextSibling;
  }

  override get parentElement() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? comments.start.parentElement
      : super.parentElement;
  }

  override get parentNode() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments) ? comments.start.parentNode : super.parentNode;
  }

  override get previousSibling() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? comments.start.previousSibling
      : super.previousSibling;
  }

  override get nodeName() {
    return "#node-group";
  }

  get name() {
    return this.#name;
  }

  // Node mutation methods
  override appendChild<T extends Node>(child: T): T {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? parent(comments, "insertBefore", child, comments.end)
      : super.appendChild(child);
  }

  /** @type {typeof DocumentFragment.prototype.cloneNode} */
  override cloneNode(deep = false) {
    const clone = new NodeGroup(this.#name);
    for (const node of this.childNodes) {
      appendChild.call(clone, node.cloneNode(deep));
    }
    return clone;
  }

  override compareDocumentPosition(other: Node) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? parent(comments, "compareDocumentPosition", other)
      : super.compareDocumentPosition(asTarget(other));
  }

  override contains(child: Node | null) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? parent(comments, "contains", child)
      : super.contains(asTarget(child));
  }

  override getRootNode(options?: GetRootNodeOptions) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? comments.start.getRootNode(options)
      : super.getRootNode(options);
  }

  override hasChildNodes() {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments) ? hasChildNodes(comments) : super.hasChildNodes();
  }

  override insertBefore<T extends Node>(
    newNode: T,
    referenceNode: Node | null,
  ) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? parent(comments, "insertBefore", newNode, referenceNode)
      : super.insertBefore(asNodeGroup(newNode), asTarget(referenceNode));
  }

  override removeChild<T extends Node>(child: T) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();
    return attached(comments)
      ? parent(comments, "removeChild", child)
      : (isNodeGroup(child) ? detach(child) : super.removeChild(child));
  }

  override replaceChild<T extends Node>(newChild: Node, oldChild: T) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    if (attached(comments)) {
      return parent(comments, "replaceChild", newChild, oldChild);
    }
    if (isNodeGroup(oldChild)) {
      insertBefore.call(this, EMPTY_COMMENT, start(oldChild));
      detach(oldChild);
      oldChild = EMPTY_COMMENT;
    }
    return replaceChild.call(this, asNodeGroup(newChild), oldChild);
  }

  // TODO ? isEqualNode(node) {}
  // TODO ? normalize(form = 'NFC') {}

  // DocumentFragment mutation methods
  override append(...children: (Node | string)[]) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    if (attached(comments)) apprepend(asChildren(children, true), comments.end);
    else super.append(...children);
  }

  override getElementById(id: string) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    return attached(comments)
      ? parent(comments, "getElementById", id)
      : super.getElementById(id);
  }

  moveBefore<T extends Node>(movedNode: T, referenceNode: Node | null) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    return attached(comments)
      ? parent(comments, "moveBefore", movedNode, referenceNode)
      //@ts-ignore
      : super.moveBefore(movedNode, referenceNode);
  }

  override prepend(...children: (Node | string)[]) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    if (attached(comments)) {
      apprepend(asChildren(children, true), comments.start.nextSibling);
    } else super.prepend(...children);
  }

  override querySelector<K extends keyof HTMLElementTagNameMap>(
    selectors: K,
  ): HTMLElementTagNameMap[K] | null;
  override querySelector<K extends keyof SVGElementTagNameMap>(
    selectors: K,
  ): SVGElementTagNameMap[K] | null;
  override querySelector<K extends keyof MathMLElementTagNameMap>(
    selectors: K,
  ): MathMLElementTagNameMap[K] | null;
  override querySelector<E extends Element = Element>(
    selectors: string,
  ): E | null {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    return attached(comments)
      ? (getInteriorNodes(comments).find((node) => node.matches?.(selectors)) ||
        null)
      : super.querySelector(selectors);
  }

  override querySelectorAll(selectors) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    return attached(comments)
      ? getInteriorNodes(comments).filter((node) => node.matches?.(selectors))
      : super.querySelector(selectors);
  }

  override replaceChildren(...children: (Node | string)[]) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    if (attached(comments)) {
      for (let i = 0; i < children.length; i++) {
        if (isNodeGroup(children[i])) {
          children[i] = asContent(children[i]);
        }
      }
      replaceChildren.apply(this, children);
      if (hasChildNodes(comments)) {
        const range = document.createRange();
        range.setStartAfter(comments.start);
        range.setEndBefore(comments.end);
        range.deleteContents();
      }
      if (children.length) {
        insertBefore.call(comments.end.parentNode, this, comments.end);
      }
    } else super.replaceChildren(...children);
  }

  // Extra (convenient) methods
  after(...children: (Node | string)[]) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    if (attached(comments)) {
      comments.end.after(...children);
    }
  }

  before(...children: (Node | string)[]) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    if (attached(comments)) {
      comments.start.before(...children);
    }
  }

  remove() {
    this.parentNode?.removeChild(this);
  }

  replaceWith(...children: (Node | string)[]) {
    const comments = boundaries.get(this);
    if (!comments) throw invalidBoundaryError();

    const { parentNode } = comments.start;
    if (parentNode) {
      insertBefore.call(parentNode, EMPTY_COMMENT, comments.start);
      detach(this, comments);
      EMPTY_COMMENT.replaceWith(...children);
    }
  }
}

const GN: NodeGroup = patched
  ? globalThis[symbol]
  : (globalThis[symbol] = NodeGroup);

export { GN as NodeGroup };
