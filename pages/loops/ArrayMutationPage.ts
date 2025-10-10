import { html } from "$client/html.ts";
import { reactive } from "$client/reactivity/reactive.ts";
import { map, on } from "$client/sinks.ts";

const emojis = {
  apple: "🍎",
  banana: "🍌",
  carrot: "🥕",
  doughnut: "🍩",
  egg: "🥚",
};

type Name = keyof typeof emojis;

const Thing = (props: { name: Name }) => {
  const { name } = props;
  const emoji = emojis[name];

  return html`
    <p>${emoji} = ${props.name}</p>
  `;
};

export const ArrayMutationPage = () => {
  const things = reactive([
    { id: 1, name: "apple" },
    { id: 2, name: "banana" },
    { id: 3, name: "carrot" },
    { id: 4, name: "doughnut" },
    { id: 5, name: "egg" },
  ]);

  return html`
    <button ${on({
      click: () => things.shift(),
    })}>Remove the first thing</button>

    ${map(things, ({ value: thing }) =>
      html`
        ${Thing({ name: thing.name as Name })}
      `)}

    <style>
    ::view-transition-group(*) {
      animation-duration: 200ms;
    }
    p {
      view-transition-name: match-element;
    }
    </style>
  `;
};
