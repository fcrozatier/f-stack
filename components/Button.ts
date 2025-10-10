import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { on } from "$client/sinks.ts";

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
