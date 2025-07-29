import { assert } from "./assert.ts";
import { isUnsafeHTML } from "./attachement.ts";
import { isComponent } from "./component.ts";
import { effect, isSignal } from "./signals.ts";

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
    const data = this.data;

    if (isComponent(data)) {
      this.#end.before(data.call());
    } else if (typeof data === "function") {
      effect(() => {
        const nodes = data.call(null);

        if (nodes instanceof DocumentFragment) {
          this.#end.before(nodes);
        } else if (Array.isArray(nodes)) {
          this.#end.before(...nodes);
        } else {
          throw new Error("Unimplemented Boundary");
        }

        return () => {
          this.cleanup();
        };
      });
    } else if (!isUnsafeHTML(data)) {
      if (isSignal(data)) {
        effect(() => {
          // strings are inserted as text nodes which is a safe sink
          this.#end.before(String(data.value ?? ""));
          return () => {
            this.cleanup();
          };
        });
      } else {
        this.#end.before(String(this.data ?? ""));
      }
    } else {
      const unsafeData = data.unsafe;
      const template = document.createElement("template");

      if (isSignal(unsafeData)) {
        effect(() => {
          template.innerHTML = unsafeData.value;

          // unsafe strings are inserted as-is
          this.#end.before(template.content);
          return () => {
            this.cleanup();
          };
        });
      } else {
        template.innerHTML = unsafeData;
        this.#end.before(template.content);
      }
    }
  }
}
