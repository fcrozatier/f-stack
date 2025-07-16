import { createComponent } from "../client/component.ts";
import { html } from "../client/html.ts";
import { Counter } from "./Counter.ts";

export const Article = createComponent((props: { title: string }) => {
  return html`
    <h1>${props.title}</h1>
    <p>The description is here</p>
    ${Counter.bindFully({ initial: 100 })}
  `;
});
