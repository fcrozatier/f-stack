import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { attr, map, on, text } from "$client/sinks.ts";

export const DeepStatePage = () => {
  const numbers = reactive([1, 2, 3]);
  const indices = reactive({ update: 0, insert: 0 });

  return html`
    <div>
      <button ${on({ click: () => numbers.push(numbers.length + 1) })}>
        Push ${reactive({
          get value() {
            return numbers.length + 1;
          },
        })}
      </button>
      <button ${on({ click: () => numbers.pop() })}>
        Pop
      </button>
      <div>
        <label>Insert index <input type="number" ${attr({
          value: indices.insert,
        })} ${on<HTMLInputElement>({
          input: function () {
            indices.insert = this.valueAsNumber;
          },
        })}></label>
        <button ${on({
          click: () => numbers.splice(indices.insert, 0, 10),
        })}>Insert 10</button>
      </div>
      <div>
        <label>Update index
          <input type="number" ${attr({ value: indices.update })} ${on<
            HTMLInputElement
          >({
            input: function () {
              indices.update = this.valueAsNumber;
            },
          })}></label>
        <label>New value
          <input
            type="number"
            ${attr({
              get value() {
                return numbers[indices.update]!;
              },
            })}
            ${on<HTMLInputElement>({
              input: function () {
                numbers[indices.update] = this.valueAsNumber;
              },
            })}
          >
        </label>
      </div>
    </div>

    <p>Sum:</p>
    <ul>
      ${map(numbers, (item) =>
        html`
          <li>
            <span>${text(item, "index")}th value:</span>
            ${text(item, "value")}
          </li>
        `)}
    </ul>

    <p>${reactive({
      get value() {
        return numbers.join(" + ");
      },
    })} = ${reactive({
      get value() {
        return numbers.reduce((a, b) => a + b, 0);
      },
    })}</p>
  `;
};
