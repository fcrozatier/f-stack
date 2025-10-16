import { html } from "$clarity/html.ts";
import { Button, type ButtonProps } from "../../components/Button.ts";

export const PropsPage = () => {
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
