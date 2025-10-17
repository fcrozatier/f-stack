import { html } from "$reflow/html.ts";
import { attach, attr, map, on, show } from "$reflow/sinks.ts";
import { derived, reactive } from "$functorial/reactive.ts";

type Item = { name: string; price: number; quantity: number };

export const ObjectPage = () => {
  const newItem: Item = reactive({ name: "", price: 0, quantity: 0 });
  const items: Item[] = reactive([]);

  return html`
    <section>
      <h2>New Item</h2>
      <form>
        <label>Name <input type="text" ${on<HTMLInputElement>({
          input: function () {
            newItem.name = this.value;
          },
        })} ${attach((i: HTMLInputElement) => {
          i.defaultValue = "";
        })}>
        </label>
        <label>Price <input type="number" ${on<HTMLInputElement>({
          input: function () {
            newItem.price = this.valueAsNumber;
          },
        })} ${attach((i: HTMLInputElement) => {
          i.defaultValue = "0";
        })}>
        </label>
        <label>Quantity <input type="number" ${on<HTMLInputElement>({
          input: function () {
            newItem.quantity = this.valueAsNumber;
          },
        })} ${attach((i: HTMLInputElement) => {
          i.defaultValue = "0";
        })}>
        </label>
        <button type="reset" ${on({
          click: () => {
            items.push({ ...newItem });
          },
        })}>Add item</button>
      </form>
    </section>

    <section>
      <ul>
        ${map(items, (item) => {
          const state = reactive({ editing: false });

          return html`
            <li>
              <h3>Item ${derived(() => item.index + 1)}</h3>
              <ul>
                <li>Name: ${show(() => state.editing, () =>
                  html`
                    <input type="text" ${attr({
                      value: item.value.name,
                    })} ${on<HTMLInputElement>({
                      input: function () {
                        item.value.name = this.value;
                      },
                    })}>
                  `, () => item.value.name)}</li>
                <li>
                  Price: ${show(() => state.editing, () =>
                    html`
                      <input type="number" ${attr({
                        value: item.value.price,
                      })} ${on<HTMLInputElement>({
                        input: function () {
                          item.value.price = this.valueAsNumber;
                        },
                      })}>
                    `, () => item.value.price)}
                </li>
                <li>Quantity: ${show(() => state.editing, () =>
                  html`
                    <input type="number" ${attach<HTMLInputElement>((i) => {
                      i.defaultValue = String(item.value.quantity);
                    })} ${on<HTMLInputElement>({
                      input: function () {
                        item.value.quantity = this.valueAsNumber;
                      },
                    })}>
                  `, () => item.value.quantity)}</li>
              </ul>
              <button ${on({
                click: () => {
                  state.editing = !state.editing;
                },
              })}>
                ${derived(() => state.editing ? "Save" : "Update")}
              </button>
            </li>
          `;
        })}
      </ul>
    </section>
  `;
};
