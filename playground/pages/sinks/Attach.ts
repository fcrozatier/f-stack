import { reactive } from "@f-stack/functorial";
import { attach, attr, component, html, on, show } from "@f-stack/reflow";

export const AttachPage = () => {
  const state = reactive({ color: "#40E0D0", show: true });

  return html`
    <div>
      <input type="color" ${attr({
        value: state.color,
      })} ${on<HTMLInputElement>({
        input: function () {
          state.color = this.value;
        },
      })}>
      <button ${on({ click: () => state.show = !state.show })}>Toggle</button>
    </div>

    ${show(
      () => state.show,
      component(function () {
        return html`
          <canvas width="300" height="300" ${attach(
            (canvas: HTMLCanvasElement) => {
              const context = canvas.getContext("2d");

              if (context) {
                const draw = (color: string) => {
                  context.fillStyle = color;
                  context.fillRect(0, 0, 200, 200);
                };

                draw(state.color);

                this.listen(state, (e) => {
                  console.log(e);
                  if (e.type !== "update") return;
                  draw(e.newValue);
                });
              }
            },
          )}>Enable JS</canvas>
        `;
      }),
    )}

    <style>
    html { scrollbar-gutter: stable; }
    div {
      margin-top: 1em;
      display: flex;
      align-items: center;
      justify-items: stretch;
      gap: 1em;
    }
    canvas {
      display: block;
      max-height: 70vmin;
      margin-inline: auto;
      margin-top: 1em;
    }
    </style>
  `;
};
