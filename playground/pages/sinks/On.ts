import { listen, reactive, snapshot } from "@f-stack/functorial";
import { html, type On, on, text } from "@f-stack/reflow";

export const OnPage = () => {
  const increment = () => {
    state.count += 1;
  };
  const decrement = () => {
    state.count -= 1;
  };
  const sayHi = () => {
    console.log("hi");
  };
  const sayBye = () => {
    console.log("bye");
  };

  const state = reactive({ count: 0, input: "" });
  const listeners: On<HTMLButtonElement> = reactive({ "click": increment });

  listen(state, () => {
    console.log(state.count);
  });

  return html`
    <p>
      <button ${on(listeners)}>click</button>
    </p>
    <p>
      <button ${on({
        "click": () => listeners.mouseover = sayHi,
      })}>Say hi on hover</button>
      <button ${on({
        "click": () => delete listeners.mouseover,
      })}>Remove sayHi</button>
      <button ${on({
        "click": () => listeners.pointerdown = [sayBye, { capture: true }],
      })}>Add capture listener</button>
      <button ${on({
        "click": () => delete listeners?.pointerdown,
      })}>Remove capture listener</button>
      <button ${on({
        "click": () => {
          listeners.click = snapshot(listeners.click) === increment
            ? decrement
            : increment;
        },
      })}>Switch Mode (increment/decrement)</button>
    </p>

    <p>
      <input ${on<HTMLInputElement>({
        input: function () {
          state.input = this.value;
        },
      })}>
    </p>
    <output>${text(state, "input")}</output>
  `;
};
