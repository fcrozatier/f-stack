import { html } from "$reflow/html.ts";
import { on, unsafeHTML } from "$reflow/sinks.ts";
import { reactive } from "$functorial/reactive.ts";

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
