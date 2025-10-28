import { reactive } from "@f-stack/functorial";
import { attr, html, on, svg } from "@f-stack/reflow";

export const SVGPage = () => {
  const dimensions = reactive({ radius: 50 });

  return html`
    <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise1" x="0" y="0" width="100%" height="100%">
        <feTurbulence baseFrequency="0.025" />
      </filter>
      <filter id="noise2" x="0" y="0" width="100%" height="100%">
        <feTurbulence baseFrequency="0.05" />
      </filter>

      ${svg`
        <rect x="0" y="0" width="200" height="200" filter="url(#noise1)" />
        <rect x="220" y="0" width="200" height="200" filter="url(#noise2)" />
      `}

      <circle cx="50" cy="50" ${attr({
        get r() {
          return dimensions.radius;
        },
      })} />
    </svg>

    <label>
      radius
      <input
        type="number"
        min="0"
        max="100"
        step="10"
        value="50"
        ${on<HTMLInputElement>({
          input: function () {
            dimensions.radius = this.valueAsNumber;
          },
        })}
      ></label>
  `;
};
