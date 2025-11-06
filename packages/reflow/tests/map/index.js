import { reactive } from "@f-stack/functorial";
import { html, map, on } from "@f-stack/reflow";

export default () => {
  const values = reactive([0, 1, 2]);

  return html`
    <button ${on({ click: () => values.push(values.length) })}>append</button>

    <ul>
      ${map(values, (value, index) => {
        return html`
          <li>${index}:${value}</li>
        `;
      })}
    </ul>
  `;
};
