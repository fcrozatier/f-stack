import { html } from "$clarity/html.ts";
import { on } from "$clarity/sinks.ts";
import { derived, reactive } from "$functorial/reactive.ts";

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
