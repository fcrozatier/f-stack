import { attach } from "../../client/attachement.ts";
import { component } from "../../client/component.ts";
import { html } from "../../client/html.ts";
import { effect, type State, state } from "../../client/signals.ts";

const emojis = {
  apple: "🍎",
  banana: "🍌",
  carrot: "🥕",
  doughnut: "🍩",
  egg: "🥚",
};

type Name = keyof typeof emojis;

const Thing = component((props: { name: Name }) => {
  const { name } = props;
  const emoji = emojis[name];

  return html`
    <p>${emoji} ${name}</p>
  `;
});

export const Mutation = component(() => {
  const things: State<{ id: number; name: Name }[]> = state(
    [
      { id: 1, name: "apple" },
      { id: 2, name: "banana" },
      { id: 3, name: "carrot" },
      { id: 4, name: "doughnut" },
      { id: 5, name: "egg" },
    ],
  );

  effect(() => {
    console.log("things have changed");
    console.log(...things.value);
  });

  return html`
    <button ${attach((element) => {
      element.addEventListener(
        "click",
        () => things.value.shift(),
      );
    })}>Remove the first thing</button>

    ${() =>
      things.value.map((thing) =>
        html`
          ${Thing.bind({ name: thing.name })}
        `
      )}
  `;
});
