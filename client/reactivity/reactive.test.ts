import { assert, assertEquals, assertExists } from "@std/assert";
import {
  addListener,
  equals,
  flushSync,
  isReactive,
  reactive,
  type ReactiveEvent,
  target,
} from "./reactive.ts";

// Fundamentals

Deno.test("get/set values", () => {
  const r = reactive({ a: 1, b: { c: true } });
  // get
  assertEquals(r.a, 1);

  // set
  r.a = 2;
  assertEquals(r.a, 2);

  // references work as expected
  const b = r.b;
  const b2 = r.b; // Make sure it's the same ref
  assertEquals(b, b2);

  // updating the reference updates the original
  b.c = false;
  assertEquals(r.b.c, false);

  // updating the reference updates other references
  assertEquals(b2.c, false);
});

Deno.test("functions", () => {
  const logs = [];
  const r = reactive({ a: () => logs.push(Math.random()) });
  const f = reactive(() => logs.push(Math.random()));

  assertEquals(isReactive(r.a), true);
  assertEquals(isReactive(f), true);

  r.a();
  assertEquals(logs.length, 1);

  f();
  assertEquals(logs.length, 2);
});

Deno.test("value listeners", () => {
  const r: Record<string, unknown> = reactive({ a: 1 });
  let event: ReactiveEvent | undefined;

  addListener(r, (e) => (event = e));

  // create
  r.new = true;
  flushSync();
  assertEquals(event, { type: "create", path: ".new", newValue: true });

  // update
  r.a = 2;
  flushSync();
  assertEquals(event, { type: "update", path: ".a", newValue: 2, oldValue: 1 });

  // delete
  delete r.a;
  flushSync();
  // Some APIs need to know the deleted value e.g. to communicate with removeEventListener
  assertEquals(event, { type: "delete", path: ".a", oldValue: 2 });
});

Deno.test("function listeners", () => {
  const logs = [];

  const f1 = () => logs.push(1);
  const f2 = () => logs.push(2);

  const r: Record<string, () => any> = reactive({ a: f1 });

  const events: ReactiveEvent[] = [];
  addListener(r, (e) => events.push(e));

  assertEquals(logs.length, 0);

  r.a?.();
  flushSync();
  assertEquals(logs.length, 1);
  assertEquals(events.length, 1);
  assertEquals(events[0], { type: "apply", path: ".a", args: [] });

  // events return proxied values for consistency
  const old = r.a;
  r.a = f2;
  flushSync();
  assertEquals(events.length, 2);
  assertEquals(events[1]!, {
    type: "update",
    path: ".a",
    oldValue: old,
    newValue: r.a,
  });
  // @ts-ignore
  assertEquals(target(events[1]!.newValue), f2);

  r.a();
  flushSync();
  assertEquals(logs.length, 2);
  assertEquals(events.length, 3);
  assertEquals(events[2], { type: "apply", path: ".a", args: [] });

  const oldValue = r.a;
  delete r.a;
  flushSync();
  assertEquals(events.length, 4);
  assertEquals(events[3], { type: "delete", path: ".a", oldValue });
});

// Properties

Deno.test("events collapse", () => {
  const r: Record<string, unknown> = reactive({ a: 1 });

  const events: ReactiveEvent[] = [];
  addListener(r, (e) => events.push(e));

  // no update to the initial state
  r.a = 1;
  flushSync();
  assertEquals(events, []);

  // only one event is fired per batch
  r.a = 2;
  r.a = 3;
  r.a = 4;
  flushSync();
  assertEquals(events.length, 1);
  assertEquals(events[0], {
    type: "update",
    path: ".a",
    newValue: 4,
    oldValue: 1,
  });

  events.length = 0;

  // no update to the same state
  r.a = 4;
  flushSync();
  assertEquals(events, []);
});

Deno.test("only dependencies trigger events", () => {
  const r: Record<string, any> = reactive({ a: 1, b: 2 });
  const s = reactive({
    get v() {
      return r.a + 1;
    },
  });

  const events: ReactiveEvent[] = [];
  addListener(s, (e) => events.push(e));

  // no event is triggered on s when updating something it doesn't depend on
  r.b = 3;
  r.c = true;
  delete r.b;

  assertEquals(events.length, 0);
});

Deno.test("glitch free (diamond)", () => {
  const a = reactive({ a: 1 });
  const b = reactive({
    get b() {
      return a.a + 1;
    },
  });
  const c = reactive({
    get c() {
      return 2 * a.a;
    },
  });

  // a naive depth-first synchronous event updates strategy would cause the chain of recomputations a -> b -> d -> (then) c -> (then again) d and we catch the glitch in the first update of d
  let seenGlitch = false;
  const d = reactive({
    get d() {
      if (b.b !== a.a + 1 || c.c !== 2 * a.a) {
        seenGlitch = true;
      }
      return b.b + c.c;
    },
  });

  let aEvent: ReactiveEvent | undefined;
  addListener(a, (e) => (aEvent = e));

  let bEvent: ReactiveEvent | undefined;
  addListener(b, (e) => (bEvent = e));

  let cEvent: ReactiveEvent | undefined;
  addListener(c, (e) => (cEvent = e));

  let dEvent: ReactiveEvent | undefined;
  addListener(d, (e) => (dEvent = e));

  assertEquals(d.d, 2 + 2);
  assertEquals(seenGlitch, false);

  a.a = 2;
  assertEquals(seenGlitch, false);

  flushSync();
  // The event propagates the latest computed value
  assertEquals(dEvent, {
    type: "update",
    path: ".d",
    newValue: 7,
    oldValue: 4,
  });
  assertEquals(cEvent, {
    type: "update",
    path: ".c",
    newValue: 4,
    oldValue: 2,
  });
  assertEquals(bEvent, {
    type: "update",
    path: ".b",
    newValue: 3,
    oldValue: 2,
  });
  assertEquals(aEvent, {
    type: "update",
    path: ".a",
    newValue: 2,
    oldValue: 1,
  });

  assertEquals(d.d, 7);
  assertEquals(seenGlitch, false);
});

Deno.test("preserve correct 'this' binding in getters/setters", () => {
  const obj = reactive({
    get value() {
      return this._hidden;
    },
    _hidden: 123,
  });

  const derived = Object.create(obj);
  derived._hidden = 456;

  assertEquals(derived.value, 456); // not 123
});

Deno.test("preserve `this` binding in reactive functions", () => {
  const r = reactive({
    _x: 42,
    getX() {
      return this._x;
    },
  });

  const u = {
    _x: 24,
  };

  const events: ReactiveEvent[] = [];
  addListener(r, (e) => events.push(e));

  // already bound
  const getX = r.getX;
  assertEquals(getX(), 42);

  // noop
  const bound = r.getX.bind(r);
  assertEquals(bound(), 42);

  // can be re-bound
  const rebound = target(getX).bind(u);
  assertEquals(rebound(), 24);
});

Deno.test("identity can be tested", () => {
  const obj = {};
  const obj2 = { internal: obj };

  const r = reactive(obj);
  const r2 = reactive(obj2);

  assert(r !== obj);
  assert(equals(r, obj));

  assert(r2 !== obj2);
  assert(equals(r2, obj2));

  assert(r2.internal !== obj2.internal);
  assert(equals(r2.internal, obj2.internal));

  const f = () => {};
  function g() {}

  const rf = reactive(f);
  const rg = reactive({ g: g });

  assert(rf !== f);
  assert(equals(rf, f));

  assert(rg.g !== g);
  assert(equals(rg.g, g));
});

Deno.test("destructuring object maintains reactivity", () => {
  const r = reactive({ first: { a: true }, second: 2 });
  const { first } = r;

  const firstEvents: ReactiveEvent[] = [];
  addListener(first, (e) => firstEvents.push(e));

  const rEvents: ReactiveEvent[] = [];
  addListener(r, (e) => rEvents.push(e));

  // updating `r` triggers the update event on `first`
  r.first.a = false;
  flushSync();

  assertEquals(firstEvents.length, 1);
  assertEquals(firstEvents[0]!, {
    type: "update",
    path: ".a",
    newValue: false,
    oldValue: true,
  });

  // updating `first` triggers the update event on `r`
  first.a = true;
  flushSync();

  assertEquals(rEvents.length, 2);
  assertEquals(rEvents[1]!, {
    type: "update",
    path: ".first.a",
    newValue: true,
    oldValue: false,
  });
});

Deno.test("reactive iterables can be mutated during iteration", () => {
  // Array
  const arr = reactive([{ a: 1 }]);

  const events: ReactiveEvent[] = [];
  addListener(arr, (e) => events.push(e));

  // returns a proxied iterator
  for (const element of arr) {
    element.a += 1;
  }

  flushSync();
  assertEquals(events.length, 1);
  assertEquals(events[0], {
    type: "update",
    path: ".0.a", // tracks updated key
    oldValue: 1,
    newValue: 2,
  });

  // Map
  const map = reactive(new Map([["a", { value: true }]]));

  addListener(map, (e) => events.push(e));

  // we can destructure iterated items
  for (const [_k, item] of map) {
    item.value = false;
  }

  flushSync();
  assertEquals(events.length, 2);
  assertEquals(events[1], {
    type: "update",
    path: ".a.value", // tracks updated key
    oldValue: true,
    newValue: false,
  });
  assertEquals(map.get("a")?.value, false);
});

// Derived values

Deno.test("derivation", () => {
  const first = reactive({ a: true });
  const second = reactive({
    get b() {
      return !first.a;
    },
  });

  let event: ReactiveEvent | undefined;

  addListener(second, (e) => (event = e));

  assertEquals(first.a, true);
  assertEquals(second.b, false);

  first.a = false;
  flushSync();

  assertEquals(first.a, false);
  assertEquals(second.b, true);

  // The event represent the latest value not a's value
  assertEquals(event, {
    type: "update",
    path: ".b",
    newValue: true,
    oldValue: false,
  });
});

Deno.test("nested derivations", () => {
  const user = reactive({ first: "John", last: "Doe" });
  const lower = reactive({
    get first() {
      return user.first.toLowerCase();
    },
    get last() {
      return user.last.toLowerCase();
    },
  });
  const fullname = reactive({
    get value() {
      return lower.first + " " + lower.last;
    },
  });

  const events: ReactiveEvent[] = [];
  addListener(fullname, (e) => (events.push(e)));

  assertEquals(lower.first, "john");
  assertEquals(lower.last, "doe");
  assertEquals(fullname.value, "john doe");

  user.first = "JOHNNY";
  flushSync();

  assertEquals(lower.first, "johnny");
  assertEquals(lower.last, "doe");
  assertEquals(fullname.value, "johnny doe");

  assertEquals(events.length, 1);
  assertEquals(events[0], {
    type: "update",
    path: ".value",
    newValue: "johnny doe",
    oldValue: "john doe",
  });
});

Deno.test("derived values are cached", () => {
  let recomputeFirst = 0;
  let recomputeFull = 0;

  const user = reactive({ first: "John", last: "Doe" });
  const lower = reactive({
    get first() {
      recomputeFirst++;
      return user.first.toLowerCase();
    },
    get last() {
      return user.last.toLowerCase();
    },
  });
  const fullname = reactive({
    get value() {
      recomputeFull++;
      return lower.first + " " + lower.last;
    },
  });

  assertEquals(recomputeFirst, 0);
  assertEquals(recomputeFull, 0);

  assertEquals(lower.first, "john");

  assertEquals(recomputeFirst, 1);
  assertEquals(recomputeFull, 0);

  assertEquals(fullname.value, "john doe");

  assertEquals(recomputeFirst, 1);
  assertEquals(recomputeFull, 1);

  user.first = "JOHNNY";
  flushSync();

  assertEquals(recomputeFirst, 1);
  assertEquals(recomputeFull, 1);

  assertEquals(lower.first, "johnny");

  assertEquals(recomputeFirst, 2);
  assertEquals(recomputeFull, 1);

  assertEquals(fullname.value, "johnny doe");
  assertEquals(recomputeFirst, 2);
  assertEquals(recomputeFull, 2);
});

// Adoption

Deno.test("can adopt another reactive", () => {
  const bool = reactive({ value: false });
  const r = reactive({ a: bool });

  const events: ReactiveEvent[] = [];
  addListener(r, (e) => events.push(e));

  // the dependency tracking between r and bool begins when the path is taken
  assertEquals(r.a.value, false);

  // update bool
  bool.value = true;
  flushSync();
  assertEquals(r.a.value, true);
  assertEquals(events.length, 1);
  assertEquals(events[0], {
    type: "update",
    path: ".a.value",
    newValue: true,
    oldValue: false,
  });
});

Deno.test("multi-parent adoption", () => {
  const bool = reactive({ value: false });
  const r = reactive({ a: bool });
  const r1 = reactive({ a1: bool });
  const r2 = reactive({ a2: bool });

  let event: ReactiveEvent | undefined;
  let event1: ReactiveEvent | undefined;
  let event2: ReactiveEvent | undefined;

  addListener(r, (e) => (event = e));
  addListener(r1, (e) => (event1 = e));
  addListener(r2, (e) => (event2 = e));

  // the dependency tracking between r and bool begins when the path is taken
  assertEquals(r.a.value, false);
  assertEquals(r1.a1.value, false);
  assertEquals(r2.a2.value, false);

  // update bool
  bool.value = true;
  flushSync();
  assertEquals(r.a.value, true);
  assertEquals(r1.a1.value, true);
  assertEquals(r2.a2.value, true);

  assertEquals(event, {
    type: "update",
    path: ".a.value",
    newValue: true,
    oldValue: false,
  });
  assertEquals(event1, {
    type: "update",
    path: ".a1.value",
    newValue: true,
    oldValue: false,
  });
  assertEquals(event2, {
    type: "update",
    path: ".a2.value",
    newValue: true,
    oldValue: false,
  });
});

// Listeners

Deno.test("deep listeners", () => {
  const r = reactive({ a: { b: { c: { d: { e: { f: true } } } } } });
  let event: ReactiveEvent | undefined;
  addListener(r, (e) => (event = e));

  const refC = r.a.b.c;
  let refCEvent: ReactiveEvent | undefined;
  addListener(refC, (e) => (refCEvent = e));

  const refD = r.a.b.c.d;
  let refDEvent: ReactiveEvent | undefined;
  addListener(refD, (e) => (refDEvent = e));

  const refE = r.a.b.c.d.e;
  let refEEvent: ReactiveEvent | undefined;
  addListener(refE, (e) => (refEEvent = e));

  // root, c and d see the create event but not e
  // @ts-ignore
  r.a.b.c.d.new = true;
  flushSync();

  assertEquals(event, { type: "create", path: ".a.b.c.d.new", newValue: true });
  assertEquals(refCEvent, {
    type: "create",
    path: ".d.new",
    newValue: true,
  });
  assertEquals(refDEvent, {
    type: "create",
    path: ".new",
    newValue: true,
  });
  assertEquals(refEEvent, undefined);

  // update
  // @ts-ignore
  r.a.b.c.d.new = false;
  flushSync();

  assertEquals(event, {
    type: "update",
    path: ".a.b.c.d.new",
    newValue: false,
    oldValue: true,
  });
  assertEquals(refCEvent, {
    type: "update",
    path: ".d.new",
    newValue: false,
    oldValue: true,
  });
  assertEquals(refDEvent, {
    type: "update",
    path: ".new",
    newValue: false,
    oldValue: true,
  });
  assertEquals(refEEvent, undefined);

  // delete
  // @ts-ignore
  delete r.a.b.c.d.new;
  flushSync();

  assertEquals(event, {
    type: "delete",
    path: ".a.b.c.d.new",
    oldValue: false,
  });
  assertEquals(refCEvent, {
    type: "delete",
    path: ".d.new",
    oldValue: false,
  });
  assertEquals(refDEvent, {
    type: "delete",
    path: ".new",
    oldValue: false,
  });
  assertEquals(refEEvent, undefined);
});

// Functoriality

Deno.test("object functoriality", () => {
  const r = reactive({});

  const mirror = {};

  addListener(r, (e) => {
    const root = ".";
    if (typeof e.path !== "string") return;

    const paths = e.path.split(root).slice(1);
    assertEquals(paths.length, 1);
    assertExists(paths[0]);
    const path = paths[0];

    switch (e.type) {
      case "create": {
        Object.defineProperty(mirror, path, {
          value: e.newValue,
          enumerable: true,
          writable: true,
          configurable: true,
        });

        break;
      }
      case "update":
        // @ts-ignore
        mirror[path] = e.newValue;
        break;
      case "delete":
        // @ts-ignore
        delete mirror[path];
        break;
    }
  });

  // we can transport operations on root

  // @ts-ignore
  r.a = 1;
  flushSync();
  assertEquals(mirror, { a: 1 });

  // update
  // @ts-ignore
  r.a = 2;
  flushSync();
  assertEquals(mirror, { a: 2 });

  // delete
  // @ts-ignore
  delete r.a;
  flushSync();
  assertEquals(mirror, {});
});

Deno.test("deep object functoriality", () => {
  const r = reactive({ a: { b: { c: {} } } });
  const ref = r.a.b.c;
  const mirror = {};

  addListener(ref, (e) => {
    if (typeof e.path !== "string") return;

    const paths = e.path.split(".").slice(1);

    assertEquals(paths.length, 1, "the path didn't have length 1");
    assertExists(paths[0]);
    const path = paths[0];

    switch (e.type) {
      case "create": {
        Object.defineProperty(mirror, path, {
          value: e.newValue,
          enumerable: true,
          writable: true,
          configurable: true,
        });

        break;
      }
      case "update":
        // @ts-ignore
        mirror[path] = e.newValue;
        break;
      case "delete":
        // @ts-ignore
        delete mirror[path];
        break;
    }
  });

  // we can transport operations on root

  // @ts-ignore
  ref.a = 1;
  flushSync();
  assertEquals(mirror, { a: 1 });

  // update
  // @ts-ignore
  ref.a = 2;
  flushSync();
  assertEquals(mirror, { a: 2 });

  // delete
  // @ts-ignore
  delete ref.a;
  flushSync();
  assertEquals(mirror, {});
});

// Data structures

Deno.test("array functoriality", () => {
  const r: number[] = reactive([]);
  const mirror: number[] = [];

  addListener(r, (e) => {
    const root = ".";
    if (typeof e.path !== "string") return;

    const paths = e.path.split(root).slice(1);

    assertEquals(paths.length, 1);
    assertExists(paths[0]);
    const path = paths[0];

    switch (e.type) {
      case "create":
      case "update":
        // @ts-ignore
        mirror[path] = e.newValue;
        break;
      case "delete":
        // @ts-ignore
        delete mirror[path];
        break;
      case "apply": {
        // @ts-ignore
        mirror[path](...e.args);
      }
    }
  });

  // we can transport operations

  // @ts-ignore
  r[0] = 1;
  flushSync();
  assertEquals(r, [1]);
  assertEquals(mirror, [1]);

  // update
  // @ts-ignore
  r[0] = 2;
  flushSync();
  assertEquals(r, [2]);
  assertEquals(mirror, [2]);

  // delete
  // @ts-ignore
  r.length = 0;
  flushSync();
  assertEquals(r, []);
  assertEquals(mirror, []);

  let length = r.push(1, 2, 3);
  flushSync();
  assertEquals(length, 3);
  assertEquals(r, [1, 2, 3]);
  assertEquals(mirror, [1, 2, 3]);

  const last = r.pop();
  flushSync();
  assertEquals(last, 3);
  assertEquals(r, [1, 2]);
  assertEquals(mirror, [1, 2]);

  length = r.unshift(4);
  flushSync();
  assertEquals(length, 3);
  assertEquals(r, [4, 1, 2]);
  assertEquals(mirror, [4, 1, 2]);
});

Deno.test("array-derived values", () => {
  const r = reactive([1, 2, 3]);
  const derived = reactive({
    get sum() {
      return r.reduce((a, b) => a + b);
    },
  });

  const events: ReactiveEvent[] = [];
  addListener(derived, (e) => events.push(e));

  assertEquals(derived.sum, 6);

  r.push(4);
  flushSync();

  assertEquals(derived.sum, 10);
  assertEquals(events.length, 1);
  assertEquals(events[0], {
    type: "update",
    path: ".sum",
    oldValue: 6,
    newValue: 10,
  });
});

Deno.test("Map functoriality", () => {
  const r = reactive(new Map());
  const mirror = {};

  addListener(r, (e) => {
    if (e.type === "apply") {
      switch (e.path) {
        case ".set": {
          // @ts-ignore
          const [k, v] = e.args;
          // @ts-ignore
          mirror[k] = v;

          break;
        }
        case ".delete": {
          // @ts-ignore
          const [k] = e.args;
          // @ts-ignore
          delete mirror[k];
          break;
        }
        case ".clear": {
          for (const key in mirror) {
            // @ts-ignore
            delete mirror[key];
          }
          break;
        }
      }
    }
  });

  // we can transport operations

  assertEquals(r.size, 0);

  r.set("a", 1);
  r.set("b", true);
  flushSync();
  assertEquals(r.get("a"), 1);
  assertEquals(r.get("b"), true);
  assertEquals(mirror, { a: 1, b: true });

  // update
  r.set("a", 2);
  flushSync();
  assertEquals(r.get("a"), 2);
  assertEquals(mirror, { a: 2, b: true });

  // delete
  const deleted = r.delete("a");
  flushSync();
  assertEquals(deleted, true);
  assertEquals(mirror, { b: true });

  // clear
  r.clear();
  flushSync();
  assertEquals(r.size, 0);
  assertEquals(mirror, {});
});

Deno.test("map-derived values", () => {
  const r = reactive(new Map([["a", 1], ["b", 2], ["c", 3]]));
  const derived = reactive({
    get sum() {
      return r.values().reduce((a, b) => a + b);
    },
  });

  const events: ReactiveEvent[] = [];
  addListener(derived, (e) => events.push(e));

  assertEquals(derived.sum, 6);

  r.set("a", 4);
  flushSync();

  assertEquals(derived.sum, 9);
  assertEquals(events.length, 1);
  assertEquals(events[0], {
    type: "update",
    path: ".sum",
    oldValue: 6,
    newValue: 9,
  });
});
