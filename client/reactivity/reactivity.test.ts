import { assertEquals } from "@std/assert";
import { assertExists } from "../assert.ts";
import { effect, flushSync, ReactiveArray, reactiveProxy } from "./signals.ts";

Deno.test("reactive array.push", () => {
  const original = [1, 2, 3];
  // Having to spread makes the reactivity boundary explicit, since the original array is not passed by reference
  const state = new ReactiveArray(...original);

  state.push(4);
  assertEquals(original.length, 3);
  assertEquals(original, [1, 2, 3]);
  assertEquals(state.length, 4);
  assertEquals(state, new ReactiveArray(...[1, 2, 3, 4]));
});

Deno.test("reactive array mutations", () => {
  const arr = new ReactiveArray("a", "b");

  let firstItemReads = 0;
  let firstItem: string | undefined;

  effect(() => {
    firstItemReads++;
    firstItem = arr[0];
  });

  // Reading values inside an effect makes them tracked
  assertEquals(firstItemReads, 1);
  assertEquals(firstItem, "a");

  // Pushing doesn't rerun `first`
  arr.push("c");
  flushSync();
  assertEquals(firstItemReads, 1);
  assertEquals(arr.length, 3);

  // But mutating the tracked index does
  arr[0] = "d";
  flushSync();
  assertEquals(firstItemReads, 2);
  assertEquals(firstItem, "d");
});

Deno.test("reactive array.slice", () => {
  const arr = new ReactiveArray("a", "b", "c");

  let sliceReads = 0;
  let sliceLength: number | undefined;

  effect(() => {
    sliceReads++;
    sliceLength = arr.slice(1).length;
  });

  assertEquals(sliceReads, 1);
  assertEquals(sliceLength, 2);

  // Pushing reruns the slice
  arr.push("d");
  flushSync();
  assertEquals(sliceReads, 2);
  assertEquals(sliceLength, 3);

  // But mutating index 0 doesn't rerun the slice which only tracks indices > 0
  arr[0] = "e";
  flushSync();
  assertEquals(sliceReads, 2);
  assertEquals(sliceLength, 3);
});

Deno.test("reactive array.join", () => {
  const arr = new ReactiveArray(1, 2, 3);

  let joinReads = 0;
  let join: string | undefined;

  effect(() => {
    joinReads++;
    join = arr.join(" + ");
  });

  assertEquals(joinReads, 1);
  assertEquals(join, "1 + 2 + 3");

  // Pushing reruns the join
  arr.push(4);
  flushSync();
  assertEquals(joinReads, 2);
  assertEquals(join, "1 + 2 + 3 + 4");

  // Mutating reruns the join
  arr[0] = 5;
  flushSync();
  assertEquals(joinReads, 3);
  assertEquals(join, "5 + 2 + 3 + 4");
});

Deno.test("reactive array length mutation", () => {
  const original = [1, 2, 3];
  const state = new ReactiveArray(...original);

  state.length = 0;
  assertEquals(original.length, 3);
  assertEquals(original, [1, 2, 3]);
  assertEquals(state.length, 0);
  assertEquals(state, new ReactiveArray());
});

// Deno.test("deep reactive arrays", () => {
//   const matrices = reactive([[[0, 1], [2, 3]]]) as [
//     [[number, number], [number, number]],
//   ];

//   let calls = 0;
//   const first = computed(() => {
//     calls++;
//     return matrices[0][0][0];
//   });

//   assertEquals(calls, 0);
//   assertEquals(first.value, 0);
//   assertEquals(calls, 1);

//   matrices[0][0][0] = 1;

//   assertEquals(calls, 1);
//   assertEquals(first.value, 1);
//   assertEquals(calls, 2);

//   matrices[0][0] = [2, 4];

//   assertEquals(calls, 2);
//   assertEquals(first.value, 2);
//   assertEquals(calls, 3);

//   matrices[0] = [[3, 4], [5, 6]];

//   assertEquals(calls, 3);
//   assertEquals(first.value, 3);
//   assertEquals(calls, 4);
// });

// Deno.test("reactive object", () => {
//   const obj = reactive({ a: "a" });

//   let calls = 0;
//   const a = computed(() => {
//     calls++;
//     return obj.a;
//   });

//   assertEquals(calls, 0);
//   assertEquals(a.value, "a");
//   assertEquals(calls, 1);

//   obj.a = "b";

//   assertEquals(calls, 1);
//   assertEquals(a.value, "b");
//   assertEquals(calls, 2);
// });

Deno.test("mutates the original object", () => {
  const original = { x: 1 };
  const state = reactiveProxy(original);

  state.x = 2;

  assertEquals(original.x, 2);
  assertEquals(state.x, 2);
});

Deno.test("preserves getters", () => {
  let count = 0;

  const original = {
    count: 0,
    get x() {
      this.count += 1;
      count += 1;
      return 42;
    },
  };

  const state = reactiveProxy(original);

  state.x;
  state.x;

  assertEquals(original.count, 2);
  assertEquals(count, 2);
  assertEquals(state.count, 2);
});

Deno.test("defines a property", () => {
  const original: { x?: number; y: number } = { y: 0 };
  const state = reactiveProxy(original);

  Object.defineProperty(state, "x", {
    configurable: true,
    writable: true,
    value: 1,
    enumerable: true,
  });

  Object.defineProperty(state, "y", {
    value: 1,
  });

  assertEquals(state.x, 1);
  assertEquals(Object.getOwnPropertyDescriptor(state, "x"), {
    configurable: true,
    writable: true,
    value: 1,
    enumerable: true,
  });

  assertExists(!("x" in original));
  assertEquals(Object.getOwnPropertyDescriptor(original, "y"), {
    configurable: true,
    writable: true,
    value: 1,
    enumerable: true,
  });
});

Deno.test("does not re-proxy proxies", () => {
  const inner = reactiveProxy({ count: 0 });
  const outer = reactiveProxy({ inner });

  assertEquals(inner.count, 0);
  assertEquals(outer.inner.count, 0);

  inner.count += 1;

  assertEquals(inner.count, 1);
  assertEquals(outer.inner.count, 1);
});

Deno.test("deletes a property", () => {
  const state: { a?: number; b?: number; c?: number } = reactiveProxy({
    a: 1,
    b: 2,
  });

  delete state.a;
  assertEquals(JSON.stringify(state), '{"b":2}');
  delete state.a;

  // deleting a non-existent property should succeed
  delete state.c;
});

// Deno.test("deep reactive objects", () => {
//   const obj = reactive({ deeply: { nested: { value: 1 } } });

//   let calls = 0;
//   const val = computed(() => {
//     calls++;
//     return obj.deeply.nested.value * 2;
//   });

//   assertEquals(calls, 0);
//   assertEquals(val.value, 2);
//   assertEquals(calls, 1);

//   obj.deeply.nested.value = 2;

//   assertEquals(calls, 1);
//   assertEquals(val.value, 4);
//   assertEquals(calls, 2);
// });
