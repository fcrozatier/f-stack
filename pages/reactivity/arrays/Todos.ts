import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { attr, derived, map, on } from "$client/sinks.ts";

type Todo = {
  description: number;
};

const rand = () => {
  return Math.floor(Math.random() * 100);
};

export const TodosPage = () => {
  const todos: Todo[] = reactive([
    { description: rand() },
    { description: rand() },
    { description: rand() },
  ]);
  const indices = reactive({ update: 0, insert: 0 });

  return html`
    <div>
      <button ${on({
        click: () => todos.unshift({ description: rand() }),
      })}>
        Unshift
      </button>
      <button ${on({
        click: () => todos.sort((a, b) => a.description - b.description),
      })}>
        Sort
      </button>
      <button ${on({
        click: () => todos.splice(1, 2, todos[2]!, todos[1]!),
      })}>
        Swap 1 & 2
      </button>
      <button ${on({
        click: () =>
          todos.splice(1, 2, todos[2]!, { description: rand() }, todos[1]!),
      })}>
        Swap and insert
      </button>
      <button ${on({
        click: () => todos.reverse(),
      })}>
        Reverse
      </button>
      <button ${on({
        click: () => todos.push({ description: rand() }),
      })}>
        Push
      </button>
      <button ${on({ click: () => todos.pop() })}>
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
          click: () =>
            todos.splice(indices.insert, 0, {
              description: rand(),
            }),
        })}>Insert</button>
      </div>
      <div>
        <label>Update index
          <input type="number" ${attr({
            get value() {
              return indices.update;
            },
          })} ${on<HTMLInputElement>({
            input: function () {
              indices.update = this.valueAsNumber;
            },
          })}></label>
        <label>New value
          <input
            type="number"
            ${attr({
              get value() {
                return todos[indices.update]?.description ?? "";
              },
            })}
            ${on<HTMLInputElement>({
              input: function () {
                const todo = todos[indices.update];
                if (todo) {
                  todo.description = this.valueAsNumber;
                } else {
                  console.log("todo not found");
                }
              },
            })}
          >
        </label>
      </div>
    </div>

    <div>
      <ul>
        ${map(todos, (todo) => {
          return html`
            <li>
              <h3>Number ${derived(() => todo.index)}</h3>
              <p>${derived(() => todo.value.description)}</p>
              <div>
                <button class="action" ${on({
                  click: () => todos.splice(todo.index, 1),
                })}>🗑️</button>
              </div>
            </li>
          `;
        })}
      </ul>
    </div>

    <p id="sum">${derived(() => todos.length)} remaining todos</p>
    <style>
    /*
      1. participate in hit-testing by not capturing :root in vt
      2. let pointer events fall through to maintain button interactivity during vt
    */
    :root {
      view-transition-name: none; /* 1 */
    }
    ::view-transition {
      pointer-events: none; /* 2 */
    }
    ::view-transition-group(*) {
      animation-duration: 200ms;
    }
    ::view-transition-new(.any-li):only-child {
      animation: in 250ms ease forwards;
      object-fit: contain;
      }
    ::view-transition-old(.any-li):only-child {
      animation: out 250ms ease-out forwards;
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
      display:grid;
      justify-content: center;
      gap: 1em;
    }
    li {
      list-style-type: none;
      padding: 1em;
      border-radius: 1em;
      background-color: peachpuff;
      width: 10rem;
      view-transition-name: match-element;
      view-transition-class: any-li;

      & div {
        display: flex;
        align-items: center;
        justify-content: end;
        gap: 0.5em;
      }
    }
    #sum {
      text-align: center;
      view-transition-name: match-element;
    }
    </style>
  `;
};
