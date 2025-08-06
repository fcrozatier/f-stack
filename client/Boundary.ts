import { assert, assertExists } from "./assert.ts";
import { effect, isSignal, ReactiveArray } from "./reactivity/signals.ts";
import { isArraySink, isUnsafeHTML } from "./sinks.ts";

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

  deleteContents() {
    this.range.setStartAfter(this.#start);
    this.range.setEndBefore(this.#end);
    this.range.deleteContents();
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
      const values = data.arrayLike;
      const boundaries = Array.from({ length: values.length })
        .map((_, i) => new Boundary(data.mapper(values[i], i)));

      const end = this.#end;

      // Creates a functorial relation with the original reactive array
      // With each boundary receiving fine grained listeners
      // So updating the values surgically updates the fragments
      if (values instanceof ReactiveArray) {
        values.on("deleteProperty", (_target, property) => {
          if (typeof property === "string" && /^\d+$/.test(property)) {
            const boundary = boundaries[+property];
            boundary?.deleteContents();
            boundary?.end.remove();
            boundary?.start.remove();
            boundaries.splice(+property, 1);
          }
        });

        values.on("defineProperty", (_target, property, attributes) => {
          if (typeof property === "string" && /^\d+$/.test(property)) {
            if (+property >= boundaries.length) {
              const newBoundary = new Boundary(
                data.mapper(attributes.value, +property),
              );
              boundaries[+property] = newBoundary;
              end.before(newBoundary.start);
              end.before(newBoundary.end);
              newBoundary.render();
            } else {
              const boundary = boundaries[+property];
              assertExists(boundary);
              boundary.data = data.mapper(attributes.value, +property);
              boundary.deleteContents();
              boundary.render();
            }
          }
        });
      }

      // Add initial values
      for (const boundary of boundaries) {
        end.before(boundary.start);
        end.before(boundary.end);
        boundary.render();
      }
    } else if (!isUnsafeHTML(data)) {
      effect(() => {
        const content = isSignal(data) ? data.value : data;

        if (content instanceof DocumentFragment) {
          this.#end.before(content);
        } else {
          // strings are inserted as text nodes which is a safe sink
          this.#end.before(String(content ?? ""));
        }
        return () => this.deleteContents();
      });
    } else {
      const unsafeData = data.unsafe;
      const template = document.createElement("template");

      effect(() => {
        template.innerHTML = isSignal(unsafeData)
          ? unsafeData.value
          : unsafeData;

        // unsafe strings are inserted as-is
        this.#end.before(template.content);
        return () => this.deleteContents();
      });
    }
  }
}
