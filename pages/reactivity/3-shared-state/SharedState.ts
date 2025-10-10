import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { derived, on } from "$client/sinks.ts";

const state = reactive({
  count: 0,
});

export const Counter = () => {
  return html`
    <button${on({ click: () => state.count++ })}>
      Click ${derived(() => state.count)}
    </button>
  `;
};

export const SharedState = () => {
  return html`
    ${Counter} ${Counter} ${Counter}
  `;
};
