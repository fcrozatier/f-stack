import { Article } from "../components/Article.ts";
import { Counter } from "../components/Counter.ts";
import type { Render } from "../definitions.d.ts";

// Should be idempotent
const render: Render = (component, target) => {
  target.appendChild(component.call());
};

render(Article.bind({ title: "Hello!!" }), document.body);
// render(Counter({ initial: 11 }), document.body);
