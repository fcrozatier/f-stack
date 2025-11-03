import { reactive } from "@f-stack/functorial";
import { html, map, on } from "@f-stack/reflow";

export const UnshiftPage = () => {
  const arr = reactive([1, 2, 3]);

  return html`
    <p><button ${on({
      click: () => arr.unshift(Math.random()),
    })}>unshift</button></p>

    <ul>
      ${map(arr, (item, index) =>
        html`
          <li>index ${index}: ${item}</li>
        `)}
    </ul>
  `;
};
