import { html, prop } from "@f-stack/reflow";

export const PropPage = () => {
  return html`
    <form>
      <input type="checkbox" ${prop<HTMLInputElement>({
        indeterminate: true,
      })}>
      <input type="text" ${prop<HTMLInputElement>({ defaultValue: "Bob" })}>
      <p>
        <button type="reset">Reset</button>
      </p>
    </form>
  `;
};
