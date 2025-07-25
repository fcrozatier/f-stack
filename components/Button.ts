import { attach } from "../client/attachement.ts";
import { component } from "../client/component.ts";
import { html } from "../client/html.ts";
import { state } from "../client/signals.ts";

export const Button = component(() => {
  const disable = state(false);
  const count = state(0);

  return html`
    <div>
      <label>disable <input type="checkbox" ${attach((checkbox) => {
        checkbox.addEventListener("click", () => {
          disable.value = !disable.value;
        });
      })}></label>
    </div>
    <button ${attach((node) => {
      node.addEventListener("click", () => {
        count.value += 1;
      });
    })} ${attach((node: Element) => {
      if (disable.value) {
        node.setAttribute("disabled", "");
      } else {
        node.removeAttribute("disabled");
      }
    })}>click</button>
    <div>
      ${count}
    </div>
    <div>
      <input type="number" ${attach((input: HTMLInputElement) => {
        input.valueAsNumber = count.value;
      })}>
    </div>
  `;
});
