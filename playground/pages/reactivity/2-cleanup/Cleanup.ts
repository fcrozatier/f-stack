import { html } from "$clarity/html.ts";
import { on } from "$clarity/sinks.ts";
import { addListener, derived, reactive } from "$functorial/reactive.ts";

export const Cleanup = () => {
  const state = reactive({
    interval: 1000,
    elapsed: 0,
  });

  let id = setInterval(() => {
    state.elapsed += 1;
  }, state.interval);

  addListener(state, (e) => {
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
