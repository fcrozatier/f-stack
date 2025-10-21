import { html } from "@f-stack/reflow";
import { on, style, type StyleSink } from "@f-stack/reflow";
import { reactive } from "@f-stack/functorial";

export const Style = () => {
  const weight = reactive({ value: 4 });

  const styles: StyleSink = reactive({
    "--bg": "#ffff00",
    outline: "1px solid red",
    color: "red",
    get "font-weight"() {
      return weight.value * 100;
    },
    background: "var(--bg, blue)",
  });

  return html`
    <p>
      <span ${style(styles)}>
        foo
      </span>
    </p>
    <p>
      <label>background
        <input type="color" value="#ffff00" ${on<HTMLInputElement>({
          input: function () {
            styles["--bg"] = this.value;
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
      <button ${on({ click: () => styles.background = "green" })}>
        Set green background
      </button>
    </p>
  `;
};
