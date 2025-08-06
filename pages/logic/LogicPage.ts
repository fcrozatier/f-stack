import { html } from "$client/html.ts";
import { computed, state } from "$client/reactivity/signals.ts";
import { attach } from "$client/sinks.ts";

export const LogicPage = () => {
  const count = state(0);

  return html`
    <button ${attach((b) => {
      b.addEventListener("click", () => {
        count.value++;
      });
    })}>Clicked ${count} ${count.value === 1 ? "time" : "times"}</button>

    ${computed(() =>
      count.value > 10 ? "Too big" : count.value < 5 ? count.value : html`
        <span>${count} is between 5 and 10</span>
      `
    )}
  `;
};
