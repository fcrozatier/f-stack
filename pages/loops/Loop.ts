import { attach } from "../../client/attachement.ts";
import { component } from "../../client/component.ts";
import { html } from "../../client/html.ts";
import { state } from "../../client/signals.ts";

export const Loop = component(() => {
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ];
  const selected = state("red");

  return html`
    <h1 ${attach((button: HTMLElement) => {
      button.style.color = selected.value;
    })}>Pick a color</h1>

    <div>
      ${() =>
        colors.map((color, i) =>
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
          `
        )}
    </div>
  `;
});
