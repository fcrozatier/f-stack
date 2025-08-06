import { attach } from "$client/sinks.ts";

import { html } from "$client/html.ts";
import { state } from "$client/reactivity/signals.ts";

const count = state(0);

export const Counter = () => {
  return html`
    <button ${attach((b) => {
      b.addEventListener("click", () => count.value++);
    })}>Click ${count}</button>
  `;
};

export const SharedState = () => {
  return html`
    ${Counter} ${Counter} ${Counter}
  `;
};
