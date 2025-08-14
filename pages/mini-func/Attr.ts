import { html } from "$client/html.ts";
import { attach, attr, type AttrSink } from "$client/sinks.ts";
import { reactive } from "$client/reactivity/reactive.ts";

export const Attr = () => {
  const disabled = reactive({ value: false });
  const myAttr: AttrSink = reactive({
    id: "ok",
    type: "button",
    disabled,
  });

  return html`
    <p>The attr() mini-functor manages attributes</p>
    <p>
      <button ${attr(myAttr)}>I'm a button</button>
    </p>
    <p>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          myAttr["value"] = "0";
        });
      })}>Add value attribute</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          myAttr["value"] = String(Number(myAttr["value"]) + 2);
        });
      })}>Update value attribute</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          delete myAttr["value"];
        });
      })}>Remove value attribute</button>
    </p>
    <p>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          disabled.value = true;
        });
      })}>Set disabled attribute</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          disabled.value = false;
        });
      })}>Remove disabled attribute</button>
    </p>
  `;
};
