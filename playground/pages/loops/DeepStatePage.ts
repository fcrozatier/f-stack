import { reactive } from "@f-stack/functorial";
import { attr, html, map, on, text } from "@f-stack/reflow";

export const DeepStatePage = () => {
  const numbers = reactive([1, 2, 3]);
  const indices = reactive({ update: 0, insert: 0 });
  const derived = reactive({
    get sumString() {
      return numbers.join(" + ");
    },
    get sumValue() {
      return numbers.reduce((a, b) => a + b, 0);
    },
  });

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
      ${map(numbers, (item, index) =>
        html`
          <li>
            value ${index}: ${item}
          </li>
        `)}
    </ul>

    <p>${text(derived, "sumString")} = ${text(derived, "sumValue")}</p>
  `;
};
