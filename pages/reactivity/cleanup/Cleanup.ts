import { component } from "$client/component.ts";
import { html } from "$client/html.ts";
import { effect, state } from "$client/signals.ts";
import { attach } from "$client/attachement.ts";

export const Cleanup = component(() => {
  const interval = state(1000);
  const elapsed = state(0);

  effect(() => {
    const id = setInterval(() => {
      elapsed.value += 1;
    }, interval.value);

    return () => {
      clearInterval(id);
    };
  });

  return html`
    <button ${attach((b: HTMLButtonElement) => {
      b.addEventListener("click", () => interval.value /= 2);
    })}>speed up</button>

    <button ${attach((b: HTMLButtonElement) => {
      b.addEventListener("click", () => interval.value *= 2);
    })}>slow down</button>

    <p>elapsed: ${elapsed}</p>
  `;
});
