import { reactive } from "@f-stack/functorial";
import { component, html, on } from "@f-stack/reflow";

export const Cleanup = component(function () {
  const elapsed = reactive({ value: 0 });
  const timeout = reactive({ value: 1000 });

  const setup = () =>
    setInterval(() => {
      elapsed.value += 1;
      console.log(elapsed.value);
    }, timeout.value);

  let id = setup();
  this.disposer.defer(() => clearInterval(id));

  this.listen(timeout, (e) => {
    console.log(e);
    clearInterval(id);
    id = setup();
  });

  return html`
    <button ${on({ click: () => timeout.value /= 2 })}>speed up</button>
    <button ${on({ click: () => timeout.value *= 2 })}>slow down</button>
    <p>elapsed: ${elapsed}</p>
  `;
});
