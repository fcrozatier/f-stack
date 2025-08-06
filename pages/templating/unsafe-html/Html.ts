import { html } from "$client/html.ts";
import { state } from "$client/reactivity/signals.ts";
import { attach, unsafeHTML } from "$client/sinks.ts";

export const Html = () => {
  // nullish values are not rendered
  let username;

  // by default strings are raw
  const raw = "<em>HTML</em>";

  // unsafe HTML
  const unsafeString = unsafeHTML("<em>HTML</em>");
  const unsafeInput = state("");

  return html`
    <p>username: ${username}</p>
    <p>raw: ${raw}</p>
    <p>unsafe: ${unsafeString}</p>
    <div>
      <textarea ${attach((t: HTMLTextAreaElement) => {
        t.addEventListener("input", () => {
          unsafeInput.value = t.value;
        });
      })}></textarea>
    </div>
    ${unsafeHTML(unsafeInput)}
  `;
};
