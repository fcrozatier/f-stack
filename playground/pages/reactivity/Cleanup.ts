import { derived, reactive } from "@f-stack/functorial";
import { component, html, on } from "@f-stack/reflow";

export const Cleanup = component(function () {
  const state = reactive({
    interval: 1000,
    elapsed: 0,
  });

  const setup = () =>
    setInterval(() => {
      state.elapsed += 1;
      console.log(state.elapsed);
    }, state.interval);

  let id = setup();
  this.disposer.defer(() => clearInterval(id));

  this.listen(state, (e) => {
    if (e.type === "update" && e.path === ".interval") {
      clearInterval(id);
      id = setup();
    }
  });

  return html`
    <button ${on({ click: () => state.interval /= 2 })}>speed up</button>
    <button ${on({ click: () => state.interval *= 2 })}>slow down</button>
    <p>elapsed: ${derived(() => state.elapsed)}</p>
  `;
});
