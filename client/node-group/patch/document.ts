import {
  defineProperties,
  groups,
  invalidBoundaryError,
  patched,
} from "../lib/utils.ts";
import { NodeGroup } from "../lib/node-group.ts";

if (!patched) {
  defineProperties(document, {
    groups: {
      configurable: true,
      enumerable: true,
      value: new Proxy(groups, {
        has(map, name) {
          return map.has(name) || !!this.get(map, name);
        },
        get(map, name) {
          let group = map.get(name)?.deref() || null;
          name = String(name);
          if (!group && name) {
            const tw = document.createTreeWalker(document.body, 128);
            const startName = `<${name}>`;
            const endName = `</${name}>`;
            let parentNode, start, end, node;
            while ((node = tw.nextNode())) {
              if (start) {
                if (node.data === endName && node.parentNode === parentNode) {
                  end = node;
                  break;
                }
              } else if (node.data === startName) {
                start = node;
                parentNode = start.parentNode;
              }
            }
            if (start) {
              if (end) {
                group = NodeGroup.from(start, end);
              } else {
                invalidBoundaryError();
              }
            }
          }
          return group;
        },
      }),
    },
  });
}
