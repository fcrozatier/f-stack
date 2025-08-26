import { html } from "$client/html.ts";
import { state } from "$client/reactivity/signals.ts";
import { attach, map } from "$client/sinks.ts";

export const LoopsPage = () => {
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ];
  const selected = reactive({ value: "red" });

  return html`
    <h1 ${style({ "color": selected })}>Pick a color</h1>

    <div>
      ${map(colors, (color, i) =>
        html`
          <button
            ${attach((button: HTMLButtonElement) => {
              button.style.background = color;
              button.ariaLabel = color;
              button.ariaCurrent = String(selected.value === color);
              button.addEventListener("click", () => {
                selected.value = color;
              });
            })}
          >
            ${i + 1}
          </button>
        `)}
    </div>
  `;
};
