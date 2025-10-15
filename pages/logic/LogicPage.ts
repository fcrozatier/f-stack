import { html } from "$client/html.ts";
import { derived, reactive } from "$client/reactivity/reactive.ts";
import { on, show } from "$client/sinks.ts";

export const LogicPage = () => {
  const count = reactive({ value: 0 });

  return html`
    <button ${on({ click: () => count.value++ })}>
      Clicked ${count} ${derived(() => count.value === 1 ? "time" : "times")}
    </button>
    ${show(
      () => count.value > 10,
      () => "Too big",
    )} ${show(() => count.value < 5, () => count.value)} ${show(
      () => count.value >= 5 && count.value <= 10,
      () =>
        html`
          <span>${count} is between 5 and 10</span>
        `,
    )}
  `;
};
