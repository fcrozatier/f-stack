import { Counter } from "../components/Counter.ts";
import type { Render } from "./definitions.d.ts";

// Should be idempotent
const render: Render = (component, target) => {
  target.appendChild(component());
};

render(Counter, document.body);
