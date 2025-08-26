import { html } from "$client/html.ts";
import { addListener, reactive } from "$client/reactivity/reactive.ts";
import { on, unsafeHTML } from "$client/sinks.ts";

export const UnsafeHtmlPage = () => {
  // nullish values are not rendered
  let username;

  // by default strings are raw
  const raw = "<em>HTML</em>";

  // unsafe HTML
  const unsafeInput = reactive({ value: "" });

  addListener(unsafeInput, () => {
    console.log(unsafeInput.value);
  });

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
