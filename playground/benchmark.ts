import { html } from "../packages/reflow/src/html.ts";
import { Counter } from "./pages/reactivity/1-state-and-derived/Counter.ts";

const COUNT = 1000;

export const Benchmark = () => {
  const start = performance.now();

  for (let i = 0; i < COUNT; i++) {
    Counter();
  }

  const end = performance.now();

  const duration = (end - start).toFixed(2);
  const avg = (+duration / COUNT).toFixed(2);

  return html`
    <p>
      Benchmark done in ${duration}ms
    </p>
    <p>
      Average render time ${avg}ms
    </p>
  `;
};
