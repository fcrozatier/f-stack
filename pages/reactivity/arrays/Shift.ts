import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { map, on, text } from "$client/sinks.ts";

export const ShiftPage = () => {
  const arr = reactive([1, 2, 3]);

  return html`
    <p><button ${on({ click: () => arr.shift() })}>Shift</button></p>

    <ul>
      ${map(arr, (item) => {
        return html`
          <li>
            index ${text(item, "index")}: ${text(item, "value")}
          </li>
        `;
      })}
    </ul>
  `;
};
