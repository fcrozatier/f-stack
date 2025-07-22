import { component } from "../client/component.ts";
import { html } from "../client/html.ts";
import { computed, state } from "../client/signals.ts";

type Props = { initial: number };

export const Counter = component<Props>(({ initial = 0 }) => {
  const count = state(initial);
  const isEven = computed(() => (count.value & 1) === 0);

  setInterval(() => {
    count.value += 1;
  }, 1000);

  return html`
    <div>The count is: ${count}</div>
    <div>even: ${isEven}</div>
    <div>${() =>
      isEven.value
        ? html`
          Oh it's <em>even</em>
        `
        : html`
          How <strong>odd</strong>
        `}</div>
  `;
});
