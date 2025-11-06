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
  const user = reactive({ name: "Bob" });

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
    <h2>Reset values</h2>
    <form>
      <label>username:
        <input type="text" ${attr({
          value: user.name,
        })} ${on<HTMLInputElement>({
          input: function () {
            user.name = this.value;
          },
        })}>
      </label>
      <button type="reset">Reset</button>
    </form>
  `;
};
