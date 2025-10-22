import { html } from "@f-stack/reflow";
import { on, show } from "@f-stack/reflow";
import { derived, reactive } from "@f-stack/functorial";

export const LogicPage = () => {
  const count = reactive({ value: 0 });

  return html`
    <button ${on({ click: () => count.value++ })}>
      Clicked ${count} ${derived(() => count.value === 1 ? "time" : "times")}
    </button>

    <p>
      ${show(
        () => count.value < 5,
        () => count.value,
        () =>
          html`
            <span>
              ${show(() => count.value > 10, () => "Too big", () =>
                html`
                  ${count} is between 5 and 10
                `)}
            </span>
          `,
      )}
    </p>
  `;
};
