import { reactive } from "@f-stack/functorial";
import { attr, html, on, show } from "@f-stack/reflow";

export const ShowPage = () => {
  const state = reactive({ visible: true, value: 0 });

  return html`
    <div>
      <button ${on({ click: () => state.visible = !state.visible })}>
        Toggle visibility
      </button>
      <input type="number" ${attr({
        get value() {
          return state.value;
        },
      })} ${on<HTMLInputElement>({
        input: function () {
          state.value = this.valueAsNumber;
        },
      })}>
    </div>

    <p>
      ${show(
        () => state.visible,
        () => state,
      )}
    </p>
  `;
};
