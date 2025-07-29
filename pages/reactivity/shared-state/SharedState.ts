import { component } from "$client/component.ts";
import { html } from "$client/html.ts";
import { state } from "$client/signals.ts";
import { attach } from "$client/attachement.ts";

const count = state(0);

export const Counter = component(() => {
  return html`
    <button ${attach((b) => {
      b.addEventListener("click", () => count.value++);
    })}>Click ${count}</button>
  `;
});

export const SharedState = component(() => {
  return html`
    ${Counter} ${Counter} ${Counter}
  `;
});
