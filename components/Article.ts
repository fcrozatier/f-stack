import { component } from "$client/component.ts";
import { html } from "$client/html.ts";
import { Counter } from "../pages/reactivity/counter/Counter.ts";

export const Article = component((props: { title: string }) => {
  return html`
    <h1>${props.title}</h1>
    <p>The description is here</p>
    ${Counter.bind({ initial: 100 })}
  `;
});
