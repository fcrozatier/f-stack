import { html, on } from "@f-stack/reflow";
import { reactive } from "@f-stack/reflow/reactivity";

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
      })} data-testid="boost">boos</button>
    </p>

    <output data-testid="output">${count}</output>
  `;
};
