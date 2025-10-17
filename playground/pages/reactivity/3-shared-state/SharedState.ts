import { html } from "$reflow/html.ts";
import { on } from "$reflow/sinks.ts";
import { derived, reactive } from "$functorial/reactive.ts";

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
