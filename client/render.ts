import { Article } from "../components/Article.ts";
import type { Render } from "./definitions.d.ts";

// Should be idempotent
const render: Render = (fragment, target) => {
  target.appendChild(fragment);
};

render(Article({ title: "Hello!!" }), document.body);
