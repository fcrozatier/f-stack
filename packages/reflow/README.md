# Reflow

`html` template tag based on [Functorial](../functorial/README.md).

## Overview

```ts
import { attr, html, map, on, svg } from "@f-stack/reflow";
import { derived, reactive } from "@f-stack/reflow/reactivity";

type Circle = {
  radius: number;
  color: string;
};

const randint = () => {
  return Math.random() * 200;
};

const Demo = () => {
  const newCircle: Circle = { radius: 10, color: "#00ffff" };
  const circles: Circle[] = reactive([
    { radius: 100, color: "#ff00ff" },
    { radius: 20, color: "#ffff00" },
  ]);

  return html`
    <div>
      <label for="radius">radius</label>
      <input
        id="radius"
        type="number"
        min="0"
        max="100"
        step="10"
        value="10"
        ${on<HTMLInputElement>({
          input: function () {
            newCircle.radius = this.valueAsNumber;
          },
        })}
      >
      <label for="color">color</label>
      <input id="color" type="color" value="#00ffff" ${on({
        input: function () {
          newCircle.color = this.value;
        },
      })}>
      <button ${on({
        click: () => circles.push(newCircle),
      })}>Add circle</button>
    </div>

    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${map(circles, (circle) => {
        return svg`
          <circle ${attr({
            cx: randint(),
            cy: randint(),
            r: circle.radius,
            fill: circle.color,
          })} />
        `;
      })}
    </svg>

    <math xmlns="http://www.w3.org/1998/Math/MathML">
      <mrow>
        <mtext>Total area = </mtext>
        <munderover>
          <mo>∑</mo>
          <mrow>
            <mi>i</mi><mo>=</mo><mn>0</mn>
          </mrow>
          <mn>${derived(() => circles.length)}</mn>
        </munderover>
        <mrow>
          <mi>π</mi>
          <msup>
            <msub><mi>r</mi><mi>i</mi></msub>
            <mn>2</mn>
          </msup>
          <mo>=</mo>
          <mn>${derived(() =>
            Math.round(
              circles.reduce(
                (acc, curr) => acc + Math.PI * curr.radius ** 2,
                0,
              ),
            )
          )}</mn>
        </mrow>
      </mrow>
    </math>

    <style>
    body {
      display: grid;
      place-items: center;
      gap: 2rem;
      margin: 2rem;
    }
    div {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    </style>
  `;
};

// Directly append to your document body:
// document.body.append(Demo());
```

## Features

- Structured and super granular approach thanks to functorial reactivity
- Corollary: Optimal node reuse
- Supports all common web mappings (attributes, listeners etc)
- Supports all namespaces with `html`, `svg` and `math` template tags
- No special syntax like `.prop`, `@on`
- Corollary: Faster parsing in one pass
- Template caching
- Strong type safety with no extension required
- Supports type parameters for even stronger type safety

## Mental model

The Reflow template tags let us insert reactive data in our templates inside
holes (sinks) to declaratively and reactively manipulate web APIs (`Attr`,
`EventListener`, `DOMTokenList` etc). This is done in a very structured way.

There are two sorts of sinks:

1. Element-level sinks

- [`attr`](#attr)
- [`classList`](#classlist)
- [`on`](#on)
- [`prop`](#prop)
- [`style`](#style)

2. Fragment-level sinks

- [`derived`](#derived)
- [`map`](#map)
- [`show`](#show)
- [`text`](#text)
- [`unsafeHTML`](#unsafehtml)

See below for a walkthrough of the various available sinks.

The template tag returns a live `DocumentFragment` that can be directly inserted
in the DOM.

## Install

Depending on your package manager:

```sh
deno add jsr:@f-stack/reflow
pnpm i jsr:@f-stack/reflow
npx jsr add @f-stack/reflow
```

## Sinks

### `on`

Handles event listeners on an `Element`. Creates a functorial mapping with the
element `addEventListener` and `removeEventListener` methods

> [!TIP]
> You can access a strongly typed `this` value by using a type parameter with a
> function declaration like below

> [!TIP]
> You can pass `addEventListener` options like `once`, `capture` or `signal` by
> using a tuple as in the `sayHi` example below

```ts
import { html, type On, on } from "@f-stack/reflow";
import { reactive } from "@f-stack/reflow/reactivity";

export const OnDemo = () => {
  const sayHi = () => console.log("hi");
  const listeners: On<HTMLButtonElement> = reactive({});

  return html`
    <div>
      <button ${on({
        click: () => listeners.click = [sayHi, { once: true }],
      })}>Add sayHi</button>
      <button ${on({
        click: () => delete listeners.click,
      })}>Remove sayHi</button>
      <button ${on(listeners)}>Click</button>
    </div>

    <label>
      this value
      <input type="number" ${on<HTMLInputElement>({
        input: function () {
          console.log(this.valueAsNumber);
        },
      })}>
    </label>
  `;
};
```

### `attr`

Handles attributes on an `Element`. Creates a functorial mapping with the
element `setAttribute` and `removeAttribute` methods.

> [TIP!] You can pass `attr` and `AttrSink` a tag name as a type parameter for
> stronger type safety. All HTML, SVG and MathML tags are supported

```ts
import { attr, type AttrSink, html, on } from "@f-stack/reflow";
import { reactive } from "@f-stack/reflow/reactivity";

export const AttrDemo = () => {
  const attributes: AttrSink = reactive({});

  return html`
    <div>
      <button ${on({ click: () => attributes.id = "red" })}>Add id</button>
      <button ${on({ click: () => attributes.id = "green" })}>Update id</button>
      <button ${on({ click: () => delete attributes.id })}>Remove id</button>
    </div>
    <span ${attr(attributes)}></span>

    <style>
    #red { background: red; }
    #green { background: green; }
    span { display: inline-block; min-width: 10em; aspect-ratio: 1; margin-top: 1em; }
    </style>
  `;
};
```

### `prop`

Handles an `Element` properties.

> [!TIP]
> You can use a type parameter for element-specific props type safety

```ts
import { html, prop } from "@f-stack/reflow";

export const PropPage = () => {
  return html`
    <form>
      <input type="checkbox" ${prop<HTMLInputElement>({
        indeterminate: true,
      })}>
      <input type="text" ${prop<HTMLInputElement>({ defaultValue: "Bob" })}>
      <p>
        <button type="reset">Reset</button>
      </p>
    </form>
  `;
};
```

### `attach`

Runs a callback hook on the `Element` it is attached to.

```ts
import { reactive } from "@f-stack/reflow/reactivity";
import { attach, html, on } from "@f-stack/reflow";

export const AttachDemo = () => {
  const form = reactive({ value: "Bob" });

  return html`
    <form>
      <label>username:
        <input type="text" ${attach((i: HTMLInputElement) => {
          i.defaultValue = form.value;
        })} ${on<HTMLInputElement>({
          input: function () {
            form.value = this.value;
          },
        })}>
      </label>
      <button type="reset">Reset</button>
    </form>
  `;
};
```

### `classList`

Handles conditional classes on an `Element`. This creates a functorial mapping
with the element `classList.add` and `classList.remove` methods.

> [!TIP]
> You can use getters in any reactive object to derive values like in this
> example

```ts
import { attr, classList, html, on } from "@f-stack/reflow";
import { reactive } from "@f-stack/reflow/reactivity";

export const ClassListDemo = () => {
  const state = reactive({ notAllowed: true });

  return html`
    <button ${on({
      click: () => state.notAllowed = !state.notAllowed,
    })}>Toggle state</button>

    <button ${attr({
      get disabled() {
        return state.notAllowed;
      },
    })} ${classList({
      get "not-allowed opacity-50"() {
        return state.notAllowed;
      },
    })}>Click</button>

    <style>
    .opacity-50 { opacity: 0.5; }
    .not-allowed { cursor: not-allowed; }
    </style>
  `;
};
```

### `text`

Handles the creation and update of `Text` nodes.

> [!TIP]
> For convenience, you can also use a `Primitive` or `ReactiveLeaf` directly to
> create `Text` nodes.

```ts
import { html, on, text } from "@f-stack/reflow";
import { reactive } from "@f-stack/reflow/reactivity";

export const TextDemo = () => {
  const primitive =
    "strings, numbers or booleans (nullish values are omitted in a text sink)";
  const leaf = reactive({
    value: "A reactive leaf is a reactive with a primitive `value` key",
  });
  const state = reactive({ disabled: true });

  return html`
    <p>${primitive}</p>
    <p>${leaf}</p>
    <p>The state is disabled: ${text(state, "disabled")}</p>
    <button ${on({
      click: () => state.disabled = !state.disabled,
    })}>Toggle state</button>
  `;
};
```

### `derived`

A `derived` sink can return `html` expressions, primitives or reactive leaves.
It's a more powerful sink than `text` but it creates an additional `Proxy`
wrapper.

> [!TIP]
> Use a `derived` sink when you need an expression or have a dynamic key,
> otherwise use a `text` sink for simple reads of a reactive object.

```ts
import { html, on, text } from "@f-stack/reflow";
import { derived, reactive } from "@f-stack/reflow/reactivity";

export const DerivedDemo = () => {
  const state = reactive({ count: 0 });

  return html`
    <button ${on({ click: () => state.count++ })}>
      ${text(state, "count")} ${derived(() =>
        state.count === 1
          ? html`
            <em>Click</em>
          `
          : "Clicks"
      )}
    </button>
  `;
};
```

### `show`

Handles conditional templates. It takes 3 callbacks: the first returns the
conditional value, the second is the template, primitive or reactive leaf to use
in the `true` case and the third is the template, primitive or reactive leaf to
use in the `false` case.

> [!TIP]
> For simple ternary conditions, you can use a `derived` sink like below. But
> the `derived` callback reruns every time its dependencies change, which can be
> wasteful (even though the result is cached) as the function body is still
> executed. The `show` sink addresses this by decoupling the evaluation of the
> conditional expression from the templates expressions. **In short**, use
> `derived` for simple conditionals and `show` for better node reuse with more
> complex templates.

```ts
import { html } from "@f-stack/reflow";
import { on, show } from "@f-stack/reflow";
import { derived, reactive } from "@f-stack/functorial";

export const ShowDemo = () => {
  const count = reactive({ value: 0 });

  return html`
    <button ${on({ click: () => count.value++ })}>
      Clicked ${count} ${derived(() => count.value === 1 ? "time" : "times")}
    </button>

    <p>
      ${show(
        () => count.value < 5,
        () => count.value,
        () =>
          html`
            <span>
              ${show(
                () => count.value > 10,
                () =>
                  html`
                    <strong>Too big</strong>
                  `,
                () =>
                  html`
                    ${count} is between 5 and 10
                  `,
              )}
            </span>
          `,
      )}
    </p>
  `;
};
```

### `map`

Handles iterations over a reactive array. This sink creates a funtorial mapping
that allows mutating the array directly with `push`, `unshift`, `splice`, `sort`
or any other `Array` method to respectively have the effect and granularity of
`append`, `prepend`, `insertBefore`, `moveBefore` etc.

> [!TIP]
> The `map` functor updates its data in a `ViewTransition` so you can easily add
> some flair to your list updates with a few lines of CSS like below, no
> animation library required.

```ts
import { html, map, on, text } from "@f-stack/reflow";
import { reactive } from "@f-stack/reflow/reactivity";

const randint = () => {
  return Math.round(Math.random() * 100);
};

export const MapDemo = () => {
  const numbers = reactive([randint(), randint(), randint()]);

  return html`
    <h2>Insert</h2>
    <p>
      <button ${on({
        click: () => numbers.push(randint()),
      })}>push</button>
      <button ${on({
        click: () => numbers.unshift(randint()),
      })}>unshift</button>
      <button ${on({
        click: () => numbers.splice(1, 0, randint()),
      })}>
        splice(1, 0, rand())
      </button>
    </p>
    <h2>Remove</h2>
    <p>
      <button ${on({ click: () => numbers.pop() })}>pop</button>
      <button ${on({ click: () => numbers.shift() })}>shift</button>
    </p>
    <h2>Update</h2>
    <p>
      <button ${on({
        click: () => numbers[0]! += 1,
      })}>increment index 0</button>
      <button ${on({ click: () => numbers.sort() })}>sort</button>
      <button ${on({ click: () => numbers.reverse() })}>reverse</button>
    </p>
    <ul>${map(numbers, (item, index) => {
      return html`
        <li>index ${index}: ${item}</li>
      `;
    })}</ul>

    <style>
    :root {
      view-transition-name: none;
    }
    ::view-transition-group(*) {
      animation-duration: 200ms;
    }
    ::view-transition-new(.li):only-child {
      animation: in 250ms ease both;
    }
    ::view-transition-old(.li):only-child {
      animation: out 200ms ease-out both;
    }
    @keyframes in {
      from {
        width: 100%;
        height: 0;
      }
      to {
        height: 100%;
      }
    }
    @keyframes out {
      to {
        opacity: 0;
        scale: 0.8;
        transform: translateX(100px);
      }
    }
    li {
      view-transition-name: match-element;
      view-transition-class: li;
    }
    </style>
  `;
};
```

### `style`

Handles inline styles on an `Element`. Creates a functorial mapping with the
element `style.setProperty` and `style.removeProperty` methods.

> [!TIP]
> You can also manipulate reactive --dashed ident properties this way like below

```ts
import { attr, html, on, style, type StyleSink } from "@f-stack/reflow";
import { reactive } from "@f-stack/reflow/reactivity";

export const StyleDemo = () => {
  const styles: StyleSink = reactive({
    "--bg": "#ffff00",
    color: "red",
    background: "var(--bg, blue)",
  });

  return html`
    <div>
      <button ${on({
        click: () => styles.outline = "1px solid red",
      })}>Add outline</button>
      <button ${on({
        click: () => delete styles.outline,
      })}>Remove outline</button>

      <label>
        Update background
        <input type="color" ${attr({
          get value() {
            return styles["--bg"];
          },
        })} ${on<HTMLInputElement>({
          input: function () {
            styles["--bg"] = this.value;
          },
        })}>
      </label>
    </div>
    <span ${style(styles)}></span>

    <style>
    span { display: inline-block; min-width: 10em; aspect-ratio: 1; margin-top: 1em; }
    </style>
  `;
};
```

### `unsafeHTML`

Handles raw HTML.

> [!WARNING] Only use this sink with trusted inputs

```ts
import { html, on, unsafeHTML } from "@f-stack/reflow";
import { reactive } from "@f-stack/reflow/reactivity";

export const UnsafeHTMLDemo = () => {
  const unsafeInput = reactive({ value: "" });

  return html`
    <div>
      <label for="html">Update HTML</label>
      <textarea
        id="html"
        name="unsafe"
        placeholder="<em>HTML</em>"
        ${on<HTMLTextAreaElement>({
          input: function () {
            unsafeInput.value = this.value;
          },
        })}
      ></textarea>
    </div>
    <output>${unsafeHTML(unsafeInput)}</output>
    <style>
    label { display: block; }
    </style>
  `;
};
```

## [API](https://jsr.io/@f-stack/reflow/doc)

Interactive API on JSR.
