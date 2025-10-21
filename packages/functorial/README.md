# Functorial Reactivity

_We've found the true reactivity primitive_

## Introduction

What we want is a way to interact with web APIs in a faithful manner when we update our data.

To achieve this faithful communication between your templates and the DOM, functorial reactivity lets you not only map the data, but also the behavior to a corresponding interpretation in the DOM.

For example `delete` an object property to remove a listener, call `unshift()` on a list to prepend data in the DOM etc. The idea is to use mutable structures and reflect their changes (transport their operations) to the DOM.

As a consequence this yields the highest level of granularity as well as a cristal-clear mental model and a principled approach to manipulating web APIs declaratively.

### Videos

Here are a few videos explaining the concept and mental model behind functorial reactivity, as well as a few examples:

- [Concept and granularity demo](https://bsky.app/profile/fred-crozatier.dev/post/3lyktxp75x22a)
- [Mental model and difference with Signals](https://bsky.app/profile/fred-crozatier.dev/post/3m3ctprjykc25)
- [Example of complex operations on a list](https://bsky.app/profile/fred-crozatier.dev/post/3m3cvi5ygec25)

## Usage

Functorial is a low-level, framework-independent reactivity system. You can use it directly but will have to implement common web mappings (attributes, listeners etc.) yourself.

These common functorial mappings are provided in [Reflow]() which is the natural companion and recommended way to use Functorial.

```sh
deno add jsr:@f-stack/functorial
```

## Examples

Here are a few raw examples showcasing some of the basic Functorial features. You can also have a look at the [Playground](../../playground/) for real life examples.

### Reactive objects

Create a reactive state with `reactive`. Listen to its updates with `listen`.

```ts
import { reactive, listen } from "@f-stack/functorial";

// Creates a Proxy around any data structure (object, array, Map etc)
const state = reactive({
  count: 0,
});

listen(state, (e) => {
  // types are "create", "update", "delete", "apply" and "relabel" (experimental)
  if(e.type === "update" && e.path === ".count") {
    console.log(`old: ${e.oldValue}, new: ${e.newValue}`);
  }
});

state.count = 1;
// old: 0, new: 1
```

### Derived values

Use getters to cache derived values, or create them directly with `derived`

```ts
import { reactive, listen, derived } from "@f-stack/functorial";

const state = reactive({
  count: 1,
  get isEven() {
    return this.count % 2 === 0;
  }
});

// `derived` is just a shorthand to create a reactive with a .value getter
const double = derived(() => state.count * 2);

double.value
// 2

listen(state, (e) => {
  console.log(e);
});

state.count = 4;
// {
//   type: "update",
//   path: ".count",
//   newValue: 4,
//   oldValue: 1,
// }
// {
//   type: "update",
//   path: ".isEven",
//   newValue: true,
//   oldValue: false,
// }
```

### Listen to method calls

You can think of `listen` as a way to hook into the Proxy and get the full picture of what's going on.

```ts
import { reactive, listen } from "@f-stack/functorial";

const array = reactive([1, 2, 3]);

listen(array, (e) => {
  console.log(e);
});

array.push(4);

// {
//   type: "apply",
//   path: ".push",
//   args: [4]
// }
```

## Mental Model

![Mental Model](<assets/mental model.png>)

The `listen` callback gives us the fine-grained details we need about the data update to perform the corresponding surgical DOM updates. This way we can for example map `push` to `append` and the mental model is that we transport operations from Templates to their natural corresponding interpretation in the DOM.

## [Playground](../../playground/)

## API