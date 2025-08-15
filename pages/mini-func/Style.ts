import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { attach, type ReactiveStyles, style } from "$client/sinks.ts";

export const Style = () => {
  const bg = reactive({ value: "#ffff00" });
  const weight = reactive({ value: 4 });
  const styles: ReactiveStyles = reactive({
    "--bg": bg,
    outline: "1px solid red",
    color: "red",
    get "font-weight"() {
      return weight.value * 100;
    },
    background: "var(--bg, blue)",
  });

  return html`
    <p>
      <button ${style(styles)}>
        foo
      </button>
    </p>
    <p>
      <label>background
        <input type="color" value="#ffff00" ${attach(
          (i: HTMLInputElement) => {
            i.addEventListener("input", () => {
              bg.value = i.value;
            });
          },
        )}></label>
      <label>weight
        <input
          type="number"
          min="0"
          max="9"
          step="1"
          value="4"
          ${attach(
            (i: HTMLInputElement) => {
              i.addEventListener("change", () => {
                weight.value = i.valueAsNumber;
              });
            },
          )}
        ></label>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          styles.color = styles.color === "black" ? "red" : "black";
        });
      })}>Toggle color</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          styles.background = "yellow";
        });
      })}>Insert background</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          delete styles.background;
        });
      })}>Remove background</button>
    </p>
  `;
};
