import { assert } from "./assert.js";

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

  setStart(comment: Comment) {
    assert(comment.data === `<${this.id}>`);

    this.#start = comment;
    this.range.setStartBefore(comment);
  }

  setEnd(comment: Comment) {
    assert(comment.data === `</${this.id}>`);

    this.#end = comment;
    this.range.setEndAfter(comment);
  }

  toString() {
    return `<!--<${this.id}>--><!--</${this.id}>-->`;
  }

  static get(id: number) {
    return boundaries[id];
  }
}
