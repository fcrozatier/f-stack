import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { derived, on } from "$client/sinks.ts";

export const LogicPage = () => {
  const count = reactive({ value: 0 });

  return html`
    <button ${on({ click: () => count.value++ })}>
      Clicked ${count} ${derived(() => count.value === 1 ? "time" : "times")}
    </button>

    <!-- Can we have smart "partial recomputation" to avoid recreating the whole span
      on every update? -->
    ${derived(() => {
      if (count.value > 10) {
        return "Too big";
      } else if (count.value < 5) {
        return count.value;
      } else {
        return html`
          <span>${count} is between 5 and 10</span>
        `;
      }
    })}
  `;
};
