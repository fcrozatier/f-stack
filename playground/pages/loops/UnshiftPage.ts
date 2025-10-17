import { html } from "$reflow/html.ts";
import { reactive } from "$functorial/reactive.ts";
import { map, on, text } from "$reflow/sinks.ts";

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
        `)}
    </ul>
  `;
};
