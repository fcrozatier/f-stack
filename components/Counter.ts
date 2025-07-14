import { createComponent } from "../client/component.ts";
import { html } from "../client/html.ts";
import { createSignal } from "../client/signals.ts";

type Props = { initial: number };

export const Counter = createComponent<Props>(({ initial = 0 }) => {
  const count = createSignal(initial);

  setInterval(() => {
    count.value += 1;
  }, 1000);

  return html`
    <div>The count is: ${count}</div>
  `;
});
