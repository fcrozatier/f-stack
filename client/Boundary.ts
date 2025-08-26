import { assert, assertExists } from "./assert.ts";
import { addListener, isLeafValue, target } from "./reactivity/reactive.ts";
import { effect, ReactiveArray } from "./reactivity/signals.ts";
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

      addListener(values, (e) => {
        if (typeof e.path !== "string") return;
        const index = e.path.split(".")[1];
        if (!index || !/^\d+$/.test(index)) return;

        switch (e.type) {
          case "delete": {
            const boundary = boundaries[+index];
            boundary?.deleteContents();
            boundary?.end.remove();
            boundary?.start.remove();
            boundaries.splice(+index, 1);
            break;
          }

          default:
            break;
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
            const newValue = target(e.newValue);
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
