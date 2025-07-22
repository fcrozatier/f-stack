import { assert, assertExists } from "./assert.ts";
import { isComponent } from "./component.ts";
import { effect, isSignal } from "./signals.ts";

const boundaries: Boundary<any>[] = [];

export class Boundary<T> {
  #start: Comment | undefined;
  #end: Comment | undefined;

  id: number;
  range: Range;
  data: T;

  constructor(data: T) {
    this.id = boundaries.length;
    this.range = new Range();
    this.data = data;

    boundaries.push(this);
  }

  set start(comment: Comment) {
    assert(comment.data === `<${this.id}>`, "Unmatched id");
    this.#start = comment;
  }

  set end(comment: Comment) {
    assert(comment.data === `</${this.id}>`, "Unmatched id");
    this.#end = comment;
  }

  toString() {
    return `<!--<${this.id}>--><!--</${this.id}>-->`;
  }

  cleanup() {
    assertExists(this.#start);
    assertExists(this.#end);

    this.range.setStartAfter(this.#start);
    this.range.setEndBefore(this.#end);
    this.range.deleteContents();
  }

  render() {
    effect(() => {
      assertExists(this.#end);

      if (isSignal(this.data)) {
        // Can be a string, or a DocumentFragment
        this.#end.before(this.data.value);
      } else if (isComponent(this.data)) {
        // Can be a string, or a DocumentFragment
        this.#end.before(this.data.call());
      } else if (typeof this.data === "function") {
        this.#end.before(this.data.call(null));
      }

      return () => {
        this.cleanup();
      };
    });
  }

  static get(id: number) {
    return boundaries[id];
  }
}
