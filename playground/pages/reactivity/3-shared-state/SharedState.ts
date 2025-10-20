import { html } from "@f-stack/reflow";
import { on } from "@f-stack/reflow";
import { derived, reactive } from "@f-stack/functorial";

const state = reactive({
  count: 0,
});

export const Counter = () => {
  return html`
    <button ${on({ click: () => state.count++ })}>
      Click ${derived(() => state.count)}
    </button>
  `;
};

export const SharedState = () => {
  return html`
    ${Counter()} ${Counter()} ${Counter()}
  `;
};
