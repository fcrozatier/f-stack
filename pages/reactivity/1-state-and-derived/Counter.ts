import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { derived, on } from "$client/sinks.ts";

type Props = { initial: number };

export const Counter = (props = { initial: 0 } satisfies Props) => {
  const state = reactive({
    count: props.initial,
    get isEven() {
      return (this.count % 2) === 0;
    },
  });

  return html`
    <button ${on({ click: () => state.count++ })}>Click</button>
    <div>The count is: ${derived(() => state.count)}</div>
    <div>Is even: ${derived(() => state.isEven)}</div>
  `;
};
