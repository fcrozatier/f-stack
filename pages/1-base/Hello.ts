import { attach } from "../../client/attachement.ts";
import { component } from "../../client/component.ts";
import { html } from "../../client/html.ts";
import styles from './hello.css' with { type: "css" };

document.adoptedStyleSheets.push(styles)

const Nested = component(()=>{
  return html`<p data-scope=2>Another</p>`
})

export const Hello = component(() => {
  // Add data
  const name = "World";
  const src = "https://images.dog.ceo/breeds/terrier-patterdale/dog-1268559_640.jpg"

  return html`
    <div data-scope=1>
    <h1>Hello ${name.toUpperCase()}</h1>

    <img ${attach((img: HTMLImageElement) => {
      // dynamic attributes
      img.src = src
      img.alt = `${name} dances`;
    })}" />

    <p>A paragraph</p>

    ${Nested}
    </div>
  `;
});
