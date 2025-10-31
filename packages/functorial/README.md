# Functorial

The reactivity primitive.

## Introduction

_The problem: we want a way to interact with web APIs in a faithful, reactive
and declarative manner._

Functorial reactivity achieves this by letting you not only map the data, but
also the behaviors.

For example, `delete` an object property to remove a listener, call `unshift()`
on a list to prepend data in the DOM.

We always mutate the DOM for performance, so the idea is to use mutable
structures and reflect their changes (transport their operations) to update the
DOM.

As a consequence, this approach yields

- The highest level of granularity
- A cristal-clear [mental model](#mental-model)
- A principled approach to manipulating web APIs declaratively

## Mental Model

Functorial reactivity creates a faithful communication between your templates
and the DOM.

Faithful means that we both:

- know the full story of what happens on the Template side
- can reach whole APIs dynamically on the DOM side

![Mental Model](<assets/mental_model.png>)

In practice, the `listen` callback gives us all the fine-grained details we need
about the data update to perform the corresponding surgical DOM updates.

### Videos

Here are a few videos explaining the concept and mental model behind functorial
reactivity, as well as a few examples:

- [Concept and granularity demo](https://bsky.app/profile/fred-crozatier.dev/post/3lyktxp75x22a)
- [Mental model and difference with Signals](https://bsky.app/profile/fred-crozatier.dev/post/3m3ctprjykc25)
- [Example of complex operations on a list](https://bsky.app/profile/fred-crozatier.dev/post/3m3cvi5ygec25)

## Usage

Functorial is a low-level, framework-independent reactivity system. You can use
it directly but will have to implement common web mappings (attributes,
listeners etc.) yourself.

These common functorial mappings are provided in [Reflow](../reflow/README.md)
which is the natural companion and recommended way to use Functorial.

### CDN

```html
<script type="importmap">
  {
    "imports": {
      "@f-stack/functorial": "https://esm.sh/jsr/@f-stack/functorial"
    }
  }
</script>

<button id="btn">Increment</button>

<script type="module">
  import { listen, reactive } from "@f-stack/functorial";

  const state = reactive({ value: 1 });

  listen(state, (e) => {
    console.log(e);
  });

  btn.onclick = () => {
    state.value++;
  };
</script>
```

### Installation

```sh
deno add jsr:@f-stack/functorial
pnpm i jsr:@f-stack/functorial
npx jsr add @f-stack/functorial
```

## Examples

Here are a few raw examples showcasing some of the basic Functorial features.
You can also have a look at the [Playground](../../playground/README.md) for
real life examples and usage with Reflow.

### Reactive objects

Create a reactive state with `reactive`. Listen to its updates with `listen`.

> [TIP!] You can create a reactive array, Map or Set by directly wrapping them
> like `reactive([])` or `reactive(new Map())`. With functorial reactivity we
> can reflect operations directly, with the `listen` callback being the source
> of truth for the DOM synchronisation logic. So we don't need to reimplement
> every data structure with a reactive variant

```ts
import { listen, reactive } from "@f-stack/functorial";

// Creates a Proxy around any data structure (object, array, Map etc)
const state = reactive({ count: 0 });

listen(state, (e) => {
  // types are "create", "update", "delete", "apply" and "relabel" (experimental)
  if (e.type === "update" && e.path === ".count") {
    console.log(`old: ${e.oldValue}, new: ${e.newValue}`);
  }
});

state.count = 1;
// old: 0, new: 1
```

### Derived values

Use getters to cache derived values, or create them directly with `derived`.
These derived values are cached for performance.

```ts
import { derived, listen, reactive } from "@f-stack/functorial";

const state = reactive({
  count: 1,
  get isEven() {
    return this.count % 2 === 0;
  },
});

// `derived` is just a shorthand to create a reactive with a .value getter
const double = derived(() => state.count * 2);

console.log(double.value); // 2

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

### Listen to operations

You can think of `listen` as a way to hook into the Proxy and get the full
picture of what's going on.

```ts
import { listen, reactive } from "@f-stack/functorial";

const array = reactive([1, 2, 3]);

listen(array, (e) => {
  // e tells you everything about what happened to `array`
  console.log(e);
});

array.push(4);

// {
//   type: "apply",
//   path: ".push",
//   args: [4]
// }
```

### Writable derived values

Some derived values are also writable, like the `Array.length` property. Add a
setter next to a getter to create a writable derived.

```js
import { listen, reactive } from "@f-stack/functorial";

const price = reactive({
  _value: 10,
  _override: null,
  get total() {
    return this._override || this._value * 1.2;
  },
  set total(v) {
    this._override = v;
  },
});
```

## [Playground](../../playground/README.md)

## [API](https://jsr.io/@f-stack/functorial/doc)

Interactive API on JSR
