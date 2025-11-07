import { attr, html } from "@f-stack/reflow";
// @ts-ignore works in Chrome
// import styles from "./hello.css" with { type: "css" };

document.adoptedStyleSheets.push(styles);

const Nested = () => {
  return html`
    <p scope="2">Another</p>
  `;
};

/**
 * Primitive interpolation
 */
export const HtmlPage = () => {
  const name = "World";
  const src =
    "https://images.dog.ceo/breeds/terrier-patterdale/dog-1268559_640.jpg";

  return html`
    <div scope="1">
      <h1>Hello ${name.toUpperCase()}</h1>

      <img ${attr({ src, alt: "dog" })} width="300" />

      <p>A paragraph</p>

      ${Nested()}
    </div>
  `;
};
