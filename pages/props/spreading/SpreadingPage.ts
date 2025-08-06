import { html } from "$client/html.ts";
import { Button, type ButtonProps } from "$components/Button.ts";

export const SpreadingPage = () => {
  const buttonProps: ButtonProps = { initial: 3, label: "increment" };

  return html`
    ${Button({ ...buttonProps })}
  `;
};
