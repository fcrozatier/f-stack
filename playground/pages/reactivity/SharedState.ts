import { reactive } from "@f-stack/functorial";
import { html, on } from "@f-stack/reflow";

const count = reactive({
  value: 0,
});

export const Counter = () => {
  return html`
    <button ${on({ click: () => count.value++ })}>
      Click ${count}
    </button>
  `;
};

export const SharedState = () => {
  return html`
    ${Counter()} ${Counter()} ${Counter()}
  `;
};
