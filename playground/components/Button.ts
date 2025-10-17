import { html } from "$reflow/html.ts";
import { on } from "$reflow/sinks.ts";
import { reactive } from "$functorial/reactive.ts";

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
