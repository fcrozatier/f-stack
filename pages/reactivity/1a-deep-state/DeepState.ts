import { component } from "$client/component.ts";
import { html } from "$client/html.ts";
import { computed, ReactiveArray, state } from "$client/reactivity/signals.ts";
import { attach, map } from "$client/sinks.ts";

export const DeepState = component(() => {
  const numbers = new ReactiveArray(1, 2, 3);
  const join = computed(() => numbers.join(" + "));
  const total = computed(() => numbers.reduce((a, b) => a + b, 0));
  const size = computed(() => numbers.length + 1);

  const updateIndex = state(0);
  const insertIndex = state(0);

  return html`
    <div>
      <button ${attach((b: HTMLButtonElement) => {
        b.addEventListener("click", () => numbers.push(numbers.length + 1));
      })}>
        Push ${size}
      </button>
      <button ${attach((b: HTMLButtonElement) => {
        // b.addEventListener("click", () => numbers.pop());
        b.addEventListener(
          "click",
          () => numbers.splice(numbers.length - 1, 1),
        );
      })}>
        Pop
      </button>
      <div>
        <label>Insert index <input type="number" ${attach(
          (i: HTMLInputElement) => {
            i.valueAsNumber = insertIndex.value;
            i.addEventListener("input", () => {
              insertIndex.value = i.valueAsNumber;
            });
          },
        )}></label>
        <button ${attach((b: HTMLButtonElement) => {
          b.addEventListener(
            "click",
            () => numbers.splice(insertIndex.value, 0, 10),
          );
        })}>Insert 10</button>
      </div>
      <div>
        <label>Update index <input type="number" ${attach(
          (i: HTMLInputElement) => {
            i.valueAsNumber = updateIndex.value;
            i.addEventListener("input", () => {
              updateIndex.value = i.valueAsNumber;
            });
          },
        )}></label>
        <label>New value <input type="number" ${attach(
          (i: HTMLInputElement) => {
            i.valueAsNumber = numbers[updateIndex.value]!;
            i.addEventListener("input", () => {
              numbers[updateIndex.value] = i.valueAsNumber;
            });
          },
        )}></label>
      </div>
    </div>

    <p>Sum:</p>
    <ul>
      ${map(numbers, (n, i) =>
        html`
          <li><span>${i}th value:</span> ${n}</li>
        `)}
    </ul>
    <p>${join} = ${total}</p>
  `;
});
