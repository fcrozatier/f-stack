import { reactive } from "@f-stack/functorial";
import { attr, html, on } from "@f-stack/reflow";

export default () => {
  const id = reactive({ value: "green" });

  return html`
    <p>
      <button ${on({
        click: () => id.value = "green",
      })} data-testid="green">green</button>
      <button ${on({
        click: () => id.value = "red",
      })} data-testid="red">red</button>
    </p>

    <span ${attr({
      get id() {
        return id.value;
      },
    })} data-testid="span"></span>
  `;
};
