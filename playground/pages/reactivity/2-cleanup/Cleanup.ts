import { html } from "@f-stack/reflow";
import { on } from "@f-stack/reflow";
import { derived, listen, reactive } from "@f-stack/functorial";

export const Cleanup = () => {
  const state = reactive({
    interval: 1000,
    elapsed: 0,
  });

  let id = setInterval(() => {
    state.elapsed += 1;
  }, state.interval);

  listen(state, (e) => {
    if (e.type === "update" && e.path === ".interval") {
      clearInterval(id);
      id = setInterval(() => {
        state.elapsed += 1;
      }, state.interval);
    }
  });

  return html`
    <button ${on({ click: () => state.interval /= 2 })}>speed up</button>
    <button ${on({ click: () => state.interval *= 2 })}>slow down</button>
    <p>elapsed: ${derived(() => state.elapsed)}</p>
  `;
};
