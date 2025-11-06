import { derived, reactive } from "@f-stack/functorial";
import { html, on } from "@f-stack/reflow";

export default () => {
  const count = reactive({ value: 0 });

  return html`
    <button ${on({ click: () => count.value++ })}>increment</button>
    <p data-testid="count">${count}</p>
    <p data-testid="even">${derived(() => count.value % 2 === 0)}</p>
  `;
};
