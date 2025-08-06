import { html } from "$client/html.ts";
import { Counter } from "../pages/reactivity/1-state-and-derived/Counter.ts";

export const Article = (props: { title: string }) => {
  return html`
    <h1>${props.title}</h1>
    <p>The description is here</p>
    ${Counter.bind({ initial: 100 })}
  `;
};
