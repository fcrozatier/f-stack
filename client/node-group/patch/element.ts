import { defineProperties, patched } from "../lib/utils.ts";
import {
  asChildren,
  asNodeGroup,
  asTarget,
  type INodeGroup,
} from "../lib/node-group.ts";

const EP = Element.prototype;

const {
  after,
  append,
  before,
  insertAdjacentElement,
  prepend,
  replaceChildren,
  replaceWith,
  //@ts-ignore
  moveBefore,
} = EP;

if (!patched) {
  defineProperties(EP, {
    after: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        //@ts-ignore
        after.apply(this, asChildren(nodes));
      },
    },
    append: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        //@ts-ignore
        append.apply(this, asChildren(nodes));
      },
    },
    before: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        //@ts-ignore
        before.apply(this, asChildren(nodes));
      },
    },
    insertAdjacentElement: {
      value(position: InsertPosition, element: Element) {
        // @ts-ignore
        return insertAdjacentElement.call(this, position, asNodeGroup(element));
      },
    },
    moveBefore: {
      value<T>(movedNode: T, referenceNode: Node | null): T {
        return moveBefore.call(
          this,
          asNodeGroup(movedNode),
          asTarget(referenceNode),
        );
      },
    },
    prepend: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        //@ts-ignore
        prepend.apply(this, asChildren(nodes));
      },
    },
    replaceChildren: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        //@ts-ignore
        replaceChildren.apply(this, asChildren(nodes));
      },
    },
    replaceWith: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        //@ts-ignore
        replaceWith.apply(this, asChildren(nodes));
      },
    },
  });
}
