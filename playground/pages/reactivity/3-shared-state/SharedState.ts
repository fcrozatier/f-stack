import { derived, reactive } from "@f-stack/functorial";
import { html, on } from "@f-stack/reflow";

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
