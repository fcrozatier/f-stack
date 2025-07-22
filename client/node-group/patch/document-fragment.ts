import {
  append,
  defineProperties,
  DFP,
  moveBefore,
  patched,
  prepend,
  replaceChildren,
} from "../lib/utils.ts";
import {
  asChildren,
  asNodeGroup,
  asTarget,
  type INodeGroup,
} from "../lib/node-group.ts";

if (!patched) {
  defineProperties(DFP, {
    append: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        // @ts-ignore
        append.apply(this, asChildren(nodes));
      },
    },
    moveBefore: {
      value<T>(movedNode: T, referenceNode: Node | INodeGroup | null): T {
        return moveBefore.call(
          this,
          asNodeGroup(movedNode),
          asTarget(referenceNode),
        );
      },
    },
    prepend: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        // @ts-ignore
        prepend.apply(this, asChildren(nodes));
      },
    },
    replaceChildren: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        // @ts-ignore
        replaceChildren.apply(this, asChildren(nodes));
      },
    },
  });
}
