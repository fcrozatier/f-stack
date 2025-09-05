import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { map, on, text } from "$client/sinks.ts";

export const UnshiftPage = () => {
  const arr = reactive([1, 2, 3]);

  return html`
    <p><button ${on({
      click: () => arr.unshift(Math.random()),
    })}>unshift</button></p>

    <ul>
      ${map(arr, (item) =>
        html`
          <li>index ${text(item, "index")}: ${text(item, "value")}</li>
        ` // <li>${text(item, "value")}</li>
      )}
    </ul>
  `;
};
