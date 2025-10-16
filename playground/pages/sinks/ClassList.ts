import { html } from "$clarity/html.ts";
import { classList, on } from "$clarity/sinks.ts";
import { reactive } from "$functorial/reactive.ts";

export const ClassListPage = () => {
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
      <button ${on({ click: () => selected.value = !selected.value })}>
        Toggle selection
      </button>
      <button ${on({ click: () => classes["highlight"] = true })}>
        Insert highlight
      </button>
      <button ${on({ click: () => delete classes["highlight"] })}>
        Remove highlight
      </button>
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
