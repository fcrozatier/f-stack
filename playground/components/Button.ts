import { html, on } from "@f-stack/reflow";
import { reactive } from "@f-stack/functorial";

export interface ButtonProps {
  label?: string;
  initial?: number;
}

export const Button = ({ initial = 0, label = "click" }: ButtonProps = {}) => {
  const count = reactive({ value: initial });

  return html`
    <button ${on({
      click: () => {
        count.value += 1;
      },
    })}>${label} ${count}</button>
  `;
};
