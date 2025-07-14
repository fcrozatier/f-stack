import { createComponent } from "../client/component.ts";
import { html } from "../client/html.ts";

export const Hi = createComponent(() => {
  return html`
    <div>Hi</div>
  `;
});
