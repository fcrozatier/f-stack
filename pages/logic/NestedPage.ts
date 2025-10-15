import { html } from "$client/html.ts";
import { derived, reactive } from "$client/reactivity/reactive.ts";
import { on, show } from "$client/sinks.ts";

export const NestedPage = () => {
  const count = reactive({ value: 0 });

  return html`
    <button ${on({ click: () => count.value++ })}>
      Clicked ${count} ${derived(() => count.value === 1 ? "time" : "times")}
    </button>
    ${show(
      () => count.value % 2 === 0,
      () => count.value % 3 === 0 ? "Multiple of 6" : "Even number",
      () => "Odd number",
    )}
  `;
};
