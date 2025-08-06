import { html } from "$client/html.ts";
import { Button, type ButtonProps } from "$components/Button.ts";
import type { Page } from "../../definitions.d.ts";

export const PropsPage: Page = () => {
  const buttonProps: ButtonProps = { initial: 3, label: "increment" };

  return html`
    <p>Pass a prop</p>
    <div>${Button({ initial: 10 })}</div>

    <p>Use the defaults</p>
    <div>${Button()}</div>

    <p>Spread</p>
    <div>${Button({ ...buttonProps })}</div>
  `;
};
