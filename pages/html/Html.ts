import { component } from "../../client/component.ts";
import { html } from "../../client/html.ts";

export const Html = component(() => {
  let username;
  return html`
    <p>username: ${username}</p>
  `;
});
