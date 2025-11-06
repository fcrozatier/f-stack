import {
  isPrimitive,
  isReactiveLeaf,
  listen,
  reactive,
  type ReactiveLeaf,
  snapshot,
} from "@f-stack/functorial";
import { assert } from "@std/assert/assert";
import { assertExists } from "@std/assert/exists";
import {
  type DerivedSink,
  isMapSink,
  isShowSink,
  isTemplateSink,
  isTextSink,
  isUnsafeHTML,
  type Sink,
} from "./sinks.ts";

/**
 * A {@linkcode Boundary} is a disposable live `DocumentFragment` with a start and end `Comment` nodes.
 *
 * @internal
 */
export class Boundary {
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
   */
  data: Sink;

  /**
   * Creates a new {@linkcode Boundary}
   */
  constructor(data: Sink) {
    this.data = data;
  }

  /**
   * Returns the start `Comment` of the {@linkcode Boundary}
   */
  get start(): Comment {
    return this.#start;
  }

  set start(comment) {
    this.#start = comment;
  }

  /**
   * Returns the end `Comment` of the {@linkcode Boundary}
   */
  get end(): Comment {
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
   * @param target The target `Node` where to move the {@linkcode Boundary} before
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

  /**
   * Returns the {@linkcode Boundary}'s parent `Element` or null
   */
  get parentElement(): HTMLElement | null {
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

      const boundaries: {
        index: ReactiveLeaf<number>;
        data: any;
        boundary: Boundary;
      }[] = [];

      let labels: [string, string][] = [];

      type SpliceOptions = {
        start: number;
        deleteCount: number;
        values: any[];
      };

      const updates: (() => void)[] = [];

      // removes/inserts adjacent values by deleting/creating boundaries to trigger the right View Transitions
      const spliceBoundaries = (
        start: number,
        deleteCount: number = 0,
        ...values: any[]
      ) => {
        for (
          const { boundary } of boundaries.slice(
            start,
            start + deleteCount,
          )
        ) boundary.remove();

        const newBoundaries: {
          index: ReactiveLeaf<number>;
          data: any;
          boundary: Boundary;
        }[] = [];

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
      const moveAndSpliceBoundaries = (
        start: number,
        deleteCount: number = 0,
        ...values: any[]
      ) => {
        const splices: SpliceOptions[] = [];

        type Tag = { type: "insert" | "delete" | "swap" } | {
          type: "move";
          from: number;
          to: number;
        };

        const tags: { deleteRange: Tag[]; insertRange: Tag[] } = {
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
        let currentAtomicSplice: SpliceOptions = {
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

        const moves: [from: number, to: number][] = [];
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
        listen(values, (e) => {
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
                    const moves: [number, number][] = labels.map(
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
        listen(content, (e) => {
          if (e.type !== "update") return;
          if (e.path !== `.${key}`) return;
          textNode.data = String(e.newValue ?? "");
        }),
      );
    } else if (isShowSink(data)) {
      const setup = (
        currentCase: (() => DerivedSink) | undefined,
      ): DisposableStack | undefined => {
        if (currentCase) {
          return this.renderDerivedSink(currentCase());
        }
      };

      let cleanup = setup(data.cond ? data.ifCase : data.elseCase);

      this.disposer.use(
        listen(data, (e) => {
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
        listen(data, (e) => {
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
   */
  renderDerivedSink(data: DerivedSink): DisposableStack {
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
      listen(data, (e) => {
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
   */
  replaceChildren(...nodes: (Node | string)[]) {
    if (this.parentElement) {
      this.range.setStartAfter(this.#start);
      this.range.setEndBefore(this.#end);
      this.range.deleteContents();
      this.#end.before(...nodes);
    }
  }
}

type UpdateCallback = undefined | (() => void | Promise<void>);

interface StartViewTransitionOptions {
  types?: string[];
  update?: UpdateCallback;
}

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

  const first = permutation[0];
  assertExists(first);
  let from = first[0];

  let currentCycle: number[] = [from];

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
