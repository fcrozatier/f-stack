import { reactive } from "@f-stack/functorial";
import type { AttrSink } from "@f-stack/reflow";
import { attr, html, on } from "@f-stack/reflow";

export const Attr = () => {
  const disabled = reactive({ value: false });
  const myAttr: AttrSink<"button"> = reactive({
    id: "ok",
    type: "button",
    get disabled() {
      return disabled.value;
    },
  });
  const input = reactive({ text: "hello", number: 10 });

  return html`
    <p>
      <button ${attr(myAttr)}>I'm a button</button>
    </p>
    <h3>Manage non boolean attributes</h3>
    <p>
      <button ${on({
        click: () => {
          myAttr["value"] = 0;
        },
      })}>Add value attribute</button>
      <button ${on({
        click: () => {
          myAttr["value"] = 2;
        },
      })}>Update value attribute</button>
      <button ${on({
        click: () => {
          delete myAttr["value"];
        },
      })}>Remove value attribute</button>
    </p>
    <h3>Manage boolean attributes</h3>
    <p>
      <button ${on({
        click: () => {
          disabled.value = true;
        },
      })}>Set disabled attribute</button>
      <button ${on({
        click: () => {
          disabled.value = false;
        },
      })}>Remove disabled attribute</button>
    </p>
    <h2>Two-way bindings</h2>
    <div>
      <input type="text" ${attr({
        get value() {
          return input.text;
        },
      })} ${on<HTMLInputElement>({
        input: function () {
          input.text = this.value;
        },
      })}>
      <input type="number" ${attr({
        get value() {
          return input.number;
        },
      })} ${on<HTMLInputElement>({
        input: function () {
          input.number = this.valueAsNumber;
        },
      })}>
    </div>
  `;
};
