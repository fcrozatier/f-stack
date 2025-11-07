import { html } from "@f-stack/reflow";
import { Counter } from "./Counter.ts";

export const Article = (props: { title: string }) => {
  return html`
    <h1>${props.title}</h1>
    <p>The description is here</p>
    ${Counter({ initial: 100 })}
  `;
};
