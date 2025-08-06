import { html } from "$client/html.ts";
import { state } from "$client/reactivity/signals.ts";
import { attach } from "$client/sinks.ts";

interface ButtonProps {
  initial?: number;
}

// Type the default values with `satisfies`

export const Button = (props = { initial: 0 } satisfies ButtonProps) => {
  const count = state(props.initial);

  return html`
    <button ${attach((node) => {
      node.addEventListener("click", () => {
        count.value += 1;
      });
    })}>click ${count}</button>
  `;
};
