import { createEffect, createSignal } from "./signals.js";

const html = (
  strings,
  ...values
) => {
  let innerHTML = strings[0];

  for (let index = 0; index < values.length; index++) {
    const string = strings[index + 1];
    const signal = values[index];
    innerHTML += `<!---->${signal.value}<!--${index}-->${string}`;
  }

  const template = document.createElement("template");
  template.innerHTML = innerHTML;
  const content = template.content;

  const tw = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT);
  let node;

  const comments = [];

  while ((node = tw.nextNode())) {
    comments.push(node);
    const data = node.data;

    if (!data) continue;

    const match = /^(\d+)$/.exec(data);

    if (data && match) {
      const index = Number(match[0]);
      const signal = values[index];
      const text = document.createTextNode(signal.value.toString());
      node.previousSibling?.replaceWith(text);

      createEffect(() => {
        const signal = values[index];
        text.textContent = signal.value.toString();
      });
    }
  }

  for (const comment of comments) {
    comment.remove();
  }

  return content;
};

const render = (component, target) => {
  target.appendChild(component());
};

const counter = (initial = 0) => {
  const state = createSignal(initial);

  setInterval(() => {
    state.value += 1;
  }, 1000);

  return html`
    <div>The count is: ${state}</div>
  `;
};

render(counter, document.body);
