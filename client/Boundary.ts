import { assert } from "./assert.ts";
import {
  addListener,
  isLeafValue,
  reactive,
  target,
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

  deleteContents() {
    this.range.setStartAfter(this.#start);
    this.range.setEndBefore(this.#end);
    this.range.deleteContents();
  }

  delete() {
    this.range.setStartBefore(this.#start);
    this.range.setEndAfter(this.#end);
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
      const boundaries: Boundary[] = reactive([]);

      const spliceBoundaries = (
        start: number,
        deleteCount = 0,
        ...values: any[]
      ) => {
        for (
          const boundary of boundaries
            .slice(start, start + deleteCount)
        ) boundary.delete();

        const newBoundaries: Boundary[] = [];

        for (const value of values) {
          const args = reactive({ index: start + newBoundaries.length, value });
          const newBoundary = new Boundary(data.mapper(args));
          newBoundaries.push(newBoundary);

          addListener(boundaries, (e) => {
            if (e.path === ".findIndex") return;

            const newIndex = boundaries.findIndex((b) => b === newBoundary);
            if (args.index !== newIndex) {
              args.index = newIndex;
            }
          });
        }

        const next = boundaries[start + deleteCount]?.start ?? this.end;
        boundaries.splice(start, deleteCount, ...newBoundaries);

        for (const boundary of newBoundaries) {
          next.before(boundary.start);
          next.before(boundary.end);
          boundary.render();
        }
      };

      // insert initial values
      spliceBoundaries(boundaries.length, 0, ...values);

      // Creates a functorial relation with the original reactive array
      addListener(values, (e) => {
        console.log(e);
        if (typeof e.path !== "string") return;

        switch (e.type) {
          case "apply": {
            switch (e.path) {
              case ".push":
                spliceBoundaries(boundaries.length, 0, ...e.args);
                break;
              case ".unshift":
                spliceBoundaries(0, 0, ...e.args);
                break;
              case ".concat":
                spliceBoundaries(boundaries.length, 0, ...e.args[0]);
                break;

              case ".pop":
                spliceBoundaries(boundaries.length - 1, 1);
                break;
              case ".shift":
                spliceBoundaries(0, 1);
                break;

              case ".splice": {
                const [start, deleteCount, ...values] = e.args;
                spliceBoundaries(start, deleteCount, ...values);
                break;
              }
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
