import { type Component, html } from "../script.ts";
import { createSignal } from "../signals.js";

export const Counter: Component<number> = (initial: number = 0) => {
  const state = createSignal(initial);

  setInterval(() => {
    state.value += 1;
  }, 1000);

  return html`
    <div>The count is: ${state}</div>
  `;
};
