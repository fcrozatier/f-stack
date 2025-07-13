import { type Component } from "../client/definitions.d.ts";
import { html } from "../client/html.ts";
import { Counter } from "./Counter.ts";

export const Article: Component<string> = (title?: string) => {
  return html`
    <h1>${title}</h1>
    <p>The description</p>
    ${Counter()}
  `;
};
