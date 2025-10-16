import { html } from "$clarity/html.ts";
import { attr } from "$clarity/sinks.ts";
import styles from "./hello.css" with { type: "css" };

document.adoptedStyleSheets.push(styles);

const Nested = () => {
  return html`
    <p data-scope="2">Another</p>
  `;
};

export const Hello = () => {
  // Add data
  const name = "World";
  const src =
    "https://images.dog.ceo/breeds/terrier-patterdale/dog-1268559_640.jpg";

  return html`
    <div data-scope="1">
      <h1>Hello ${name.toUpperCase()}</h1>

      <img ${attr({ src, alt: `${name} dances` })} />

      <p>A paragraph</p>

      ${Nested}
    </div>
  `;
};
