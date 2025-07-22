import { type IBoundaries, type INodeGroup } from "./node-group.ts";

const { defineProperties } = Object;
export { defineProperties };

export const symbol = Symbol.for("group-nodes");
export const patched = symbol in globalThis;

const NLP = NodeList.prototype;
export const DFP = DocumentFragment.prototype;
export const NP = Node.prototype;

export const asNodeList = (nodes: Node[]): NodeList =>
  Object.setPrototypeOf(nodes, NLP);

const {
  appendChild,
  compareDocumentPosition,
  contains,
  insertBefore,
  removeChild,
  replaceChild,
} = NP;

export {
  appendChild,
  compareDocumentPosition,
  contains,
  insertBefore,
  removeChild,
  replaceChild,
};

// @ts-ignore moveBefore is not typed
const { append, moveBefore, prepend, replaceChildren } = DFP;
export { append, moveBefore, prepend, replaceChildren };

export const boundaries = new WeakMap<INodeGroup, IBoundaries>();
export const groups = new Map<string | symbol, WeakRef<INodeGroup>>();

export const EMPTY_COMMENT = document.createComment("");

/**
 * Grabs all siblings inside the ]start, end[ range
 */
export const getInteriorNodes = ({ start, end }: IBoundaries) => {
  const nodes: ChildNode[] = [];
  let sibling: ChildNode | null | undefined = start;
  while ((sibling = sibling?.nextSibling) !== end && sibling) {
    nodes.push(sibling);
  }
  return nodes;
};

/**
 * Checks whether a NodeGroup is connected by looking at the parent of its boundaries
 *
 * @throw InvalidBoundaryError
 */
export const attached = ({ start, end }: IBoundaries) => {
  const { parentNode } = start;
  const result = parentNode !== null;
  if (
    parentNode !== end.parentNode ||
    (result &&
      compareDocumentPosition.call(start, end) !==
        Node.DOCUMENT_POSITION_FOLLOWING)
  ) {
    throw invalidBoundaryError();
  }
  return result;
};

export const asContent = (
  nodeGroup: INodeGroup,
  boundary = boundaries.get(nodeGroup),
) => {
  if (!boundary) throw invalidBoundaryError();

  if (attached(boundary)) {
    replaceChildren.call(
      nodeGroup,
      boundary.start,
      ...getInteriorNodes(boundary),
      boundary.end,
    );
  } else {
    prepend.call(nodeGroup, boundary.start);
    append.call(nodeGroup, boundary.end);
  }
  return nodeGroup;
};

export const detach = (
  nodeGroup: INodeGroup,
  boundary = boundaries.get(nodeGroup),
) => {
  if (!boundary) throw invalidBoundaryError();

  const childNodes = getInteriorNodes(boundary);
  boundary.start.remove();
  replaceChildren.apply(nodeGroup, childNodes);
  boundary.end.remove();
  return nodeGroup;
};

export const invalidBoundaryError = () =>
  new Error("Invalid NodeGroup boundary");

export const start = (nodeGroup: INodeGroup) =>
  boundaries.get(nodeGroup)?.start;
