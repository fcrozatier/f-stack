import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { attr, map, on, style } from "$client/sinks.ts";

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
      ${map(colors, ({ value: color, index: i }) =>
        html`
          <button
            ${attr({
              "aria-label": color,
              get "aria-current"() {
                return String(selected.value === color);
              },
            })}
            ${on({ click: () => selected.value = color })}
            ${style({ "background": color })}
          >
            ${i + 1}
          </button>
        `)}
    </div>
  `;
};
