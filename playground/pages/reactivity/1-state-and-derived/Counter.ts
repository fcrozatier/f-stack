import { reactive } from "@f-stack/functorial";
import { html, on, text } from "@f-stack/reflow";

type Props = { initial: number };

export const Counter = (props: Props = { initial: 0 }) => {
  const state = reactive({
    count: props.initial,
    get isEven() {
      return (this.count % 2) === 0;
    },
  });

  return html`
    <button ${on({ click: () => state.count++ })}>Click</button>
    <div>The count is: ${text(state, "count")}</div>
    <div>Is even: ${text(state, "isEven")}</div>
  `;
};
