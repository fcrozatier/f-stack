import { assert, assertExists } from "./assert.ts";
import {
  addListener,
  isLeafValue,
  reactive,
  snapshot,
} from "./reactivity/reactive.ts";
import { effect } from "./reactivity/signals.ts";
import { isArraySink, isTextSink, isUnsafeHTML } from "./sinks.ts";

let id = 0;

export class Boundary<T = any> {
  #start: Comment;
  #end: Comment;

  id: number;
  range: Range;
  data: T;

  constructor(data: T) {
    this.id = id++;
    this.range = new Range();
    this.data = data;
    this.#start = document.createComment(`<${this.id}>`);
    this.#end = document.createComment(`</${this.id}>`);
  }

  get start() {
    return this.#start;
  }

  set start(comment: Comment) {
    assert(comment.data === `<${this.id}>`, "Unmatched ids");
    this.#start = comment;
  }

  get end() {
    return this.#end;
  }

  set end(comment: Comment) {
    assert(comment.data === `</${this.id}>`, "Unmatched ids");
    this.#end = comment;
  }

  toString() {
    return `<!--<${this.id}>--><!--</${this.id}>-->`;
  }

  /**
   * Like `Range.deleteContents`
   */
  deleteContents() {
    this.range.setStartAfter(this.#start);
    this.range.setEndBefore(this.#end);
    this.range.deleteContents();
  }

  /**
   * Like `Element.remove`
   */
  remove() {
    this.range.setStartBefore(this.#start);
    this.range.setEndAfter(this.#end);
    this.range.deleteContents();
  }

  /**
   * Moves the boundary before the target provided they have a common parent by calling
   * `parent.moveBefore`
   *
   * Like `Element.moveBefore`
   */
  moveBefore(target: Node) {
    const start = this.start;
    const nodes: Node[] = [start];

    let currentNode: Node | null = start;

    while (true) {
      currentNode = currentNode.nextSibling;
      assertExists(currentNode, "Unexpected null node");
      nodes.push(currentNode);
      if (currentNode === this.end) break;
    }

    const parentElement: Element | null = target.parentElement;
    assertExists(parentElement);
    for (const node of nodes) {
      // @ts-ignore moveBefore types missing
      parentElement.moveBefore(node, target);
    }
  }

  render() {
    const data = this.data;

    if (data instanceof DocumentFragment) {
      this.#end.before(data);
    } else if (typeof data === "function") {
      effect(() => {
        const nodes = data.call(null);

        if (nodes instanceof DocumentFragment) {
          this.#end.before(nodes);
          // } else if (Array.isArray(nodes)) {
          //   this.#end.before(...nodes);
        } else {
          throw new Error("Unimplemented Boundary");
        }

        return () => this.deleteContents();
      });
    } else if (isArraySink(data)) {
      const thisEnd = this.end;
      const values = data.values;
      const boundaries: [{ index: number; value: any }, Boundary][] = [];
      let labels: [string, string][] = [];

      type SpliceOptions<T = any> = {
        start: number;
        deleteCount: number;
        values: T[];
      };

      const updates: (() => void)[] = [];

      // removes/inserts adjacent values by deleting/creating boundaries to trigger the right View Transitions
      const spliceBoundaries = (
        start: number,
        deleteCount = 0,
        ...values: any[]
      ) => {
        for (
          const [_, boundary] of boundaries.slice(start, start + deleteCount)
        ) boundary.remove();

        const newBoundaries: [{ index: number; value: any }, Boundary][] = [];

        for (const value of values) {
          const args = reactive({
            index: start + newBoundaries.length,
            value,
          });
          const newBoundary = new Boundary(data.mapper(args));
          newBoundaries.push([args, newBoundary]);
        }

        const next = boundaries[start + deleteCount]?.[1]?.start ?? thisEnd;

        for (const [args] of boundaries.slice(start + deleteCount)) {
          args.index += newBoundaries.length - deleteCount;
        }

        boundaries.splice(start, deleteCount, ...newBoundaries);

        for (const [_, boundary] of newBoundaries) {
          next.before(boundary.start);
          next.before(boundary.end);
          boundary.render();
        }
      };

      // partitions the splice operation into a minimal set of moves (relabels) and adjacent insertions/deletions (sub) splices
      const moveAndSpliceBoundaries = (
        start: number,
        deleteCount = 0,
        ...values: any[]
      ) => {
        const moves: [number, number][] = [];
        for (let index = 0; index < values.length; index++) {
          const value = values[index];
          const oldIndex = boundaries.findIndex(([data]) =>
            data.value === value
          );
          if (oldIndex === -1) continue;

          moves.push([oldIndex, start + index]);
        }

        if (moves.length === 0) {
          return updates.push(
            spliceBoundaries.bind(null, start, deleteCount, ...values),
          );
        }

        const splices: SpliceOptions[] = [];

        let lastIndex = -1;
        let currentAtomicSplice: SpliceOptions = {
          start,
          deleteCount: 0,
          values: [],
        };

        for (let index = 0; index < values.length; index++) {
          // it's a relabel, we already have the data
          if (moves.find(([o]) => o === start + index)) continue;

          const value = values[index];

          // it's an atomic splice
          if (index === lastIndex + 1) {
            currentAtomicSplice.values.push(value);

            if (index < deleteCount) {
              currentAtomicSplice.deleteCount++;
            }
          } else {
            if (currentAtomicSplice.values.length > 0) {
              splices.push(currentAtomicSplice);
            }
            currentAtomicSplice = {
              start: start + index,
              deleteCount: index < deleteCount ? 1 : 0,
              values: [value],
            };
          }
          // track adjacent groups
          lastIndex = index;
        }

        for (const { start, deleteCount, values } of splices) {
          updates.push(
            spliceBoundaries.bind(null, start, deleteCount, ...values),
          );
        }

        updates.push(moveBoundaries.bind(null, moves));
      };

      const moveBoundaries = (relabels: [number, number][]) => {
        const permutation = computeCycles(relabels);
        const transpositions = permutationDecomposition(permutation);

        for (const [from, to] of transpositions) {
          swapBoundaries(from, to);
        }
      };

      const swapBoundaries = (i: number, j: number) => {
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
        boundaryTo[0].index = from;
        boundaryFrom[0].index = to;

        // for adjacent swaps only move `to` before `from`
        const isAdjacentSwap = to === from + 1;

        // compute the non adjacent target before doing the first move
        const nonAdjacentSwapTarget = boundaryTo[1].end.nextSibling ?? thisEnd;

        boundaryTo[1].moveBefore(boundaryFrom[1].start);

        if (!isAdjacentSwap) {
          boundaryFrom[1].moveBefore(nonAdjacentSwapTarget);
        }
      };

      // insert initial values
      spliceBoundaries(0, 0, ...values);

      // Creates a functorial relation with the original reactive array
      addListener(values, (e) => {
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
            const [args] = boundaries[index]!;
            args.value = e.newValue;
            break;
          }
          case "apply": {
            if (![".reverse", ".sort", ".splice"].includes(String(e.path))) {
              labels = [];
            }

            switch (e.path) {
              case ".push":
                updates.push(
                  spliceBoundaries.bind(null, boundaries.length, 0, ...e.args),
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
                for (const [args] of boundaries.slice(start, end)) {
                  args.value = value;
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

                  targetBoundary[0].value = sourceBoundary[0].value;
                }
                break;
              }
              case ".reverse":
              case ".sort": {
                const moves: [number, number][] = labels.map((
                  [a, b],
                ) => [+a * 10, +b * 10]);

                updates.push(moveBoundaries.bind(null, moves));
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
      });
    } else if (isTextSink(data)) {
      const content = data.data;
      let key = data.key;
      this.#end.before(String(content[key] ?? ""));

      addListener(data, (e) => {
        if (e.type !== "update") return;
        const path = e.path;

        if (path === ".key") {
          key = e.newValue;
          this.deleteContents();
          this.#end.before(String(content[key] ?? ""));
        } else if (path !== `.data.${key}`) return;

        this.deleteContents();
        this.#end.before(String(e.newValue ?? ""));
      });
    } else if (!isUnsafeHTML(data)) {
      const content = isLeafValue(data) ? data.value : data;

      if (content instanceof DocumentFragment) {
        this.#end.before(content);
      } else {
        // a text node is a safe sink
        this.#end.before(String(content ?? ""));
      }

      addListener(data, (e) => {
        switch (e.type) {
          case "update": {
            const newValue = snapshot(e.newValue);
            this.deleteContents();
            if (newValue instanceof DocumentFragment) {
              this.#end.before(newValue);
            } else {
              this.#end.before(String(e.newValue ?? ""));
            }
            break;
          }

          case "delete":
            this.deleteContents();
            break;
        }
      });
    } else {
      const template = document.createElement("template");

      addListener(data, (e) => {
        switch (e.type) {
          case "update":
            this.deleteContents();
            template.innerHTML = e.newValue;
            this.#end.before(template.content);
            break;
        }
      });
    }
  }
}

type UpdateCallback = undefined | (() => void | Promise<void>);
type StartViewTransitionOptions = {
  types?: string[];
  update?: UpdateCallback;
};

function maybeViewTransition(
  param: StartViewTransitionOptions | UpdateCallback,
) {
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !document.startViewTransition
  ) {
    if (typeof param === "function") {
      param();
    } else if (typeof param === "object") {
      param?.update?.();
    }
  } else {
    // @ts-ignore Document types are not up to date
    document.startViewTransition(param);
  }
}

/**
 * Computes a permutation cycles
 *
 * @example
 * [[1,2], [2,3], [3,1], [4,5], [5,4]] -> [[1,2,3], [4,5]]
 */
function computeCycles(permutation: [number, number][]) {
  if (permutation.length === 0) return [];

  const cycles: number[][] = [];
  let from: number = permutation[0]![0];
  let currentCycle: number[] = [from];

  while (permutation.length > 0) {
    const index = permutation.findIndex(([f]) => f === from);
    const to = permutation[index]![1];

    if (currentCycle.includes(to)) {
      cycles.push(currentCycle);
      permutation.splice(index, 1);

      if (permutation.length === 0) break;
      from = permutation[0]![0];
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
 */
function permutationDecomposition(cycles: number[][]) {
  const decomposition: [number, number][] = [];

  for (const cycle of cycles) {
    const start = cycle[0];
    assertExists(start, "Unexpected empty cycle");

    for (const element of cycle.slice(1)) {
      decomposition.push([start, element]);
    }
  }

  return decomposition;
}
