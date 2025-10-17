import { html } from "$reflow/html.ts";
import { on } from "$reflow/sinks.ts";
import { reactive } from "$functorial/reactive.ts";

export const WritableDerivedPage = () => {
  const count: {
    _override?: number | undefined;
    _value: number;
    value: number;
  } = reactive({
    _override: undefined,
    _value: 0,
    get value() {
      return this._override ?? this._value;
    },
    set value(newValue) {
      this._override = undefined;
      this._value = newValue;
    },
  });

  const increment = () => {
    count._override = count.value + 1;
    setTimeout(() => {
      console.log("update");
      count.value++;
    }, 1000);
  };

  return html`
    <p>Count ${count}</p>
    <button ${on({ click: increment })}>Increment</button>
  `;
};
