import { reactive } from "@f-stack/functorial";
import { classList, html, on } from "@f-stack/reflow";
import type { ClassListSink } from "@f-stack/reflow";

export const ClassListPage = () => {
  const classes: ClassListSink = reactive({
    selected: false,
    get "not-selected"() {
      return !this.selected;
    },
  });

  return html`
    <p>
      <span ${classList(classes)}>foo</span>
    </p>
    <p>
      <button ${on({ click: () => classes.selected = !classes.selected })}>
        Toggle selection
      </button>
      <button ${on({ click: () => classes["highlight"] = true })}>
        Highlight
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
