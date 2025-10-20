import { html } from "../packages/reflow/src/html.ts";
import { Counter } from "./pages/reactivity/1-state-and-derived/Counter.ts";

export const Benchmark = () => {
  const start = performance.now();

  for (let i = 0; i < 1000; i++) {
    Counter();
  }

  const end = performance.now();

  return html`
    Benchmark done in ${(end - start).toFixed(2)}ms
  `;
};
