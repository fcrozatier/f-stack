import { html } from "@f-stack/reflow";
import { derived, reactive } from "@f-stack/functorial";
import { on, show } from "@f-stack/reflow";

export const NestedPage = () => {
  const count = reactive({ value: 0 });

  return html`
    <button ${on({ click: () => count.value++ })}>
      Clicked ${count} ${derived(() => count.value === 1 ? "time" : "times")}
    </button>
    ${show(
      () => count.value % 2 === 0,
      () => count.value % 3 === 0 ? "Multiple of 6" : "Even number",
      () => "Odd number",
    )}
  `;
};
