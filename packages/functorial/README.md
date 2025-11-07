# Functorial

_The reactivity primitive_

## Introduction

Functorial reactivity is an idiomatic way to interact with web APIs in a
faithful, reactive and declarative manner. It's different from Signals as you
not only map the data, but also the behaviors, in a structured way.

For example, `delete` an object property to remove a listener or call
`unshift()` on a list to prepend data in a DOM container.

As a consequence, this approach yields

- The highest level of granularity: faithfulness
- A cristal-clear [mental model](#mental-model)
- A principled approach to interacting with web APIs declaratively
- A more natural reactivity primitive

## Mental Model

### Mutation-first

The DOM is a mutable structure, and for performance we update the DOM by
mutating it. Functorial reactivity reflects this in our templates with its focus
on mutable structures. State is held inside mutable structures (_eg._ `Object`,
`Array`) and their changes and operations are transported to corresponding DOM
updates.

For example add a key-value pair to an object to add an attribute to a DOM
`Element`, delete it to remove the attribue.

### Mapping Templates to DOM...

Templates are where we declare the relation between a piece of state and the
DOM.

With Functorial reactivity this relation is a faithful communication between our
templates and the DOM:

1. We create a piece of state and map it to the DOM (up arrow)
2. We mutate the state or perform an operation on it (left arrow)
3. Our state listener is triggered with an event letting us know what happened,
   so we can perform the right DOM update dynamically without diffing (right
   arrow)
4. The DOM is in the same state as if we had directly applied this updated
   state: the whole diagram commutes (down arrow)

![Mental Model](<assets/mental_model.png>)

### ... faithfully

The relation between our templates and the DOM being faithful means that we
both:

- **know the full story of what happens on the Template side**
- **can reach whole APIs dynamically on the DOM side**

Since it's `Proxy`-based, the granularity on the left side is only constrained
by the resolution provided by the `Proxy` traps: we can know wether a key was
created, updated, deleted, or whether a method was called and with which
arguments. This tells us the full story as an event, which can be accessed as
the callback parameter of the `listen` function.

> [!NOTE]
> In particular this granularity means we don't need diffing: the `Proxy`
> already knows what happens, so it would be a pure waste to discard this
> information to then reconstruct it afterwards with diffing. Instead this data
> is provided as a `ReactiveEvent` in the `listen` callback parameter.

### Expressive, Structured approach

Functorial reactivity focuses on mutable **structures**: the `listen` function
takes a structure to listen to as its first parameter.

This, combined with the granularity of the `ReactiveEvent` which tells us how
the structure changes, let us create expressive mappings of semantics.

For example, since all common web APIs all revolve around create and delete
operations,

- `setAttribute` and `removeAttribute`
- `addEventListener` and `removeEventListener`
- `.classList.add` and `.classList.remove`
- `.style.setProperty` and `.style.removeProperty`

the `delete` operation on a state object can be mapped to the expected
corresponding operation in the DOM.

### Videos

Here are a few videos explaining the functorial reactivity mental model, with a
few examples:

- [Concept and granularity demo](https://bsky.app/profile/fred-crozatier.dev/post/3lyktxp75x22a)
- [Mental model and difference with Signals](https://bsky.app/profile/fred-crozatier.dev/post/3m3ctprjykc25)
- [Example of complex operations on a list](https://bsky.app/profile/fred-crozatier.dev/post/3m3cvi5ygec25)

## Usage

Functorial is a low-level, framework-independent reactivity system. You can use
it directly but will have to implement common web mappings (attributes,
listeners etc.) yourself.

These common mappings are provided in [Reflow](../reflow/README.md) which is the
recommended way to use Functorial.

### CDN

The library can be loaded directly from `esm.sh`

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

Depending on your package manager:

```sh
deno add jsr:@f-stack/functorial
pnpm i jsr:@f-stack/functorial
npx jsr add @f-stack/functorial
```

## Examples

Here are a few examples showcasing some basic features. You can also have a look
at the [Playground](../../playground/README.md) for real life examples and usage
with Reflow.

### Reactive objects

Create a reactive state with `reactive`. Listen to its updates with `listen`.

> [!TIP]
> You can create a reactive array, `Map` or `Set` by directly wrapping them like
> `reactive([])` or `reactive(new Map())`. The `listen` callback being the
> source of truth for the DOM synchronisation logic, we don't have to
> reimplement every data structure as a reactive variant. This is a key
> difference with Signals.

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

### Listen to changes and operations

You can think of `listen` as a way to hook into the Proxy and get the full
picture of what's going on.

```ts
import { listen, reactive } from "@f-stack/functorial";

const array = reactive([1, 2, 3]);

listen(array, (e) => {
  // e tells us everything that happens to `array`
  console.log(e);
});

array.push(4);

// {
//   type: "apply",
//   path: ".push",
//   args: [4]
// }
```

### Writable-derived values

Some derived values are also writable, like the `Array.length` property. Add a
setter next to a getter to create a writable derived.

```ts
import { listen, reactive } from "@f-stack/functorial";

const price = reactive({
  _value: 10,
  _override: 0,
  get total() {
    return this._override || this._value * 1.2;
  },
  set total(v) {
    this._override = v;
  },
});
```

## [Playground](../../playground/README.md)

## API

Interactive API available on [JSR](https://jsr.io/@f-stack/functorial/doc)
