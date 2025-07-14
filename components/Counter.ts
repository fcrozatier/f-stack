import { createComponent } from "../client/component.ts";
import { html } from "../client/html.ts";
import { createSignal } from "../client/signals.ts";

export const Counter = createComponent((initial: number = 0) => {
  const count = createSignal(initial);

  setInterval(() => {
    count.value += 1;
  }, 1000);

  return html`
    <div>The count is: ${count}</div>
  `;
});
