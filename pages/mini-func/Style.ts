import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { on, type ReactiveStyles, style } from "$client/sinks.ts";

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
        <input type="color" value="#ffff00" ${on<HTMLInputElement>({
          input: function () {
            bg.value = this.value;
          },
        })}></label>
      <label>weight
        <input
          type="number"
          min="0"
          max="9"
          step="1"
          value="4"
          ${on<HTMLInputElement>({
            input: function () {
              weight.value = this.valueAsNumber;
            },
          })}
        ></label>
      <button ${on({
        click: () => styles.color = styles.color === "black" ? "red" : "black",
      })}>Toggle color</button>
      <button ${on({ click: () => styles.background = "yellow" })}>
        Insert background
      </button>
      <button ${on({ click: () => delete styles.background })}>
        Remove background
      </button>
    </p>
  `;
};
