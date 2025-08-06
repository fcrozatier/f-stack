import { html } from "$client/html.ts";
import { attach, map } from "$client/sinks.ts";
import {
  computed,
  ReactiveArray,
  reactiveProxy,
  state,
} from "$client/reactivity/signals.ts";

type Item = { name: string; price: number; quantity: number };

export const ObjectPage = () => {
  const newItem: Item = reactiveProxy({ name: "", price: 0, quantity: 0 });
  const items: Item[] = new ReactiveArray();

  return html`
    <section>
      <h2>New Item</h2>
      <form>
        <label>Name <input type="text" ${attach((i: HTMLInputElement) => {
          i.defaultValue = "";
          i.addEventListener("input", () => {
            newItem.name = i.value;
          });
        })}></label>
        <label>Price <input type="number" ${attach((i: HTMLInputElement) => {
          i.defaultValue = "0";
          i.addEventListener("input", () => {
            newItem.price = i.valueAsNumber;
          });
        })}></label>
        <label>Quantity <input type="number" ${attach((i: HTMLInputElement) => {
          i.defaultValue = "0";
          i.addEventListener("input", () => {
            newItem.quantity = i.valueAsNumber;
          });
        })}></label>
        <button type="reset" ${attach((b) => {
          b.addEventListener("click", () => {
            items.push({...newItem});
          });
        })}>Add item</button>

    </section>

    <section>
      <ul>
      ${map(items, (item, i) => {
        const editing = state(false);

          return html`
            <li>
              <h3>Item ${i + 1}</h3>
              <ul>
                <li>Name: ${computed(() =>
                  editing.value
                    ? html`
                      <input type="text" ${attach((input: HTMLInputElement)=>{
                        input.value = item.name
                        input.addEventListener("input", ()=>{
                          item.name = input.value
                        })
                      })}>
                    `
                    : item.name
                )}</li>
                <li>Price: ${computed(()=> editing.value ? html`
                    <input type="number" ${attach((input: HTMLInputElement)=>{
                      input.valueAsNumber = item.price
                      input.addEventListener("input", ()=>{
                        item.price = input.valueAsNumber
                      })
                    })}>
                    ` : item.price) }</li>
                <li>Quantity: ${computed(()=> editing.value ? html`
                    <input type="number" ${attach((input: HTMLInputElement)=>{
                      input.valueAsNumber = item.quantity
                      input.addEventListener("input", ()=>{
                        item.quantity = input.valueAsNumber
                      })
                    })}>
                    ` : item.quantity) }</li>
              </ul>
              <button ${attach((b) => {
                b.addEventListener("click", () => {
                  editing.value = !editing.value;
                });
              })}>
                ${computed(() => editing.value ? "Save" : "Update")}
              </button>
            </li>
          `;
        })}
      </ul>
    </section>
  `;
};
