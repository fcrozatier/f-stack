import { derived, reactive } from "@f-stack/functorial";
import { attr, html, map, on, show } from "@f-stack/reflow";

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
        })}>
        </label>
        <label>Price <input type="number" ${on<HTMLInputElement>({
          input: function () {
            newItem.price = this.valueAsNumber;
          },
        })}>
        </label>
        <label>Quantity <input type="number" ${on<HTMLInputElement>({
          input: function () {
            newItem.quantity = this.valueAsNumber;
          },
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
        ${map(items, (item, index) => {
          const state = reactive({ editing: false });

          return html`
            <li>
              <h3>Item ${derived(() => index.value + 1)}</h3>
              <ul>
                <li>Name: ${show(() => state.editing, () =>
                  html`
                    <input type="text" ${attr({
                      value: item.name,
                    })} ${on<HTMLInputElement>({
                      input: function () {
                        item.name = this.value;
                      },
                    })}>
                  `, () => item.name)}</li>
                <li>
                  Price: ${show(() => state.editing, () =>
                    html`
                      <input type="number" ${attr({
                        value: item.price,
                      })} ${on<HTMLInputElement>({
                        input: function () {
                          item.price = this.valueAsNumber;
                        },
                      })}>
                    `, () => item.price)}
                </li>
                <li>Quantity: ${show(() => state.editing, () =>
                  html`
                    <input type="number" ${attr({
                      value: item.quantity,
                    })} ${on<HTMLInputElement>({
                      input: function () {
                        item.quantity = this.valueAsNumber;
                      },
                    })}>
                  `, () => item.quantity)}</li>
              </ul>
              <p>
                <button ${on({
                  click: () => {
                    state.editing = !state.editing;
                  },
                })}>
                  ${derived(() => state.editing ? "Save" : "Update")}
                </button>
              </p>
            </li>
          `;
        })}
      </ul>
    </section>
  `;
};
