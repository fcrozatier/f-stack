import { reactive } from "@f-stack/functorial";
import { classList, html, on } from "@f-stack/reflow";

export default () => {
  const classes = reactive({
    selected: true,
    get "rounded opacity-0"() {
      return !this.selected;
    },
  });

  return html`
    <button ${on({ click: () => classes.selected = !classes.selected })}>
      Toggle selection
    </button>
    <span ${classList(classes)} data-testid="output"></span>
  `;
};
