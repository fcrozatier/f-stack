import { assert } from "./assert.ts";
import { isComponent } from "./component.ts";
import { effect, isSignal } from "./signals.ts";

let id = 0;

export class Boundary<T> {
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

  set start(comment: Comment) {
    assert(comment.data === `<${this.id}>`, "Unmatched ids");
    this.#start = comment;
  }

  set end(comment: Comment) {
    assert(comment.data === `</${this.id}>`, "Unmatched ids");
    this.#end = comment;
  }

  toString() {
    return `<!--<${this.id}>--><!--</${this.id}>-->`;
  }

  cleanup() {
    this.range.setStartAfter(this.#start);
    this.range.setEndBefore(this.#end);
    this.range.deleteContents();
  }

  render() {
    if (isSignal(this.data)) {
      effect(() => {
        assert(isSignal(this.data), "Expected a Signal");

        this.#end.before(this.data.value);
        return () => {
          this.cleanup();
        };
      });
    } else if (isComponent(this.data)) {
      this.#end.before(this.data.call());
    } else if (typeof this.data === "function") {
      effect(() => {
        assert(
          typeof this.data === "function",
          "Expected a (nullary) function",
        );

        this.#end.before(this.data.call(null));
        return () => {
          this.cleanup();
        };
      });
    }
  }
}
