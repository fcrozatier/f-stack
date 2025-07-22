import {
  appendChild,
  compareDocumentPosition,
  contains,
  defineProperties,
  detach,
  EMPTY_COMMENT,
  insertBefore,
  NP,
  patched,
  removeChild,
  replaceChild,
  start,
} from "../lib/utils.ts";
import { asNodeGroup, asTarget, isNodeGroup } from "../lib/node-group.ts";

if (!patched) {
  defineProperties(NP, {
    appendChild: {
      value<T extends Node>(node: T) {
        // @ts-ignore
        return appendChild.call(this, asNodeGroup(node));
      },
    },
    compareDocumentPosition: {
      value(other: Node) {
        return compareDocumentPosition.call(this, asTarget(other));
      },
    },
    contains: {
      value(other: Node | null) {
        return contains.call(this, asTarget(other));
      },
    },
    insertBefore: {
      value<T extends Node>(node: T, child: Node | null) {
        return insertBefore.call(this, asNodeGroup(node), asTarget(child));
      },
    },
    removeChild: {
      value<T extends Node>(child: T) {
        return isNodeGroup(child)
          ? detach(child)
          : removeChild.call(this, child);
      },
    },
    replaceChild: {
      value<T extends Node>(node: Node, child: T) {
        if (isNodeGroup(child)) {
          insertBefore.call(this, EMPTY_COMMENT, start(child));
          detach(child);
          child = EMPTY_COMMENT;
        }
        return replaceChild.call(this, asNodeGroup(node), child);
      },
    },
  });
}
