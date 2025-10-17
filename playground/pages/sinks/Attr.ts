import { html } from "$reflow/html.ts";
import { attr, type AttrSink, on } from "$reflow/sinks.ts";
import { reactive } from "$functorial/reactive.ts";

export const Attr = () => {
  const disabled = reactive({ value: false });
  const myAttr: AttrSink = reactive({
    id: "ok",
    type: "button",
    disabled,
  });
  const input = reactive({ text: "hello", number: 10 });

  return html`
    <p>The attr() mini-functor manages attributes</p>
    <p>
      <button ${attr(myAttr)}>I'm a button</button>
    </p>
    <p>
      <button ${on({
        click: () => {
          myAttr["value"] = "0";
        },
      })}>Add value attribute</button>
      <button ${on({
        click: () => {
          myAttr["value"] = String(Number(myAttr["value"]) + 2);
        },
      })}>Update value attribute</button>
      <button ${on({
        click: () => {
          delete myAttr["value"];
        },
      })}>Remove value attribute</button>
    </p>
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

    <div>
      <input type="text" ${attr({ value: input.text })} ${on<HTMLInputElement>(
        {
          input: function () {
            input.text = this.value;
          },
        },
      )}>
      <input type="number" ${attr({ value: input.number })} ${on<
        HTMLInputElement
      >(
        {
          input: function () {
            input.number = this.valueAsNumber;
          },
        },
      )}>
    </div>
  `;
};
