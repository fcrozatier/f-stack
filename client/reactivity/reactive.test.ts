import { assertEquals, assertExists } from "@std/assert";
import { addListener, reactive, type ReactiveEvent } from "./reactive.ts";

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

Deno.test("value listeners", () => {
  const r: Record<string, unknown> = reactive({ a: 1 });
  let event: ReactiveEvent | undefined;

  addListener(r, (e) => (event = e));

  // create
  r.new = true;
  assertEquals(event, { type: "create", path: ".new", value: true });

  // update
  r.a = 2;
  assertEquals(event, { type: "update", path: ".a", value: 2 });

  // delete
  delete r.a;
  assertEquals(event, { type: "delete", path: ".a" });
});

Deno.test("events collapse", () => {
  const r: Record<string, unknown> = reactive({ a: 1 });
  let event: ReactiveEvent | undefined;

  addListener(r, (e) => (event = e));

  // no "update" to the initial state event
  r.a = 1;
  assertEquals(event, undefined);

  r.a = 2;
  assertEquals(event, { type: "update", path: ".a", value: 2 });

  event = undefined;

  // no "update" to the same state event
  r.a = 2;
  assertEquals(event, undefined);
});

Deno.test("can adopt another reactive", () => {
  const bool = reactive({ value: false });
  const r = reactive({ a: bool });

  let event: ReactiveEvent | undefined;
  addListener(r, (e) => (event = e));

  // the dependency tracking between r and bool begins when the path is taken
  assertEquals(r.a.value, false);

  // update bool
  bool.value = true;
  assertEquals(r.a.value, true);
  assertEquals(event, { type: "update", path: ".a.value", value: true });
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
  assertEquals(r.a.value, true);
  assertEquals(r1.a1.value, true);
  assertEquals(r2.a2.value, true);

  assertEquals(event, { type: "update", path: ".a.value", value: true });
  assertEquals(event1, { type: "update", path: ".a1.value", value: true });
  assertEquals(event2, { type: "update", path: ".a2.value", value: true });
});

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
  assertEquals(event, { type: "create", path: ".a.b.c.d.new", value: true });
  assertEquals(refCEvent, {
    type: "create",
    path: ".d.new",
    value: true,
  });
  assertEquals(refDEvent, {
    type: "create",
    path: ".new",
    value: true,
  });
  assertEquals(refEEvent, undefined);

  // update
  // @ts-ignore
  r.a.b.c.d.new = false;
  assertEquals(event, { type: "update", path: ".a.b.c.d.new", value: false });
  assertEquals(refCEvent, {
    type: "update",
    path: ".d.new",
    value: false,
  });
  assertEquals(refDEvent, {
    type: "update",
    path: ".new",
    value: false,
  });
  assertEquals(refEEvent, undefined);

  // delete
  // @ts-ignore
  delete r.a.b.c.d.new;
  assertEquals(event, { type: "delete", path: ".a.b.c.d.new" });
  assertEquals(refCEvent, {
    type: "delete",
    path: ".d.new",
  });
  assertEquals(refDEvent, {
    type: "delete",
    path: ".new",
  });
  assertEquals(refEEvent, undefined);
});

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
          value: e.value,
          enumerable: true,
          writable: true,
          configurable: true,
        });

        break;
      }
      case "update":
        // @ts-ignore
        mirror[path] = e.value;
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
  assertEquals(mirror, { a: 1 });

  // update
  // @ts-ignore
  r.a = 2;
  assertEquals(mirror, { a: 2 });

  // delete
  // @ts-ignore
  delete r.a;
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
          value: e.value,
          enumerable: true,
          writable: true,
          configurable: true,
        });

        break;
      }
      case "update":
        // @ts-ignore
        mirror[path] = e.value;
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
  assertEquals(mirror, { a: 1 });

  // update
  // @ts-ignore
  ref.a = 2;
  assertEquals(mirror, { a: 2 });

  // delete
  // @ts-ignore
  delete ref.a;
  assertEquals(mirror, {});
});

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
        mirror[path] = e.value;
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
  assertEquals(mirror, [1]);

  // update
  // @ts-ignore
  r[0] = 2;
  assertEquals(mirror, [2]);

  // delete
  // @ts-ignore
  r.length = 0;
  assertEquals(mirror, []);

  r.push(1, 2, 3);
  assertEquals(mirror, [1, 2, 3]);

  r.pop();
  assertEquals(mirror, [1, 2]);

  r.unshift(4);
  assertEquals(mirror, [4, 1, 2]);
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

  r.set("a", 1);
  r.set("b", true);
  assertEquals(mirror, { a: 1, b: true });

  // update
  r.set("a", 2);
  assertEquals(mirror, { a: 2, b: true });

  // delete
  r.delete("a");
  assertEquals(mirror, { b: true });

  // clear
  r.clear();
  assertEquals(mirror, {});
});
