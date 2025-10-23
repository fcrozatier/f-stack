import { listen, reactive } from "@f-stack/functorial";
import { attach, attr, html, on } from "@f-stack/reflow";

export const AttachPage = () => {
  const form = reactive({ value: "Bob" });
  const color = reactive({ value: "#40E0D0" });

  return html`
    <form>
      <label>username:
        <input type="text" ${attach((i: HTMLInputElement) => {
          i.defaultValue = form.value;
        })} ${on<HTMLInputElement>({
          input: function () {
            form.value = this.value;
          },
        })}>
      </label>
      <button type="reset">Reset</button>
    </form>

    <div>
      <input type="color" ${attr({
        get value() {
          return color.value;
        },
      })} ${on<HTMLInputElement>({
        input: function () {
          color.value = this.value;
        },
      })}>
    </div>

    <canvas width="300" height="300" ${attach(
      (canvas: HTMLCanvasElement) => {
        const context = canvas.getContext("2d");

        if (context) {
          const draw = (color: string) => {
            context.fillStyle = color;
            context.fillRect(0, 0, 200, 200);
          };

          draw(color.value);

          listen(color, (e) => {
            if (e.type !== "update") return;
            draw(e.newValue);
          });
        }
      },
    )}>Enable JS</canvas>

    <style>
    div {
      margin-top: 1em;
    }
    canvas {
      display: block;
      margin-inline: auto;
      margin-top: 1em;
    }
    </style>
  `;
};
