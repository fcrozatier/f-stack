import { html } from "@f-stack/reflow";
import { attr, map, on, style } from "@f-stack/reflow";
import { reactive } from "@f-stack/functorial";

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
    <h1 ${style({
      get color() {
        return selected.value;
      },
    })}>Pick a color</h1>

    <div>
      ${map(colors, (color, index) =>
        html`
          <button
            ${attr({
              "aria-label": color,
              get "aria-current"() {
                return selected.value === color;
              },
            })}
            ${on({ click: () => selected.value = color })}
            ${style({ "background": color })}
          >
            ${index.value + 1}
          </button>
        `)}
    </div>
  `;
};
