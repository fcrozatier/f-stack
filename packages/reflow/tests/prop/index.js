import { reactive } from "@f-stack/functorial";
import { html, on, prop } from "@f-stack/reflow";

export default () => {
  const bool = reactive({ value: true });

  return html`
    <button ${on({ click: () => bool.value = !bool.value })}>toggle</button>

    <input type="checkbox" ${prop({
      // @ts-ignore
      get indeterminate() {
        return bool.value;
      },
    })} data-testid="input">
  `;
};
