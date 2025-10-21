import { html } from "@f-stack/reflow";
import { attr } from "@f-stack/reflow";
// @ts-ignore works
// import styles from "./hello.css" with { type: "css" };

document.adoptedStyleSheets.push(styles);

const Nested = () => {
  return html`
    <p data-scope="2">Another</p>
  `;
};

/**
 * Showcase simple interpolation
 */
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
