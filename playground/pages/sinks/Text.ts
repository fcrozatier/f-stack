import { derived, reactive } from "@f-stack/functorial";
import { attach, html, map, on } from "@f-stack/reflow";

export const TextPage = () => {
  const user = reactive({
    name: "Fred",
    style: "Fun",
    country: "France",
  });

  const selected = reactive<{ value: keyof typeof user }>({
    value: "name",
  });

  return html`
    <div>
      <style>
      label {
        text-transform: capitalize;
      }
      </style>

      ${map(Object.entries(user), (pair) => {
        const key = pair[0] as keyof typeof user;
        return html`
          <label>${key}</label>
          <input type="text" ${attach<HTMLInputElement>((i) => {
            i.defaultValue = pair[1];
          })} ${on<HTMLInputElement>({
            input: function () {
              user[key] = this.value;
            },
          })}>
        `;
      })}
    </div>

    <div>
      Select key to display

      <select ${on<HTMLSelectElement>({
        input: function () {
          selected.value = this.value as keyof typeof user;
        },
      })}>
        ${map(Object.keys(user), (key) => {
          return html`
            <option>${key}</option>
          `;
        })}
      </select>
    </div>
    <output>${derived(() => user[selected.value])}</output>
  `;
};
