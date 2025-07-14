import { createComponent } from "../client/component.ts";
import { html } from "../client/html.ts";
import { Counter } from "./Counter.ts";

export const Article = createComponent((title?: string) => {
  return html`
    <h1>${title}</h1>
    <p>The description</p>
    ${Counter.partial(10)}
  `;
});
