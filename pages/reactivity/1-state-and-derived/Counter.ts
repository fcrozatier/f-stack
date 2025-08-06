import { attach } from "$client/sinks.ts";

import { html } from "$client/html.ts";
import { computed, state } from "$client/reactivity/signals.ts";

type Props = { initial: number };

export const Counter = (props = { initial: 0 } satisfies Props) => {
  const count = state(props.initial);
  const isEven = computed(() => (count.value & 1) === 0);

  return html`
    <button ${attach((b) => {
      b.addEventListener("click", () => count.value++);
    })}>Click</button>

    <div>The count is: ${count}</div>
    <div>Is even: ${isEven}</div>
  `;
};
