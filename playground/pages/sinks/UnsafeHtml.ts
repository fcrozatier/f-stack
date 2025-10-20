import { html } from "@f-stack/reflow";
import { on, unsafeHTML } from "@f-stack/reflow";
import { reactive } from "@f-stack/functorial";

export const UnsafeHtmlPage = () => {
  // nullish values are not rendered
  let username;

  // by default strings are raw
  const raw = "<em>HTML</em>";

  // unsafe HTML
  const unsafeInput = reactive({ value: "" });

  return html`
    <p>username: ${username}</p>
    <p>raw: ${raw}</p>
    <p>unsafe: ${unsafeHTML("<em>HTML</em>")}</p>
    <div>
      <textarea ${on<HTMLTextAreaElement>({
        "input": function () {
          unsafeInput.value = this.value;
        },
      })}></textarea>
    </div>
    ${unsafeHTML(unsafeInput)}
  `;
};
