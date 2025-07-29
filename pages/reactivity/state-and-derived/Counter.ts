import { attach } from "$client/attachement.ts";
import { component } from "$client/component.ts";
import { html } from "$client/html.ts";
import { computed, state } from "../../../client/reactivity/signals.ts";

type Props = { initial: number };

export const Counter = component<Props>(({ initial = 0 }) => {
  const count = state(initial);
  const isEven = computed(() => (count.value & 1) === 0);

  return html`
    <button ${attach((b) => {
      b.addEventListener("click", () => count.value++);
    })}>Click</button>

    <div>The count is: ${count}</div>
    <div>Is even: ${isEven}</div>
  `;
});
