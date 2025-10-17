import { html } from "$reflow/html.ts";
import { attr, map, on, text } from "$reflow/sinks.ts";
import { reactive } from "$functorial/reactive.ts";

const rand = () => {
  return Math.round(Math.random() * 100) / 100;
};

export const MapPage = () => {
  const arr = reactive([1, 2, 3]);
  const indices = reactive({
    splice: { start: 0, deleteCount: 0, valuesCount: 0 },
    update: 0,
  });

  return html`
    <h2>Insertion</h2>
    <p>
      <button ${on({
        click: () => arr.push(rand(), rand()),
      })}>push (+2)</button>
      <button ${on({
        click: () => arr.unshift(rand(), rand()),
      })}>unshift (+2)</button>

      <button ${on({
        click: () =>
          arr.splice(
            indices.splice.start,
            indices.splice.deleteCount,
            ...Array.from({ length: indices.splice.valuesCount }, () => rand()),
          ),
      })}>
        splice
      </button>(<input type="number" min="0" ${attr({
        "value": indices.splice.start,
      })} ${on<HTMLInputElement>({
        change: function () {
          indices.splice.start = this.valueAsNumber;
        },
      })}>,
      <input type="number" min="0" ${attr({
        "value": indices.splice.deleteCount,
      })} ${on<HTMLInputElement>({
        change: function () {
          indices.splice.deleteCount = this.valueAsNumber;
        },
      })}>,
      <input
        type="number"
        min="0"
        ${attr({
          "value": indices.splice.valuesCount,
        })}
        ${on<HTMLInputElement>({
          change: function () {
            indices.splice.valuesCount = this.valueAsNumber;
          },
        })}
      >)
      <button ${on({
        click: () => arr.concat([rand(), rand(), rand()]),
      })}>concat (+3)</button>
    </p>
    <h2>Removal</h2>
    <p>
      <button ${on({ click: () => arr.pop() })}>pop</button>
      <button ${on({ click: () => arr.shift() })}>shift</button>
    </p>
    <h2>Updates</h2>
    <p>
      <button ${on({
        click: () => arr[indices.update]! += 1,
      })}>increment (+1)</button>
      <input
        type="number"
        min="0"
        ${attr({
          "value": indices.update,
        })}
        ${on<HTMLInputElement>({
          change: function () {
            indices.update = this.valueAsNumber;
          },
        })}
      >
      <button ${on({ click: () => arr.fill(1, 2, 4) })}>fill (1,2,4)</button>
      <button ${on({
        click: () => arr.copyWithin(0, 2, 4),
      })}>copyWithin (0,2,4)</button>
      <button ${on({ click: () => arr.reverse() })}>reverse</button>
    </p>
    <ul>${map(arr, (d) => {
      return html`
        <li>index ${text(d, "index")}: ${text(d, "value")}</li>
      `;
    })}</ul>

    <style>
    input {
      width: 5ch;
    }
    </style>
  `;
};
