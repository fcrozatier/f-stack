import { html } from "$client/html.ts";
import { attach, attr, type AttrSink } from "$client/sinks.ts";
import { reactive } from "$client/reactivity/reactive.ts";

export const Attr = () => {
  const myAttr: AttrSink = reactive({
    id: "ok",
    type: "button",
    disabled: false,
  }) satisfies Partial<HTMLButtonElement>;

  return html`
    <p>The attr() mini-functor manages attributes</p>
    <p>
      <button ${attr(myAttr)}>I'm a button</button>
    </p>
    <div>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          console.log("add");
          myAttr["value"] = "0";
          console.log(myAttr);
        });
      })}>Add value attribute</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          myAttr["value"] = String(Number(myAttr["value"]) + 1);
        });
      })}>Update value attribute</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          console.log("delete");
          delete myAttr["value"];
          console.log(myAttr);
        });
      })}>Remove value attribute</button>
    </div>
  `;
};
