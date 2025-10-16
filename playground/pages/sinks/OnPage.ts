import { html } from "$clarity/html.ts";
import { type On, on, text } from "$clarity/sinks.ts";
import { addListener, equals, reactive } from "$functorial/reactive.ts";

export const OnPage = () => {
  const increment = () => {
    state.count += 1;
  };
  const decrement = () => {
    state.count -= 1;
  };
  const log = () => {
    console.log("hi");
  };
  const boom = () => {
    console.log("boom");
  };

  const state = reactive({ count: 1, input: "" });
  const listeners: On<HTMLButtonElement> = reactive({ "click": increment });

  addListener(state, () => {
    console.log(state.count);
  });

  return html`
    <p>
      <button ${on(listeners)}>click</button>
    </p>
    <p>
      <button ${on({
        "click": () => listeners.mouseover = log,
      })}>Add log on hover listener</button>
      <button ${on({
        "click": () => delete listeners?.mouseover,
      })}>Remove log on hover</button>
      <button ${on({
        "click": () => listeners.pointerdown = [boom, { capture: true }],
      })}>Add capture listener</button>
      <button ${on({
        "click": () => delete listeners?.pointerdown,
      })}>Remove capture listener</button>
      <button ${on({
        "click": () => {
          listeners.click = equals(listeners.click, increment)
            ? decrement
            : increment;
        },
      })}>Switch Mode (increment/decrement)</button>
    </p>

    <p>
      <input ${on<HTMLInputElement>({
        "input": function () {
          state.input = this.value;
        },
      })}>
    </p>
    <div>${text(state, "input")}</div>
  `;
};
