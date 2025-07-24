import { isSignal } from "../client/signals.ts";
import type { TemplateTag } from "../definitions.d.ts";
import { Boundary } from "./Boundary.ts";
import { isComponent } from "./component.ts";

// data
const text = /[^<]+/y;
const rawTextElements = /^(?:script|style|textarea|title)$/i;
const rawText =
  /^(?:(?!<\/(?:script|style|textarea|title)[\t\n\f\r\u0020>/]).|\n)*/i;
const comment = /<!--((?!-->)\p{Any})*-->/vy;
const cdata = /<!\[CDATA\[(?:(?!\]\]>)\p{Any})*\]\]>/vy;

// element
const openTag = /<(?<tagname>[^\s>]+)\s+/vy;
const attribute = /[^\s"'>\/=]+\s*=\s*/y;
const booleanAttribute = /[^\s"'>\/=]+\s*/y;
const attributeValueQuoted = /(['"])(.*?)\1\s*/y;
const attributeValueUnquoted = /[^\s='"<>`]+\s*/y;
const closeOpenTag = /\/?>/y;
const endTag = /<\/(?<tagname>[^\s]+)>/y;

let rawTextMode = false;
let state: RegExp | null = null;
let match: RegExpExecArray | null = null;

const incrementalParse = (input: string) => {
  let pos = 0;
  let admissibleNextStates: RegExp[] = [];

  const nextState = () => {
    for (const regex of admissibleNextStates) {
      regex.lastIndex = pos;
      match = regex.exec(input);

      if (match) {
        pos = regex.lastIndex;
        state = regex;

        if (
          state === openTag && match.groups?.tagname &&
          rawTextElements.test(match.groups.tagname)
        ) {
          rawTextMode = true;
        }
        if (
          state === endTag && match.groups?.tagname &&
          rawTextElements.test(match.groups.tagname)
        ) {
          rawTextMode = false;
        }

        return;
      }
    }
  };

  while (pos !== input.length) {
    if (
      !state ||
      [text, rawText, comment, cdata, closeOpenTag, endTag].includes(state)
    ) {
      const textOrRawText = rawTextMode ? rawText : text;
      admissibleNextStates = [textOrRawText, comment, cdata, endTag, openTag];
    } else if (
      [openTag, attributeValueQuoted, attributeValueUnquoted, booleanAttribute]
        .includes(state)
    ) {
      admissibleNextStates = [closeOpenTag, attribute, booleanAttribute];
    } else if (state === attribute) {
      admissibleNextStates = [
        attributeValueQuoted,
        attributeValueUnquoted,
      ];
    }

    nextState();
  }

  return input;
};

export const html: TemplateTag = (
  strings,
  ...values
) => {
  let innerHTML = "";

  const boundariesMap = new Map<number, Boundary<any>>();
  const attachmentsMap = new Map<string, (node: Node) => any>();

  for (let index = 0; index < values.length; index++) {
    const string = strings[index]!;

    innerHTML += incrementalParse(string);
    const data = values[index];

    if (state !== attribute) {
      if (
        isSignal(data) ||
        isComponent(data) ||
        typeof data === "function"
      ) {
        const boundary = new Boundary(data);
        boundariesMap.set(boundary.id, boundary);

        innerHTML += String(boundary);
      } else {
        innerHTML += String(data);
      }
    } else if (
      [openTag, attributeValueQuoted, attributeValueUnquoted, booleanAttribute]
        .includes(state)
    ) {
      innerHTML += ` x-attach='${match?.groups?.name}' `;
    }
  }

  innerHTML += strings[strings.length - 1];
  const template = document.createElement("template");
  template.innerHTML = innerHTML;
  const content = template.content;

  const tw = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT);
  let comment: Comment;

  while ((comment = tw.nextNode() as Comment)) {
    const match = /^<(?<end>\/?)(?<id>\d+)>$/.exec(comment.data);

    // Unrelated comment
    if (!match || !match.groups?.id) continue;

    const id = Number(match.groups.id);
    const boundary = boundariesMap.get(id);

    // The boundary is managed elsewhere
    if (!boundary) continue;

    if (!match.groups.end) {
      boundary.start = comment;
      continue;
    }

    boundary.end = comment;
    boundary.render();
  }

  return content;
};
