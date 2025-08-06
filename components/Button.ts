import { html } from "$client/html.ts";
import { state } from "$client/reactivity/signals.ts";
import { attach } from "$client/sinks.ts";

interface ButtonProps {
  label?: string;
  initial?: number;
}

export const Button = ({ initial = 0, label = "click" }: ButtonProps = {}) => {
  const count = state(initial);

  return html`
    <button ${attach((node) => {
      node.addEventListener("click", () => {
        count.value += 1;
      });
    })}>${label} ${count}</button>
  `;
};
