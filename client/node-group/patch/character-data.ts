import { defineProperties, patched } from "../lib/utils.ts";
import { asChildren } from "../lib/node-group.ts";
import { type INodeGroup } from "../lib/node-group.ts";

if (!patched) {
  const CDP = CharacterData.prototype;

  const { after, before, replaceWith } = CDP;

  defineProperties(CDP, {
    after: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        // @ts-ignore
        after.apply(this, asChildren(nodes));
      },
    },
    before: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        // @ts-ignore
        before.apply(this, asChildren(nodes));
      },
    },
    replaceWith: {
      value(...nodes: (Node | INodeGroup | string)[]) {
        // @ts-ignore
        replaceWith.apply(this, asChildren(nodes));
      },
    },
  });
}
