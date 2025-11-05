import { reactive } from "@f-stack/functorial";
import { html, on } from "@f-stack/reflow";

export default () => {
  const count = reactive({ value: 0 });

  return html`
    <p>
      <button ${on({
        click: () => count.value++,
      })} data-testid="increment">increment</button>
      <button ${on({
        click: () => count.value--,
      })} data-testid="decrement">decrement</button>
      <button ${on({
        click: [() => count.value *= 10, { once: true }],
      })} data-testid="boost">boost</button>
    </p>

    <output data-testid="output">${count}</output>
  `;
};
