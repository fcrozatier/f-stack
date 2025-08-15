import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { attach, classList } from "$client/sinks.ts";

export const ClassList = () => {
  const selected = reactive({ value: false });

  const classes: Record<string, any> = reactive({
    selected,
    get "not-selected"() {
      return !selected.value;
    },
  });

  return html`
    <p>
      <button ${classList(classes)}>
        foo
      </button>
    </p>
    <p>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          selected.value = !selected.value;
        });
      })}>Toggle selection</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          classes["highlight"] = true;
        });
      })}>Insert highlight</button>
      <button ${attach((b) => {
        b.addEventListener("click", () => {
          delete classes["highlight"];
        });
      })}>Remove highlight</button>
    </p>
    <style>
    .selected {
      outline: 1px solid black;
      outline-offset: 4px;
    }
    .not-selected {
      outline: 1px dashed black;
      outline-offset: 4px;
    }
    .highlight {
      font-weight: 800;
      background: yellow;
    }
    </style>
  `;
};
