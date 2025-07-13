import { type Component } from "../client/definitions.d.ts";
import { html } from "../client/html.ts";
import { createSignal } from "../client/signals.ts";

export const Counter: Component<number> = (initial: number = 0) => {
  const state = createSignal(initial);

  setInterval(() => {
    state.value += 1;
  }, 1000);

  return html`
    <div>The count is: ${state}</div>
  `;
};
