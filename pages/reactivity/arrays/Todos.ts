import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { attr, map, on, text } from "$client/sinks.ts";

export const TodosPage = () => {
  const todos = reactive([{id:1, value:"cook"}, {id:2,value:"eat"}, {id:3,value:"coffee"}]);
  const indices = reactive({ update: 0, insert: 0 });

  return html`
    <div>
      <button ${on({ click: () => todos.push({id:todos.length + 1, value:"sleep"}) })}>
        Push "sleep"
      </button>
      <button ${on({ click: () => todos.pop() })}>
        Pop
      </button>
      <div>
        <label>Insert "sleep" index <input type="number" ${attr({
          value: indices.insert,
        })} ${on<HTMLInputElement>({
          input: function () {
            indices.insert = this.valueAsNumber;
          },
        })}></label>
        <button ${on({
          click: () => todos.splice(indices.insert, 0, {id:10, value: "sleep"}),
        })}>Insert 10</button>
      </div>
      <div>
        <label>Update index
          <input type="number" ${attr({ value: indices.update})} ${on<HTMLInputElement>({
            input: function () {
              indices.update = this.valueAsNumber;
            },
          })}></label>
        <label>New value
          <input
            type="text"
            ${attr({
              get value() {
                return todos[indices.update]!.value;
              },
            })}
            ${on<HTMLInputElement>({
              input: function () {
                todos[indices.update]!.value = this.value;
              },
            })}
          >
        </label>
      </div>
    </div>

    <div>
      <ul id="todo">
        ${map(todos, (item) =>
          html`
            <li>
              <h3>Todo ${text(item, "index")}</h3>
              <p>${text(item.value, "value")}</p>
              <div>
                <button class="action">✅</button>
                <button class="action" ${on({
                  click: () => todos.splice(item.index, 1),
                })}>🗑️</button>
              </div>
            </li>
          `)}
      </ul>
      <ul id="done">
      <ul>
    </div>

    <p id="sum">${text(todos, "length")} todos</p>
    <style>
    ::view-transition-group(*) {
      animation-duration: 200ms;
    }
    ::view-transition-new(.any-li):only-child {
      animation: in 250ms ease;
      object-fit: contain;
      }
    ::view-transition-old(.any-li):only-child {
      animation: out 250ms ease-out;
    }
    @keyframes in {
      from {
        width: 100%;
        height: 0;
      }
      to {
        height: 100%;
      }
    }
    @keyframes out {
      to {
        opacity: 0;
        scale: 0.8;
        transform: translateX(300px);
      }
    }
    html, body {
      margin: 0;
      height: stretch;
      interpolate-size: allow-keywords;
    }
    html {
      font-family: system-ui;
      scrollbar-gutter: stable;
    }
    button {
      cursor: pointer;
    }
    button.action {
      border: none;
      padding: 0px;
      background: transparent;
    }
    h3 {
      margin-block: 0;
    }
    p {
      margin-bottom: 0;
    }
    ul {
      display: inline-grid;
      gap: 1em;
      justify-content: center;
    }
    li {
      list-style-type: none;
      padding: 1em;
      border-radius: 1em;
      background-color: peachpuff;
      width: 10rem;
      view-transition-name: auto;
      view-transition-class: any-li;

      & div {
        display: flex;
        align-items: center;
        justify-content: end;
        gap: 0.5em;
      }
    }
    #sum {
      view-transition-name: auto;
    }
    </style>
  `;
};
