import { assert, assertExists } from "./assert.ts";
import { isComponent } from "./component.ts";
import { effect, isSignal } from "./signals.ts";

let id = 0;

export class Boundary<T> {
  #start: Comment | undefined;
  #end: Comment | undefined;

  id: number;
  range: Range;
  data: T;

  constructor(data: T) {
    this.id = id++;
    this.range = new Range();
    this.data = data;
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
    if (isSignal(this.data)) {
      effect(() => {
        assertExists(this.#end);
        assert(isSignal(this.data), "can't change type");

        this.#end.before(this.data.value);
        return () => {
          this.cleanup();
        };
      });
    } else if (isComponent(this.data)) {
      assertExists(this.#end);
      this.#end.before(this.data.call());
    } else if (typeof this.data === "function") {
      effect(() => {
        assertExists(this.#end);
        assert(typeof this.data === "function", "can't change type");

        this.#end.before(this.data.call(null));
        return () => {
          this.cleanup();
        };
      });
    }
  }
}
