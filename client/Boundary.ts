import { assert, assertExists } from "./assert.ts";
import {
  addListener,
  derived,
  isReactiveLeaf,
  reactive,
  type ReactiveLeaf,
  snapshot,
} from "./reactivity/reactive.ts";
import { isArraySink, isShowSink, isTextSink, isUnsafeHTML } from "./sinks.ts";
import { isPrimitive, type Primitive } from "./utils.ts";

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

  /**
   * Similar to `Node.isConnected` but tells whether the content is live and should be updated.
   * Allows for early exits in update paths
   */
  isContentsConnected = false;

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
    this.isContentsConnected = false;
  }

  /**
   * Like `Element.remove`
   */
  remove() {
    this.range.setStartBefore(this.#start);
    this.range.setEndAfter(this.#end);
    this.range.deleteContents();
    this.isContentsConnected = false;
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

  get parentElement() {
    return this.start.parentElement;
  }

  render() {
    const data = this.data;

    if (data instanceof DocumentFragment) {
      this.#end.before(data);
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
            value: snapshot(value),
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
        const splices: SpliceOptions[] = [];

        let missing = 0;
        let lastIndex = -1;
        let currentAtomicSplice: SpliceOptions = {
          start,
          deleteCount: 0,
          values: [],
        };

        const deleteRange = boundaries.slice(start, start + deleteCount);

        for (let index = 0; index < values.length; index++) {
          const value = values[index];
          // moves are elements from `values` that also appear in the delete range
          const isMove = deleteRange.findIndex(([data]) =>
            data.value === value
          );

          if (isMove === -1) {
            // it's a swap if there's a corresponding deletion in the delete range
            // implicitly checks index < deleteCount
            const isSwap = values.every((v) =>
              deleteRange[index]?.[0].value !== v
            );

            // inserts or swaps influence move indices
            if (!isSwap) {
              missing++;
            }

            // it's an atomic (adjacent) splice
            if (index === lastIndex + 1) {
              currentAtomicSplice.values.push(value);

              if (isSwap) {
                currentAtomicSplice.deleteCount++;
              }
            } else {
              if (currentAtomicSplice.values.length > 0) {
                splices.push(currentAtomicSplice);
              }
              currentAtomicSplice = {
                start: start + index,
                deleteCount: isSwap ? 1 : 0,
                values: [value],
              };
            }

            // track adjacent groups
            lastIndex = index;
          } else {
            // densely account for pure inserts so we can do all the moves first
            const to = start + index - missing;
            const from = start + isMove;

            if (from !== to) {
              moves.push([from, to]);
            }
          }
        }

        if (deleteCount > values.length) {
          currentAtomicSplice.deleteCount += deleteCount - values.length;
          splices.push(currentAtomicSplice);
        } else if (currentAtomicSplice.values.length > 0) {
          splices.push(currentAtomicSplice);
        }

        if (moves.length === 0) {
          return updates.push(
            spliceBoundaries.bind(null, start, deleteCount, ...values),
          );
        }

        updates.push(moveBoundaries.bind(null, moves));

        for (const { start, deleteCount, values } of splices) {
          updates.push(
            spliceBoundaries.bind(null, start, deleteCount, ...values),
          );
        }
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
            // updates are already handled are the reactive object level for non primitive types
            if (typeof args.value !== "object") {
              args.value = e.newValue;
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
                if (labels.length > 0) {
                  const moves: [number, number][] = labels.map((
                    [a, b],
                  ) => [+a * 10, +b * 10]);

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
          this.replaceChildren(String(content[key] ?? ""));
        } else if (path !== `.data.${key}`) return;

        this.replaceChildren(String(e.newValue ?? ""));
      });
    } else if (isShowSink(data)) {
      const { ifCase, elseCase } = data;

      if (data.cond) {
        this.renderSafeSink(ifCase());
      } else if (elseCase) {
        this.renderSafeSink(elseCase());
      }

      addListener(data, (e) => {
        if (e.type !== "update" || e.path !== ".cond") return;

        maybeViewTransition(() => {
          this.deleteContents();

          if (e.newValue) {
            this.renderSafeSink(ifCase());
          } else if (elseCase) {
            this.renderSafeSink(elseCase());
          }
        }, this.parentElement);
      });
    } else if (!isUnsafeHTML(data)) {
      this.renderSafeSink(data as any);
    } else {
      // unsafe sink
      const template = document.createElement("template");

      addListener(data, (e) => {
        switch (e.type) {
          case "update":
            template.innerHTML = e.newValue;
            this.replaceChildren(template.content);
            break;
        }
      });
    }

    this.isContentsConnected = true;
  }

  renderSafeSink(data: DocumentFragment | ReactiveLeaf | Primitive) {
    const content = isReactiveLeaf(data) ? data.value : data;

    if (content instanceof DocumentFragment) {
      this.#end.before(content);
    } else {
      // a text node is a safe sink
      this.#end.before(String(content ?? ""));
    }

    if (!isReactiveLeaf(data)) return;

    addListener(data, (e) => {
      if (!this.isContentsConnected) return;
      if (e.type !== "update" && e.type !== "delete") return;
      if (e.path !== ".value") return;

      switch (e.type) {
        case "update": {
          const newValue = snapshot(e.newValue);
          if (newValue instanceof DocumentFragment) {
            this.replaceChildren(newValue);
          } else {
            this.replaceChildren(String(e.newValue ?? ""));
          }
          break;
        }

        case "delete":
          this.deleteContents();
          break;
      }
    });

    this.isContentsConnected = true;
  }

  replaceChildren(...nodes: (Node | string)[]) {
    this.range.setStartAfter(this.#start);
    this.range.setEndBefore(this.#end);
    this.range.deleteContents();
    this.#end.before(...nodes);
  }
}

type UpdateCallback = undefined | (() => void | Promise<void>);
type StartViewTransitionOptions = {
  types?: string[];
  update?: UpdateCallback;
};

function maybeViewTransition(
  param: StartViewTransitionOptions | UpdateCallback,
  element?: HTMLElement | null | undefined,
) {
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
