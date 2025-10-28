import { reactive } from "@f-stack/functorial";
import { html, math, on, text } from "@f-stack/reflow";

export const MathPage = () => {
  const dimensions = reactive({ exponent: 2 });

  return html`
    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
      ${math`
      <mrow>
        <msup>
          <mi>x</mi>
          <mn>${text(dimensions, "exponent")}</mn>
        </msup>
        <mo>+</mo>
        <mfrac>
          <mn>1</mn>
          <mi>y</mi>
        </mfrac>
        <mo>=</mo>
        <msqrt>
          <mi>a</mi>
          <mo>+</mo>
          <mi>b</mi>
        </msqrt>
        </mrow>
        `}
    </math>

    <label>
      exponent
      <input
        type="number"
        min="1"
        max="100"
        step="1"
        value="2"
        ${on<HTMLInputElement>({
          input: function () {
            dimensions.exponent = this.valueAsNumber;
          },
        })}
      ></label>
  `;
};
