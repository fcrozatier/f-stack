import { html } from "$client/html.ts";
import { Button } from "$components/Button.ts";
import type { Page } from "../../../definitions.d.ts";

export const DefaultPropsPage: Page = () => {
  return html`
    <p>Pass a prop</p>
    <div>${Button({ initial: 10 })}</div>

    <p>Use the defaults</p>
    <div>${Button()}</div>
  `;
};
