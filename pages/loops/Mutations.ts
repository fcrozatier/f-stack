import { html } from "$client/html.ts";
import { effect, ReactiveArray } from "$client/reactivity/signals.ts";
import { attach, map } from "$client/sinks.ts";

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

export const MutationPage = () => {
  const things: ReactiveArray<{
    id: number;
    name: Name;
  }> = new ReactiveArray(
    { id: 1, name: "apple" },
    { id: 2, name: "banana" },
    { id: 3, name: "carrot" },
    { id: 4, name: "doughnut" },
    { id: 5, name: "egg" },
  );

  effect(() => {
    console.log("things have changed");
    console.log(...things);
  });

  return html`
    <button ${attach((button) => {
      button.addEventListener("click", () => {
        things.shift();
        console.log("shifted", things);
      });
    })}>Remove the first thing</button>

    ${map(things, (thing) =>
      html`
        ${Thing({ name: thing.name })}
      `)}
  `;
};
