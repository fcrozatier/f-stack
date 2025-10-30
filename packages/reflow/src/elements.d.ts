// Reflow elements attributes definitions
// Author Frédéric Crozatier

/**
 * @internal
 */
type Booleanish = boolean | "true" | "false";

// CSS data types

type AbsoluteLengthUnit = "px" | "cm" | "mm" | "Q" | "in" | "pc" | "pt";

type ContainerQueryRelativeLengthUnit =
  | "cqw"
  | "cqh"
  | "cqi"
  | "cqb"
  | "cqmin"
  | "cqmax";

type FontRelativeLengthUnit =
  | "cap"
  | "ch"
  | "em"
  | "ex"
  | "ic"
  | "lh";

type RootRelativeLengthUnit =
  | "rcap"
  | "rch"
  | "rem"
  | "rex"
  | "ric"
  | "rlh";

type ViewportRelativeLengthUnit =
  | "vh"
  | "vw"
  | "vmax"
  | "vmin"
  | "vb"
  | "vi";

type RelativeLengthUnit =
  | ContainerQueryRelativeLengthUnit
  | FontRelativeLengthUnit
  | RootRelativeLengthUnit
  | ViewportRelativeLengthUnit;

/**
 * @internal
 */
type LengthUnit = AbsoluteLengthUnit | RelativeLengthUnit;

/**
 * The <length> CSS data type represents a distance value. Lengths can be used in numerous CSS properties, such as width, height, margin, padding, border-width, font-size, and text-shadow.
 */
export type Length = `${number}${LengthUnit}`;

/**
 * The <percentage> CSS data type represents a percentage value. It is often used to define a size as relative to an element's parent object. Numerous properties can use percentages, such as width, height, margin, padding, and font-size.
 */
export type Percentage = `${number}%`;

/**
 * The <length-percentage> CSS data type represents a value that can be either a {@linkcode Length | <length>} or a {@linkcode Percentage | <percentage>}.
 */
export type LengthPercentage = Length | Percentage;

/**
 * Allowed {@linkcode Angle} units
 *
 * @internal
 */
type AngleUnit = "deg" | "grad" | "rad" | "turn";

/**
 * The <angle> CSS data type represents an angle value expressed in degrees, gradients, radians, or turns.
 */
export type Angle = `${number}${AngleUnit}`;

// SVG data types

/**
 * For SVG-specific properties defined in SVG1.1 and their corresponding presentation attributes, the unit identifiers in values are optional. If not provided, the length value represents a distance in the current user coordinate system. Length identifiers must be in lower case when used in presentation attributes for all properties whether they are defined in SVG or in CSS. This case sensitivity is relaxed in SVG2 to align with CSS.
 *
 * @internal
 */
type SVGLength = number | Length;

/**
 * @internal
 */
type SVGLengthPercentage = SVGLength | Percentage;

/**
 * All the WAI-ARIA 1.2 attributes from https://www.w3.org/TR/wai-aria-1.2/#state_prop_def
 */
export interface AriaAttributes {
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  "aria-activedescendant"?: string;
  /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
  "aria-atomic"?: Booleanish;
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
   * presented if they are made.
   */
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
  "aria-busy"?: Booleanish;
  /**
   * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
   * @see {@linkcode aria-pressed} @see {@linkcode aria-selected}.
   */
  "aria-checked"?: Booleanish | "mixed";
  /**
   * Defines the total number of columns in a table, grid, or treegrid.
   * @see {@linkcode aria-colindex}.
   */
  "aria-colcount"?: number;
  /**
   * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
   * @see {@linkcode aria-colcount} @see {@linkcode aria-colspan}.
   */
  "aria-colindex"?: number;
  /**
   * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
   * @see {@linkcode aria-colindex} @see {@linkcode aria-rowspan}.
   */
  "aria-colspan"?: number;
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   * @see {@linkcode aria-owns}.
   */
  "aria-controls"?: string;
  /** Indicates the element that represents the current item within a container or set of related elements. */
  "aria-current"?:
    | Booleanish
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
  /**
   * Identifies the element (or elements) that describes the object.
   * @see {@linkcode aria-labelledby}
   */
  "aria-describedby"?: string;
  /**
   * Identifies the element that provides a detailed, extended description for the object.
   * @see {@linkcode aria-describedby}.
   */
  "aria-details"?: string;
  /**
   * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
   * @see {@linkcode aria-hidden} @see {@linkcode aria-readonly}.
   */
  "aria-disabled"?: Booleanish;
  /**
   * Identifies the element that provides an error message for the object.
   * @see {@linkcode aria-invalid} @see {@linkcode aria-describedby}.
   */
  "aria-errormessage"?: string;
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  "aria-expanded"?: Booleanish;
  /**
   * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
   * allows assistive technology to override the general default of reading in document source order.
   */
  "aria-flowto"?: string;
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  "aria-haspopup"?:
    | Booleanish
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog";
  /**
   * Indicates whether the element is exposed to an accessibility API.
   * @see {@linkcode aria-disabled}.
   */
  "aria-hidden"?: Booleanish;
  /**
   * Indicates the entered value does not conform to the format expected by the application.
   * @see {@linkcode aria-errormessage}.
   */
  "aria-invalid"?: Booleanish | "grammar" | "spelling";
  /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
  "aria-keyshortcuts"?: string;
  /**
   * Defines a string value that labels the current element.
   * @see {@linkcode aria-labelledby}.
   */
  "aria-label"?: string;
  /**
   * Identifies the element (or elements) that labels the current element.
   * @see {@linkcode aria-describedby}.
   */
  "aria-labelledby"?: string;
  /** Defines the hierarchical level of an element within a structure. */
  "aria-level"?: number;
  /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
  "aria-live"?: "off" | "assertive" | "polite";
  /** Indicates whether an element is modal when displayed. */
  "aria-modal"?: Booleanish;
  /** Indicates whether a text box accepts multiple lines of input or only a single line. */
  "aria-multiline"?: Booleanish;
  /** Indicates that the user may select more than one item from the current selectable descendants. */
  "aria-multiselectable"?: Booleanish;
  /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
  "aria-orientation"?: "horizontal" | "vertical";
  /**
   * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
   * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
   * @see {@linkcode aria-controls}.
   */
  "aria-owns"?: string;
  /**
   * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
   * A hint could be a sample value or a brief description of the expected format.
   */
  "aria-placeholder"?: string;
  /**
   * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
   * @see {@linkcode aria-setsize}.
   */
  "aria-posinset"?: number;
  /**
   * Indicates the current "pressed" state of toggle buttons.
   * @see {@linkcode aria-checked} @see {@linkcode aria-selected}.
   */
  "aria-pressed"?: Booleanish | "mixed";
  /**
   * Indicates that the element is not editable, but is otherwise operable.
   * @see {@linkcode aria-disabled}.
   */
  "aria-readonly"?: Booleanish;
  /**
   * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
   * @see {@linkcode aria-atomic}.
   */
  "aria-relevant"?:
    | "additions"
    | "additions removals"
    | "additions text"
    | "all"
    | "removals"
    | "removals additions"
    | "removals text"
    | "text"
    | "text additions"
    | "text removals";
  /** Indicates that user input is required on the element before a form may be submitted. */
  "aria-required"?: Booleanish;
  /** Defines a human-readable, author-localized description for the role of an element. */
  "aria-roledescription"?: string;
  /**
   * Defines the total number of rows in a table, grid, or treegrid.
   * @see {@linkcode aria-rowindex}.
   */
  "aria-rowcount"?: number;
  /**
   * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
   * @see {@linkcode aria-rowcount} @see {@linkcode aria-rowspan}.
   */
  "aria-rowindex"?: number;
  /**
   * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
   * @see {@linkcode aria-rowindex} @see {@linkcode aria-colspan}.
   */
  "aria-rowspan"?: number;
  /**
   * Indicates the current "selected" state of various widgets.
   * @see {@linkcode aria-checked} @see {@linkcode aria-pressed}.
   */
  "aria-selected"?: Booleanish;
  /**
   * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
   * @see {@linkcode aria-posinset}.
   */
  "aria-setsize"?: number;
  /** Indicates if items in a table or grid are sorted in ascending or descending order. */
  "aria-sort"?:
    | "none"
    | "ascending"
    | "descending"
    | "other";
  /** Defines the maximum allowed value for a range widget. */
  "aria-valuemax"?: number;
  /** Defines the minimum allowed value for a range widget. */
  "aria-valuemin"?: number;
  /**
   * Defines the current value for a range widget.
   * @see {@linkcode aria-valuetext}.
   */
  "aria-valuenow"?: number;
  /** Defines the human readable text alternative of aria-valuenow for a range widget. */
  "aria-valuetext"?: string;
}

/**
 * All the non [abstract](https://www.w3.org/TR/wai-aria-1.2/#abstract_roles) WAI-ARIA 1.2 role attributes from https://www.w3.org/TR/wai-aria-1.2/#role_definitions
 */
export type AriaRole =
  | "alert"
  | "alertdialog"
  | "application"
  | "article"
  | "banner"
  | "blockquote"
  | "button"
  | "caption"
  | "cell"
  | "checkbox"
  | "columnheader"
  | "combobox"
  | "complementary"
  | "contentinfo"
  | "definition"
  | "deletion"
  | "dialog"
  | "document"
  | "emphasis"
  | "feed"
  | "figure"
  | "form"
  | "generic"
  | "grid"
  | "gridcell"
  | "group"
  | "heading"
  | "img"
  | "insertion"
  | "link"
  | "list"
  | "listbox"
  | "listitem"
  | "log"
  | "main"
  | "marquee"
  | "math"
  | "meter"
  | "menu"
  | "menubar"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "navigation"
  | "none"
  | "note"
  | "option"
  | "paragraph"
  | "presentation"
  | "progressbar"
  | "radio"
  | "radiogroup"
  | "region"
  | "row"
  | "rowgroup"
  | "rowheader"
  | "scrollbar"
  | "search"
  | "searchbox"
  | "separator"
  | "slider"
  | "spinbutton"
  | "status"
  | "strong"
  | "subscript"
  | "suggestion"
  | "superscript"
  | "switch"
  | "tab"
  | "table"
  | "tablist"
  | "tabpanel"
  | "term"
  | "textbox"
  | "time"
  | "timer"
  | "toolbar"
  | "tooltip"
  | "tree"
  | "treegrid"
  | "treeitem"
  | (string & {});

/**
 * Global HTML Attributes
 */
export interface HTMLAttributes extends AriaAttributes {
  /**
   * Provides a hint for generating a keyboard shortcut for the current element. This attribute consists of a space-separated list of characters. The browser should use the first one that exists on the computer keyboard layout.
   */
  accesskey?: string;
  /**
   * Controls whether inputted text is automatically capitalized and, if so, in what manner.
   */
  autocapitalize?:
    | "characters"
    | "off"
    | "on"
    | "none"
    | "sentences"
    | "words";
  /**
   * Controls whether input text is automatically corrected for spelling errors. This can be applied to elements that have editable text except for <input> elements with the attribute: type="password", type="email", or type="url".
   */
  autocorrect?: "on" | "off";
  /**
   * Indicates that an element is to be focused on page load, or as soon as the <dialog> it is part of is displayed. This attribute is a boolean, initially false.
   */
  autofocus?: boolean;
  /**
   * A space-separated list of the classes of the element. Classes allow CSS and JavaScript to select and access specific elements via the class selectors or functions like the method Document.getElementsByClassName().
   */
  class?: string;
  /**
   * An enumerated attribute indicating if the element should be editable by the user. If so, the browser modifies its widget to allow editing.
   */
  contenteditable?:
    | Booleanish
    | "inherit"
    | "plaintext-only";
  /**
   * An enumerated attribute indicating the directionality of the element's text.
   */
  dir?: "ltr" | "rtl" | "auto";
  /**
   * An enumerated attribute indicating whether the element can be dragged, using the Drag and Drop API
   */
  draggable?: Booleanish;
  /**
   * Hints what action label (or icon) to present for the enter key on virtual keyboards.
   */
  enterkeyhint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send";
  /**
   * Used to transitively export shadow parts from a nested shadow tree into a containing light tree
   */
  exportparts?: string;
  /**
   * An enumerated attribute indicating that the element is not yet, or is no longer, relevant. For example, it can be used to hide elements of the page that can't be used until the login process has been completed. The browser won't render such elements. This attribute must not be used to hide content that could legitimately be shown.
   */
  hidden?: boolean | "until-found" | "";
  /**
   * Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).
   */
  id?: string;
  /**
   * A boolean value that makes the browser disregard user input events for the element. Useful when click events are present.
   */
  inert?: boolean;
  /**
   * Provides a hint to browsers about the type of virtual keyboard configuration to use when editing this element or its contents. Used primarily on <input> elements, but is usable on any element while in contenteditable mode.
   */
  inputmode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  /**
   * Allows you to specify that a standard HTML element should behave like a registered customized built-in element (see Using custom elements for more details).
   */
  is?: string;

  // The item* attributes are part of the WHATWG HTML Microdata feature.

  /**
   * The unique, global identifier of an item.
   */
  itemid?: string;
  /**
   * Used to add properties to an item. Every HTML element may have an itemprop attribute specified, where an itemprop consists of a name and value pair.
   */
  itemprop?: string;
  /**
   * Properties that are not descendants of an element with the itemscope attribute can be associated with the item using an itemref. It provides a list of element ids (not itemids) with additional properties elsewhere in the document.
   */
  itemref?: string;
  /**
   * itemscope (usually) works along with itemtype to specify that the HTML contained in a block is about a particular item. itemscope creates the Item and defines the scope of the itemtype associated with it. itemtype is a valid URL of a vocabulary (such as schema.org) that describes the item and its properties context.
   */
  itemscope?: boolean;
  /**
   * Specifies the URL of the vocabulary that will be used to define itemprops (item properties) in the data structure. itemscope is used to set the scope of where in the data structure the vocabulary set by itemtype will be active.
   */
  itemtype?: string;

  /**
   * Helps define the language of an element: the language that non-editable elements are in, or the language that editable elements should be written in by the user. The attribute should contain a valid [BCP 47 language tag](https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag). xml:lang has priority over it.
   */
  lang?: string;
  /**
   * A cryptographic nonce ("number used once") which can be used by Content Security Policy to determine whether or not a given fetch will be allowed to proceed.
   */
  nonce?: string;
  /**
   * A space-separated list of the part names of the element. Part names allows CSS to select and style specific elements in a shadow tree via the ::part pseudo-element.
   */
  part?: string;
  /**
   * Used to designate an element as a popover element (see Popover API). Popover elements are hidden via display: none until opened via an invoking/control element (i.e., a <button> or <input type="button"> with a popovertarget attribute) or a HTMLElement.showPopover() call.
   */
  popover?: "auto" | "manual" | "hint" | "";
  /**
   * Roles define the semantic meaning of content, allowing screen readers and other tools to present and support interaction with an object in a way that is consistent with user expectations of that type of object. roles are added to HTML elements using role="role_type", where role_type is the name of a role in the ARIA specification.
   */
  role?: AriaRole;
  /**
   * Assigns a slot in a shadow DOM shadow tree to an element: An element with a slot attribute is assigned to the slot created by the <slot> element whose name attribute's value matches that slot attribute's value.
   */
  slot?: string;
  /**
   * An enumerated attribute defines whether the element may be checked for spelling errors.
   */
  spellcheck?: Booleanish;
  /**
   * Contains CSS styling declarations to be applied to the element. Note that it is recommended for styles to be defined in a separate file or files. This attribute and the <style> element have mainly the purpose of allowing for quick styling, for example for testing purposes.
   */
  style?: string;
  /**
   * An integer attribute indicating if the element can take input focus (is focusable), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values:
   *
   *
    - a negative value means that the element should be focusable, but should not be reachable via sequential keyboard navigation;
    - 0 means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention;
    - a positive value means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the tabindex. If several elements share the same tabindex, their relative order follows their relative positions in the document.

   */
  tabindex?: number;
  /**
   * Contains a text representing advisory information related to the element it belongs to. Such information can typically, but not necessarily, be presented to the user as a tooltip.
   */
  title?: string;
  /**
   * An enumerated attribute that is used to specify whether an element's attribute values and the values of its Text node children are to be translated when the page is localized, or whether to leave them unchanged.
   */
  translate?: "yes" | "no" | "";
  /**
   * An enumerated attribute indicating if browser-provided writing suggestions should be enabled under the scope of the element or not.
   */

  /**
   * Forms a class of attributes, called custom data attributes, that allow proprietary information to be exchanged between the HTML and its DOM representation that may be used by scripts. All such custom data are available via the HTMLElement interface of the element the attribute is set on. The HTMLElement.dataset property gives access to them.
   */
  [key: `data-${string}`]: any;
}

/**
 * The <a> HTML element (or anchor element), with its href attribute, creates a hyperlink to web pages, files, email addresses, locations in the same page, or anything else a URL can address
 */
export interface HTMLAnchorAttributes extends HTMLAttributes {
  /**
   * Causes the browser to treat the linked URL as a download
   */
  download?: any;
  /**
   * The URL that the hyperlink points to
   */
  href?: string;
  /**
   * Hints at the human language of the linked URL. No built-in functionality. Allowed values are the same as the global lang attribute.
   */
  hreflang?: string;
  /**
   * A space-separated list of URLs. When the link is followed, the browser will send POST requests with the body PING to the URLs. Typically for tracking.
   */
  ping?: string;
  /**
   * How much of the referrer to send when following the link
   */
  referrerpolicy?: ReferrerPolicy;
  /**
   * The relationship of the linked URL as space-separated link types.
   */
  rel?: string;
  /**
   * Where to display the linked URL, as the name for a browsing context (a tab, window, or <iframe>).
   */
  target?:
    | "_self"
    | "_blank"
    | "_parent"
    | "_top"
    | "_unfencedTop"
    | (string & {});
  /**
   * Hints at the linked URL's format with a MIME type. No built-in functionality.
   */
  type?: string;
}

/**
 * The <area> HTML element defines an area inside an image map that has predefined clickable areas. An image map allows geometric areas on an image to be associated with hypertext links.
 */
export interface HTMLAreaAttributes extends HTMLAttributes {
  /**
   * A text string alternative to display on browsers that do not display images
   */
  alt?: string;
  /**
   * The coords attribute details the coordinates of the shape attribute in size, shape, and placement of an <area>.
   */
  coords?: string;
  /**
   * This attribute, if present, indicates that the linked resource is intended to be downloaded rather than displayed in the browser
   */
  download?: any;
  /**
   * The hyperlink target for the area. Its value is a valid URL. This attribute may be omitted; if so, the <area> element does not represent a hyperlink
   */
  href?: string;
  /**
   * Contains a space-separated list of URLs to which, when the hyperlink is followed, POST requests with the body PING will be sent by the browser (in the background). Typically used for tracking
   */
  ping?: string;
  /**
   * A string indicating which referrer to use when fetching the resource
   */
  referrerpolicy?: ReferrerPolicy;
  /**
   * For anchors containing the href attribute, this attribute specifies the relationship of the target object to the link object
   */
  rel?: string;
  /**
   * The shape of the associated hot spot
   */
  shape?: "circle" | "default" | "poly" | "rect";
  /**
   * A keyword or author-defined name of the browsing context to display the linked resource.
   */
  target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
}

/**
 * The <audio> HTML element is used to embed sound content in documents
 */
export interface HTMLAudioAttributes extends HTMLMediaAttributes {}

/**
 * The <base> HTML element specifies the base URL to use for all relative URLs in a document. There can be only one <base> element in a document
 */
export interface HTMLBaseAttributes extends HTMLAttributes {
  /**
   * The base URL to be used throughout the document for relative URLs. Absolute and relative URLs are allowed. data: and javascript: URLs are not allowed.
   */
  href?: string;
  /**
   * A keyword or author-defined name of the default browsing context to show the results of navigation from <a>, <area>, or <form> elements without explicit target attributes
   */
  target?: "_self" | "_blank" | "_parent" | "_top";
}

/**
 * The <bdo> HTML element overrides the current directionality of text, so that the text within is rendered in a different direction
 */
export interface HTMLBDOAttributes extends HTMLAttributes {
  /**
   * The direction in which text should be rendered in this element's contents
   */
  dir?: "rtl" | "ltr";
}

/**
 * The <blockquote> HTML element indicates that the enclosed text is an extended quotation
 */
export interface HTMLBlockquoteAttributes extends HTMLAttributes {
  /**
   * A URL that designates a source document or message for the information quoted. This attribute is intended to point to information explaining the context or the reference for the quote.
   */
  cite?: string;
}

/**
 * The <button> HTML element is an interactive element activated by a user with a mouse, keyboard, finger, voice command, or other assistive technology. Once activated, it then performs an action, such as submitting a form or opening a dialog.
 */
export interface HTMLButtonAttributes extends HTMLAttributes {
  /**
   * Specifies the action to be performed on an element being controlled by a control <button> specified via the commandfor attribute.
   */
  command?:
    | "show-modal"
    | "close"
    | "request-close"
    | "show-popover"
    | "hide-popover"
    | "toggle-popover"
    | `--${string}`;
  /**
   * Turns a <button> element into a command button, controlling a given interactive element by issuing the command specified in the button's command attribute. The commandfor attribute takes the ID of the element to control as its value. This is a more general version of popovertarget
   */
  commandfor?: string;
  /**
   * This Boolean attribute prevents the user from interacting with the button: it cannot be pressed or focused.
   */
  disabled?: boolean;
  /**
   * The <form> element to associate the button with (its form owner). The value of this attribute must be the id of a <form> in the same document.
   */
  form?: string;
  /**
   * The URL that processes the information submitted by the button. Overrides the action attribute of the button's form owner. Does nothing if there is no form owner
   */
  formaction?: string;
  /**
   * If the button is a submit button (it's inside/associated with a <form> and doesn't have type="button"), specifies how to encode the form data that is submitted
   */
  formenctype?:
    | "application/x-www-form-urlencoded"
    | "multipart/form-data"
    | "text/plain";
  /**
   * If the button is a submit button (it's inside/associated with a <form> and doesn't have type="button"), this attribute specifies the HTTP method used to submit the form
   */
  formmethod?:
    | "dialog"
    | "get"
    | "post";
  /**
   * If the button is a submit button, this Boolean attribute specifies that the form is not to be validated when it is submitted. If this attribute is specified, it overrides the novalidate attribute of the button's form owner.
   */
  formnovalidate?: boolean;
  /**
   * If the button is a submit button, this attribute is an author-defined name or standardized, underscore-prefixed keyword indicating where to display the response from submitting the form
   */
  formtarget?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
  /**
   * The name of the button, submitted as a pair with the button's value as part of the form data, when that button is used to submit the form.
   */
  name?: string;
  /**
   * Turns a <button> element into a popover control button; takes the ID of the popover element to control as its value. Establishing a relationship between a popover and its invoker button using the popovertarget attribute has two additional useful effects:
   *
   * - The browser creates an implicit aria-details and aria-expanded relationship between popover and invoker, and places the popover in a logical position in the keyboard focus navigation order when shown. This makes the popover more accessible to keyboard and assistive technology (AT) users (see also Popover accessibility features).
   * - The browser creates an implicit anchor reference between the two, making it very convenient to position popovers relative to their controls using CSS anchor positioning. See Popover anchor positioning for more details.
   */
  popovertarget?: string;
  /**
   * Specifies the action to be performed on a popover element being controlled by a control <button>.
   */
  popovertargetaction?: "toggle" | "show" | "hide";
  /**
   * The default behavior of the button
   */
  type?: "submit" | "reset" | "button";
  /**
   * Defines the value associated with the button's name when it's submitted with the form data
   */
  value?: string | number;
}

/**
 * Use the HTML <canvas> element with either the canvas scripting API or the WebGL API to draw graphics and animations.
 */
export interface HTMLCanvasAttributes extends HTMLAttributes {
  /**
   * The height of the coordinate space in CSS pixels. Defaults to 150.
   *
   * @default "150"
   */
  height?: number | `${number}`;
  /**
   * The width of the coordinate space in CSS pixels.
   *
   * @default "300"
   */
  width?: number | `${number}`;
}

/**
 * The <col> HTML element defines one or more columns in a column group represented by its parent <colgroup> element. The <col> element is only valid as a child of a <colgroup> element that has no span attribute defined.
 */
export interface HTMLColAttributes extends HTMLAttributes {
  /**
   * Specifies the number of consecutive columns the <col> element spans. The value must be a positive integer greater than zero.
   *
   * @default 1
   */
  span?: number;
}

/**
 * The <colgroup> HTML element defines a group of columns within a table.
 */
export interface HTMLColgroupAttributes extends HTMLAttributes {
  /**
   * Specifies the number of consecutive columns the <colgroup> element spans. The value must be a positive integer greater than zero
   *
   * @default 1
   */
  span?: number;
}

/**
 * The <data> HTML element links a given piece of content with a machine-readable translation. If the content is time- or date-related, the <time> element must be used
 */
export interface HTMLDataAttributes extends HTMLAttributes {
  /**
   * This attribute specifies the machine-readable translation of the content of the element.
   */
  value?: string | number;
}

/**
 * The <del> HTML element represents a range of text that has been deleted from a document. This can be used when rendering "track changes" or source code diff information, for example. The <ins> element can be used for the opposite purpose: to indicate text that has been added to the document.
 */
export interface HTMLDelAttributes extends HTMLAttributes {
  /**
   * A URI for a resource that explains the change
   */
  cite?: string;
  /**
   * This attribute indicates the time and date of the change and must be a valid date string with an optional time
   */
  datetime?: string;
}

/**
 * The <details> HTML element creates a disclosure widget in which information is visible only when the widget is toggled into an open state. A summary or label must be provided using the <summary> element.
 */
export interface HTMLDetailsAttributes extends HTMLAttributes {
  /**
   * This Boolean attribute indicates whether the details — that is, the contents of the <details> element — are currently visible
   */
  open?: boolean;
  /**
   * This attribute enables multiple <details> elements to be connected, with only one open at a time. This allows developers to easily create UI features such as accordions without scripting
   *
   * The name attribute specifies a group name — give multiple <details> elements the same name value to group them. Only one of the grouped <details> elements can be open at a time — opening one will cause another to close.
   */
  name?: string;
}

/**
 * The <dialog> HTML element represents a modal or non-modal dialog box or other interactive component, such as a dismissible alert, inspector, or subwindow.
 */
export interface HTMLDialogAttributes extends HTMLAttributes {
  /**
   * Specifies the types of user actions that can be used to close the <dialog> element. This attribute distinguishes three methods by which a dialog might be closed:
   *
   * - A light dismiss user action, in which the <dialog> is closed when the user clicks or taps outside it. This is equivalent to the "light dismiss" behavior of "auto" state popovers.
   * - A platform-specific user action, such as pressing the Esc key on desktop platforms, or a "back" or "dismiss" gesture on mobile platforms.
   * - A developer-specified mechanism such as a <button> with a click handler that invokes HTMLDialogElement.close() or a <form> submission.
   */
  closedby?: "any" | "closerequest" | "none";
  /**
   * Indicates that the dialog box is active and is available for interaction
   */
  open?: boolean;
}

/**
 * The <embed> HTML element embeds external content at the specified point in the document. This content is provided by an external application or other source of interactive content such as a browser plug-in.
 */
export interface HTMLEmbedAttributes extends HTMLAttributes {
  /**
   * The displayed height of the resource, in CSS pixels. This must be an absolute value; percentages are not allowed.
   */
  height?: number | `${number}`;
  /**
   * The URL of the resource being embedded
   */
  src?: string;
  /**
   * The MIME type to use to select the plug-in to instantiate
   */
  type?: string;
  /**
   * The displayed width of the resource, in CSS pixels. This must be an absolute value; percentages are not allowed.
   */
  width?: number | `${number}`;
}

/**
 * The <fieldset> HTML element is used to group several controls as well as labels (<label>) within a web form.
 */
export interface HTMLFieldsetAttributes extends HTMLAttributes {
  /**
   * If this Boolean attribute is set, all form controls that are descendants of the <fieldset>, are disabled, meaning they are not editable and won't be submitted along with the <form>. They won't receive any browsing events, like mouse clicks or focus-related events. By default browsers display such controls grayed out. Note that form elements inside the <legend> element won't be disabled
   */
  disabled?: boolean;
  /**
   * This attribute takes the value of the id attribute of a <form> element you want the <fieldset> to be part of, even if it is not inside the form.
   */
  form?: string;
  /**
   * The name associated with the group
   */
  name?: string;
}

/**
 * The <form> HTML element represents a document section containing interactive controls for submitting information.
 */
export interface HTMLFormAttributes extends HTMLAttributes {
  /**
   * The character encoding accepted by the server. The specification allows a single case-insensitive value of "UTF-8", reflecting the ubiquity of this encoding (historically multiple character encodings could be specified as a comma-separated or space-separated list).
   */
  "accept-charset"?: "utf-8";
  /**
   * The URL that processes the form submission. This value can be overridden by a formaction attribute on a <button>, <input type="submit">, or <input type="image"> element. This attribute is ignored when method="dialog" is set.
   */
  action?: string;
  /**
   * Indicates whether input elements can by default have their values automatically completed by the browser. autocomplete attributes on form elements override it on <form>.
   */
  autocomplete?: AutoFillBase;
  /**
   * If the value of the method attribute is post, enctype is the MIME type of the form submission
   */
  enctype?:
    | "application/x-www-form-urlencoded"
    | "multipart/form-data"
    | "text/plain";
  /**
   * The HTTP method to submit the form with.
   */
  method?:
    | "dialog"
    | "get"
    | "post";
  /**
   * The name of the form. The value must not be the empty string, and must be unique among the form elements in the forms collection that it is in, if any. The name becomes a property of the Window, Document, and document.forms objects, containing a reference to the form element
   */
  name?: string;
  /**
   * This Boolean attribute indicates that the form shouldn't be validated when submitted
   */
  novalidate?: boolean;
  /**
   * Indicates where to display the response after submitting the form
   *
   * @default "_self"
   */
  target?: "_self" | "_blank" | "_parent" | "_top" | "_unfencedTop";
  /**
   * Controls the annotations and what kinds of links the form creates. Annotations include external, nofollow, opener, noopener, and noreferrer. Link types include help, prev, next, search, and license. The rel value is a space-separated list of these enumerated values
   */
  rel?: string;
}

/**
 * The <html> HTML element represents the root (top-level element) of an HTML document, so it is also referred to as the root element. All other elements must be descendants of this element. There can be only one <html> element in a document.
 */
export interface HTMLHtmlAttributes extends HTMLAttributes {
  /**
   * Specifies the XML Namespace of the document
   *
   * @default "http://www.w3.org/1999/xhtml"
   */
  xmlns?: string;
}

/**
 * The <iframe> HTML element represents a nested browsing context, embedding another HTML page into the current one.
 */
export interface HTMLIframeAttributes extends HTMLAttributes {
  /**
   * Specifies a Permissions Policy for the <iframe>. The policy defines what features are available to the <iframe> (for example, access to the microphone, camera, battery, web-share, etc.) based on the origin of the request.
   */
  allow?: string;
  /**
   * Set to true if the <iframe> can activate fullscreen mode by calling the requestFullscreen() method.
   */
  allowfullscreen?: boolean;
  /**
   * The height of the frame in CSS pixels.
   *
   * @default 150
   */
  height?: number | `${number}`;
  /**
   * Indicates when the browser should load the iframe
   *
   * @default "eager"
   */
  loading?: "eager" | "lazy";
  /**
   * A targetable name for the embedded browsing context. This can be used in the target attribute of the <a>, <form>, or <base> elements; the formtarget attribute of the <input> or <button> elements; or the windowName parameter in the window.open() method. In addition, the name becomes a property of the Window and Document objects, containing a reference to the embedded window or the element itself.
   */
  name?: string;
  /**
   * Indicates which referrer to send when fetching the frame's resource
   */
  referrerpolicy?: ReferrerPolicy;
  /**
   * Controls the restrictions applied to the content embedded in the <iframe>.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox}
   */
  sandbox?: string;
  /**
   * The URL of the page to embed. Use a value of about:blank to embed an empty page that conforms to the same-origin policy
   */
  src?: string;
  /**
   * Inline HTML to embed, overriding the src attribute. Its content should follow the syntax of a full HTML document, which includes the doctype directive, <html>, <body> tags, etc., although most of them can be omitted, leaving only the body content. This doc will have about:srcdoc as its location
   */
  srcdoc?: string;
  /**
   * The width of the frame in CSS pixels.
   *
   * @default 300
   */
  width?: number | `${number}`;
}

/**
 * The <img> HTML element embeds an image into the document
 */
export interface HTMLImgAttributes extends HTMLAttributes {
  /**
   * Defines text that can replace the image in the page.
   */
  alt?: string;
  /**
   * Indicates if the fetching of the image must be done using a CORS request. Image data from a CORS-enabled image returned from a CORS request can be reused in the <canvas> element without being marked "tainted".
   */
  crossorigin?: "anonymous" | "use-credentials";
  /**
   * This attribute provides a hint to the browser as to whether it should perform image decoding along with rendering the other DOM content in a single presentation step that looks more "correct" (sync), or render and present the other DOM content first and then decode the image and present it later (async). In practice, async means that the next paint does not wait for the image to decode.
   */
  decoding?: "async" | "auto" | "sync";
  /**
   * Marks the image for observation by the PerformanceElementTiming API.
   */
  elementtiming?: string;
  /**
   * Provides a hint of the relative priority to use when fetching the image
   */
  fetchpriority?: "auto" | "high" | "low";
  /**
   * The intrinsic height of the image, in pixels. Must be an integer without a unit
   */
  height?: number | `${number}`;
  /**
   * This Boolean attribute indicates that the image is part of a server-side map. If so, the coordinates where the user clicked on the image are sent to the server.
   */
  ismap?: boolean;
  /**
   * Indicates how the browser should load the image
   */
  loading?: "eager" | "lazy";
  /**
   * A string indicating which referrer to use when fetching the resource
   */
  referrerpolicy?: ReferrerPolicy;
  /**
   * One or more values separated by commas, which can be source sizes or the auto keyword
   */
  sizes?: string;
  /**
   * The image URL. Mandatory for the <img> element
   */
  src?: string;
  /**
   * One or more strings separated by commas, indicating possible image sources for the user agent to use
   */
  srcset?: string;
  /**
   * The partial URL (starting with #) of an image map associated with the element
   */
  usemap?: string;
  /**
   * The intrinsic width of the image in pixels
   */
  width?: number | `${number}`;
}

/**
 * Available input types
 */
export type HTMLInputTypeAttribute =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

/**
 * The `autofill` detail tokens
 */
export type FullAutoFill =
  | AutoFill
  | "bday"
  | `${OptionalPrefixToken<AutoFillAddressKind>}${"cc-additional-name"}`
  | "nickname"
  | "language"
  | "organization-title"
  | "photo"
  | "sex"
  | "url";

/**
 * The <input> HTML element is used to create interactive controls for web-based forms in order to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent
 */
export interface HTMLInputAttributes extends HTMLAttributes {
  /**
   * Valid for the file input type only, the accept attribute defines which file types are selectable in a file upload control.
   */
  accept?: string;
  /**
   * Valid for the color input type only, the alpha attribute provides the end user with the ability to set the opacity of the color being selected.
   */
  alpha?: string;
  /**
   * Valid for the image button only, the alt attribute provides alternative text for the image, displaying the value of the attribute if the image src is missing or otherwise fails to load
   */
  alt?: string;
  /**
   * The autocomplete attribute takes as its value a space-separated string that describes what, if any, type of autocomplete functionality the input should provide
   */
  autocomplete?: FullAutoFill;
  /**
   * Introduced in the HTML Media Capture specification and valid for the file input type only, the capture attribute defines which media—microphone, video, or camera—should be used to capture a new file for upload with file upload control in supporting scenarios.
   */
  capture?: boolean | "user" | "environment"; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
  /**
   * Valid for both radio and checkbox types, checked is a Boolean attribute. If present on a radio type, it indicates that the radio button is the currently selected one in the group of same-named radio buttons. If present on a checkbox type, it indicates that the checkbox is checked by default (when the page loads). It does not indicate whether this checkbox is currently checked: if the checkbox's state is changed, this content attribute does not reflect the change
   */
  checked?: boolean;
  /**
   * Valid for hidden, text, search, url, tel, and email input types, the dirname attribute enables the submission of the directionality of the element. When included, the form control will submit with two name/value pairs: the first being the name and value, and the second being the value of the dirname attribute as the name, with a value of ltr or rtl as set by the browser
   */
  dirname?: "ltr" | "rtl";
  /**
   * A Boolean attribute which, if present, indicates that the user should not be able to interact with the input.
   */
  disabled?: boolean;
  /**
   * A string specifying the <form> element with which the input is associated (that is, its form owner). This string's value, if present, must match the id of a <form> element in the same document. If this attribute isn't specified, the <input> element is associated with the nearest containing form, if any.
   */
  form?: string;
  /**
   * Valid for the image and submit input types only. A string indicating the URL to which to submit the data.
   */
  formaction?: string;
  /**
   * Valid for the image and submit input types only. A string that identifies the encoding method to use when submitting the form data to the server
   */
  formenctype?:
    | "application/x-www-form-urlencoded"
    | "multipart/form-data"
    | "text/plain";
  /**
   * Valid for the image and submit input types only. A string indicating the HTTP method to use when submitting the form's data; this value overrides any method attribute given on the owning form.
   */
  formmethod?:
    | "dialog"
    | "get"
    | "post";
  /**
   * Valid for the image and submit input types only. A Boolean attribute which, if present, specifies that the form should not be validated before submission to the server
   */
  formnovalidate?: boolean;
  /**
   * Valid for the image and submit input types only. A string which specifies a name or keyword that indicates where to display the response received after submitting the form
   */
  formtarget?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
  /**
   * Valid for the image input button only. A number specifying the height, in CSS pixels, at which to draw the image specified by the src attribute.
   */
  height?: number | `${number}`;
  /**
   * The value given to the list attribute should be the id of a <datalist> element located in the same document. The <datalist> provides a list of predefined values to suggest to the user for this input. Any values in the list that are not compatible with the type are not included in the suggested options. The values provided are suggestions, not requirements: users can select from this predefined list or provide a different value
   */
  list?: string;
  /**
   * Valid for date, month, week, time, datetime-local, number, and range, it defines the greatest value in the range of permitted values.
   */
  max?: number | string;
  /**
   * Valid for text, search, url, tel, email, and password, it defines the maximum string length (measured in UTF-16 code units) that the user can enter into the field
   */
  maxlength?: number;
  /**
   * Valid for date, month, week, time, datetime-local, number, and range, it defines the most negative value in the range of permitted values
   */
  min?: number | string;
  /**
   * Valid for text, search, url, tel, email, and password, it defines the minimum string length (measured in UTF-16 code units) that the user can enter into the entry field
   */
  minlength?: number;
  /**
   * The Boolean multiple attribute, if set, means the user can enter comma separated email addresses in the email widget or can choose more than one file with the file input
   */
  multiple?: boolean;
  /**
   * A string specifying a name for the input control. This name is submitted along with the control's value when the form data is submitted.
   */
  name?: string;
  /**
   * Valid for text, search, url, tel, email, and password, the pattern attribute is used to compile a regular expression that the input's value must match in order for the value to pass constraint validation.
   */
  pattern?: string;
  /**
   * Valid for text, search, url, tel, email, password, and number, the placeholder attribute provides a brief hint to the user as to what kind of information is expected in the field
   */
  placeholder?: string;
  /**
   * A Boolean attribute which, if present, indicates that the user should not be able to edit the value of the input. The readonly attribute is supported by the text, search, url, tel, email, date, month, week, time, datetime-local, number, and password input types
   */
  readonly?: boolean;
  /**
   * A Boolean attribute which, if present, indicates that the user must specify a value for the input before the owning form can be submitted.
   */
  required?: boolean;
  /**
   * Valid for email, password, tel, url, and text, the size attribute specifies how much of the input is shown. Basically creates the same result as setting the CSS width property with a few specialties. The actual unit of the value depends on the input type. For password and text, it is a number of characters (or em units) with a default value of 20, and for others, it is pixels (or px units). CSS width takes precedence over the size attribute.
   */
  size?: number;
  /**
   * Valid for the image input button only, the src is string specifying the URL of the image file to display to represent the graphical submit button
   */
  src?: string;
  /**
   * Valid for date, month, week, time, datetime-local, number, and range, the step attribute is a number that specifies the granularity that the value must adhere to
   */
  step?: number | `${number}`;
  /**
   * A string specifying the type of control to render
   */
  type?: HTMLInputTypeAttribute;
  /**
   * The input control's value. When specified in the HTML, this is the initial value, and from then on it can be altered or retrieved at any time using JavaScript to access the respective HTMLInputElement object's value property. The value attribute is always optional, though should be considered mandatory for checkbox, radio, and hidden.
   */
  value?: any;
  /**
   * Valid for the image input button only, the width is the width of the image file to display to represent the graphical submit button.
   */
  width?: number | string;
  /**
   * (Non-Standard) A Boolean indicating whether to only allow the user to choose a directory (or directories, if multiple is also present)
   */
  webkitdirectory?: boolean;
}

/**
 * The <ins> HTML element represents a range of text that has been added to a document
 */
export interface HTMLInsAttributes extends HTMLAttributes {
  /**
   * This attribute defines the URI of a resource that explains the change, such as a link to  a ticket in a troubleshooting system.
   */
  cite?: string;
  /**
   * This attribute indicates the time and date of the change and must be a valid date with an optional time string.
   */
  datetime?: string;
}

/**
 * The <label> HTML element represents a caption for an item in a user interface.
 */
export interface HTMLLabelAttributes extends HTMLAttributes {
  /**
   * The value is the id of the labelable form control in the same document, associating the <label> with that form control. Note that its JavaScript reflection property is htmlFor.
   */
  for?: string;
}

/**
 * The <li> HTML element is used to represent an item in a list. It must be contained in a parent element: an ordered list (<ol>), an unordered list (<ul>), or a menu (<menu>).
 */
export interface HTMLLiAttributes extends HTMLAttributes {
  /**
   * This integer attribute indicates the current ordinal value of the list item as defined by the <ol> element. The only allowed value for this attribute is a number, even if the list is displayed with Roman numerals or letters. List items that follow this one continue numbering from the value set
   */
  value?: number | `${number}`;
}

/**
 * The <link> HTML element specifies relationships between the current document and an external resource. This element is most commonly used to link to stylesheets, but is also used to establish site icons (both "favicon" style icons and icons for the home screen and apps on mobile devices) among other things
 */
export interface HTMLLinkAttributes extends HTMLAttributes {
  /**
   * This attribute is required when rel="preload" has been set on the <link> element, optional when rel="modulepreload" has been set, and otherwise should not be used
   */
  as?:
    | "audio"
    | "document"
    | "embed"
    | "fetch"
    | "font"
    | "image"
    | "object"
    | "script"
    | "style"
    | "track"
    | "video"
    | "worker";
  /**
   * This attribute explicitly indicates that certain operations should be blocked until specific conditions are met. It must only be used when the rel attribute contains the expect or stylesheet keywords. With rel="expect", it indicates that operations should be blocked until a specific DOM node has been parsed. With rel="stylesheet", it indicates that operations should be blocked until an external stylesheet and its critical subresources have been fetched and applied to the document. The operations that are to be blocked must be a space-separated list of blocking tokens listed below
   */
  blocking?: "render";
  /**
   * This enumerated attribute indicates whether CORS must be used when fetching the resource
   */
  crossorigin?: "anonymous" | "use-credentials";
  /**
   * For rel="stylesheet" only, the disabled Boolean attribute indicates whether the described stylesheet should be loaded and applied to the document. If disabled is specified in the HTML when it is loaded, the stylesheet will not be loaded during page load. Instead, the stylesheet will be loaded on-demand, if and when the disabled attribute is changed to false or removed
   */
  disabled?: boolean;
  /**
   * Provides a hint of the relative priority to use when fetching a resource of a particular type.
   */
  fetchpriority?: "high" | "low" | "auto";
  /**
   * This attribute specifies the URL of the linked resource. A URL can be absolute or relative.
   */
  href?: string;
  /**
   * This attribute indicates the language of the linked resource. It is purely advisory. Values should be valid BCP 47 language tags. Use this attribute only if the href attribute is present
   */
  hreflang?: string;
  /**
   * For rel="preload" and as="image" only, the imagesizes attribute has similar syntax and semantics as the sizes attribute that indicates to preload the appropriate resource used by an img element with corresponding values for its srcset and sizes attributes
   */
  imagesizes?: string;
  /**
   * For rel="preload" and as="image" only, the imagesrcset attribute has similar syntax and semantics as the srcset attribute that indicates to preload the appropriate resource used by an img element with corresponding values for its srcset and sizes attributes.
   */
  imagesrcset?: string;
  /**
   * Contains inline metadata — a base64-encoded cryptographic hash of the resource (file) you're telling the browser to fetch. The browser can use this to verify that the fetched resource has been delivered without unexpected manipulation. The attribute must only be specified when the rel attribute is specified to stylesheet, preload, or modulepreload
   */
  integrity?: string;
  /**
   * This attribute specifies the media that the linked resource applies to. Its value must be a media type / media query. This attribute is mainly useful when linking to external stylesheets — it allows the user agent to pick the best adapted one for the device it runs on
   */
  media?: string;
  /**
   * A string indicating which referrer to use when fetching the resource
   */
  referrerpolicy?: ReferrerPolicy;
  /**
   * This attribute names a relationship of the linked document to the current document.
   */
  rel?: string;
  /**
   * This attribute defines the sizes of the icons for visual media contained in the resource. It must be present only if the rel contains a value of icon or a non-standard type such as Apple's apple-touch-icon.
   */
  sizes?: string;
  /**
   * This attribute is used to define the type of the content linked to. The value of the attribute should be a MIME type such as text/html, text/css, and so on. The common use of this attribute is to define the type of stylesheet being referenced (such as text/css), but given that CSS is the only stylesheet language used on the web, not only is it possible to omit the type attribute, but is actually now recommended practice.
   */
  type?: string;
}

/**
 * The <map> HTML element is used with <area> elements to define an image map (a clickable link area).
 */
export interface HTMLMapAttributes extends HTMLAttributes {
  /**
   * The name attribute gives the map a name so that it can be referenced
   */
  name?: string;
}

/**
 * Shared by
 *    <audio>
 *    <video>
 *
 * @internal
 */
interface HTMLMediaAttributes extends HTMLAttributes {
  /**
   * A Boolean attribute: if specified, the audio will automatically begin playback as soon as it can do so, without waiting for the entire audio file to finish downloading.
   */
  autoplay?: boolean;
  /**
   * If this attribute is present, the browser will offer controls to allow the user to control audio playback, including volume, seeking, and pause/resume playback.
   */
  controls?: boolean;
  /**
   * The controlslist attribute, when specified, helps the browser select what controls to show for the audio element whenever the browser shows its own set of controls (that is, when the controls attribute is specified).
   */
  controlslist?: "nodownload" | "nofullscreen" | "noremoteplayback";
  /**
   * This enumerated attribute indicates whether to use CORS to fetch the related audio file
   */
  crossorigin?: "anonymous" | "use-credentials";
  /**
   * A Boolean attribute used to disable the capability of remote playback in devices that are attached using wired (HDMI, DVI, etc.) and wireless technologies (Miracast, Chromecast, DLNA, AirPlay, etc.).
   */
  disableremoteplayback?: boolean;
  /**
   * A Boolean attribute: if specified, the audio player will automatically seek back to the start upon reaching the end of the audio.
   */
  loop?: boolean;
  /**
   * A Boolean attribute that indicates whether the audio will be initially silenced. Its default value is false.
   */
  muted?: boolean;
  /**
   * This enumerated attribute is intended to provide a hint to the browser about what the author thinks will lead to the best user experience.
   */
  preload?: "none" | "metadata" | "auto";
  /**
   * The URL of the audio to embed.
   */
  src?: string;
}

/**
 * The <meta> HTML element represents metadata that cannot be represented by other meta-related elements, such as <base>, <link>, <script>, <style>, or <title>.
 */
export interface HTMLMetaAttributes extends HTMLAttributes {
  /**
   * This attribute declares the document's character encoding. If the attribute is present, its value must be an ASCII case-insensitive match for the string "utf-8", because UTF-8 is the only valid encoding for HTML5 documents
   */
  charset?: "utf-8";
  /**
   * This attribute contains the value for the http-equiv or name attribute, depending on which is used.
   */
  content?: string;
  /**
   * Defines a pragma directive, which are instructions for the browser for processing the document
   */
  "http-equiv"?:
    | "accept-ch"
    | "content-security-policy"
    | "content-type"
    | "default-style"
    | "refresh"
    | "x-ua-compatible";
  /**
   * The media attribute defines which media the theme color defined in the content attribute should be applied to. Its value is a media query, which defaults to all if the attribute is missing. This attribute is only relevant when the element's name attribute is set to theme-color. Otherwise, it has no effect, and should not be included.
   */
  media?: string;
  /**
   * The name and content attributes can be used together to provide document metadata in terms of name-value pairs, with the name attribute giving the metadata name, and the content attribute giving the value.
   */
  name?: string;
}

/**
 * The <meter> HTML element represents either a scalar value within a known range or a fractional value.
 */
export interface HTMLMeterAttributes extends HTMLAttributes {
  /**
   * The lower numeric bound of the high end of the measured range. This must be less than the maximum value (max attribute), and it also must be greater than the low value and minimum value (low attribute and min attribute, respectively), if any are specified. If unspecified, or if greater than the maximum value, the high value is equal to the maximum value.
   */
  high?: number | `${number}`;
  /**
   * The upper numeric bound of the low end of the measured range. This must be greater than the minimum value (min attribute), and it also must be less than the high value and maximum value (high attribute and max attribute, respectively), if any are specified. If unspecified, or if less than the minimum value, the low value is equal to the minimum value.
   */
  low?: number | `${number}`;
  /**
   * The upper numeric bound of the measured range. This must be greater than the minimum value (min attribute), if specified
   *
   * @default 1
   */
  max?: number | `${number}`;
  /**
   * The lower numeric bound of the measured range. This must be less than the maximum value (max attribute), if specified
   *
   * @default 0
   */
  min?: number | `${number}`;
  /**
   * This attribute indicates the optimal numeric value. It must be within the range (as defined by the min attribute and max attribute). When used with the low attribute and high attribute, it gives an indication where along the range is considered preferable. For example, if it is between the min attribute and the low attribute, then the lower range is considered preferred. The browser may color the meter's bar differently depending on whether the value is less than or equal to the optimum value.
   */
  optimum?: number | `${number}`;
  /**
   * The current numeric value. This must be between the minimum and maximum values (min attribute and max attribute) if they are specified. If unspecified or malformed, the value is 0. If specified, but not within the range given by the min attribute and max attribute, the value is equal to the nearest end of the range.
   */
  value?: number | `${number}`;
}

/**
 * The <object> HTML element represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin
 */
export interface HTMLObjectAttributes extends HTMLAttributes {
  /**
   * The address of the resource as a valid URL. At least one of data and type must be defined.
   */
  data?: string;
  /**
   * The form element, if any, that the object element is associated with (its form owner). The value of the attribute must be an ID of a <form> element in the same document
   */
  form?: string;
  /**
   * The height of the displayed resource, in CSS pixels
   */
  height?: number | `${number}`;
  /**
   * The name of a valid browsing context. The name becomes a property of the Window and Document objects, containing a reference to the embedded window or the element itself.
   */
  name?: string;
  /**
   * The content type of the resource specified by data. At least one of data and type must be defined.
   */
  type?: string;
  /**
   * The width of the display resource, in CSS pixels.
   */
  width?: number | `${number}`;
}

/**
 * The <ol> HTML element represents an ordered list of items — typically rendered as a numbered list
 */
export interface HTMLOlAttributes extends HTMLAttributes {
  /**
   * This Boolean attribute specifies that the list's items are in reverse order. Items will be numbered from high to low.
   */
  reversed?: boolean;
  /**
   * An integer to start counting from for the list items. Always an Arabic numeral (1, 2, 3, etc.), even when the numbering type is letters or Roman numerals. For example, to start numbering elements from the letter "d" or the Roman numeral "iv," use start="4".
   */
  start?: number | `${number}`;
  /**
   * Sets the numbering type
   */
  type?: "1" | "a" | "A" | "i" | "I";
}

/**
 * The <optgroup> HTML element creates a grouping of options within a <select> element.
 *
 * In customizable <select> elements, the <legend> element is allowed as a child of <optgroup>, to provide a label that is easy to target and style. This replaces any text set in the <optgroup> element's label attribute, and it has the same semantics.
 */
export interface HTMLOptgroupAttributes extends HTMLAttributes {
  /**
   * If this Boolean attribute is set, none of the items in this option group is selectable
   */
  disabled?: boolean;
  /**
   * The name of the group of options, which the browser can use when labeling the options in the user interface. This attribute is mandatory if this element is used
   */
  label?: string;
}
/**
 * The <option> HTML element is used to define an item contained in a <select>, an <optgroup>, or a <datalist> element. As such, <option> can represent menu items in popups and other lists of items in an HTML document.
 */
export interface HTMLOptionAttributes extends HTMLAttributes {
  /**
   * If this Boolean attribute is set, this option is not checkable
   */
  disabled?: boolean;
  /**
   * This attribute is text for the label indicating the meaning of the option. If the label attribute isn't defined, its value is that of the element text content.
   */
  label?: string;
  /**
   * If present, this Boolean attribute indicates that the option is initially selected
   */
  selected?: boolean;
  /**
   * The content of this attribute represents the value to be submitted with the form, should this option be selected. If this attribute is omitted, the value is taken from the text content of the option element.
   */
  value?: any;
}

/**
 * The <output> HTML element is a container element into which a site or app can inject the results of a calculation or the outcome of a user action.
 */
export interface HTMLOutputAttributes extends HTMLAttributes {
  /**
   * A space-separated list of other elements' ids, indicating that those elements contributed input values to (or otherwise affected) the calculation.
   */
  for?: string;
  /**
   * The <form> element to associate the output with (its form owner). The value of this attribute must be the id of a <form> in the same document. (If this attribute is not set, the <output> is associated with its ancestor <form> element, if any.)
   *
   * This attribute lets you associate <output> elements to <form>s anywhere in the document, not just inside a <form>. It can also override an ancestor <form> element. The <output> element's name and content are not submitted when the form is submitted
   */
  form?: string;
  /**
   * The element's name. Used in the `form.elements` API.
   */
  name?: string;
}

/**
 * The <progress> HTML element displays an indicator showing the completion progress of a task, typically displayed as a progress bar.
 */
export interface HTMLProgressAttributes extends HTMLAttributes {
  /**
   * This attribute describes how much work the task indicated by the progress element requires. The max attribute, if present, must have a value greater than 0 and be a valid floating point number
   *
   * @default 1
   */
  max?: number | `${number}`;
  /**
   * This attribute specifies how much of the task that has been completed. It must be a valid floating point number between 0 and max, or between 0 and 1 if max is omitted. If there is no value attribute, the progress bar is indeterminate; this indicates that an activity is ongoing with no indication of how long it is expected to take.
   */
  value?: string | number;
}

/**
 * The <q> HTML element indicates that the enclosed text is a short inline quotation. Most modern browsers implement this by surrounding the text in quotation marks. This element is intended for short quotations that don't require paragraph breaks; for long quotations use the <blockquote> element
 */
export interface HTMLQuoteAttributes extends HTMLAttributes {
  /**
   * The value of this attribute is a URL that designates a source document or message for the information quoted. This attribute is intended to point to information explaining the context or the reference for the quote.
   */
  cite?: string;
}

/**
 * The <script> HTML element is used to embed executable code or data; this is typically used to embed or refer to JavaScript code. The <script> element can also be used with other languages, such as WebGL's GLSL shader programming language and JSON
 */
export interface HTMLScriptAttributes extends HTMLAttributes {
  /**
   * For classic scripts, if the async attribute is present, then the classic script will be fetched in parallel to parsing and evaluated as soon as it is available.
   *
   * For module scripts, if the async attribute is present then the scripts and all their dependencies will be fetched in parallel to parsing and evaluated as soon as they are available.
   */
  async?: boolean;
  /**
   * This attribute explicitly indicates that certain operations should be blocked until the script has executed
   */
  blocking?: "render";
  /**
   * Normal script elements pass minimal information to the window.onerror for scripts which do not pass the standard CORS checks. To allow error logging for sites which use a separate domain for static media, use this attribute.
   */
  crossorigin?: "anonymous" | "use-credentials";
  /**
   * This Boolean attribute is set to indicate to a browser that the script is meant to be executed after the document has been parsed, but before firing DOMContentLoaded event.
   */
  defer?: boolean;
  /**
   * Provides a hint of the relative priority to use when fetching an external script.
   */
  fetchpriority?: "auto" | "high" | "low";
  /**
   * This attribute contains inline metadata that a user agent can use to verify that a fetched resource has been delivered without unexpected manipulation. The attribute must not be specified when the src attribute is absent
   */
  integrity?: string;
  /**
   * This Boolean attribute is set to indicate that the script should not be executed in browsers that support ES modules — in effect, this can be used to serve fallback scripts to older browsers that do not support modular JavaScript code
   */
  nomodule?: boolean;
  /**
   * A cryptographic nonce (number used once) to allow scripts in a script-src Content-Security-Policy. The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource's policy is otherwise trivial
   */
  nonce?: string;
  /**
   * Indicates which referrer to send when fetching the script, or resources fetched by the script
   */
  referrerpolicy?: ReferrerPolicy;
  /**
   * This attribute specifies the URI of an external script; this can be used as an alternative to embedding a script directly within a document
   */
  src?: string;
  /**
   * This attribute indicates the type of script represented
   */
  type?: "importmap" | "module" | "speculationrules" | (string & {});
}

/**
 * The <select> HTML element represents a control that provides a menu of options.
 */
export interface HTMLSelectAttributes extends HTMLAttributes {
  /**
   * A string providing a hint for a user agent's autocomplete feature
   */
  autocomplete?: FullAutoFill;
  /**
   * This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example <fieldset>; if there is no containing element with the disabled attribute set, then the control is enabled
   */
  disabled?: boolean;
  /**
   * The <form> element to associate the <select> with (its form owner). The value of this attribute must be the id of a <form> in the same document
   */
  form?: string;
  /**
   * This Boolean attribute indicates that multiple options can be selected in the list. If it is not specified, then only one option can be selected at a time. When `multiple` is specified, most browsers will show a scrolling list box instead of a single line dropdown. Multiple selected options are submitted using the URLSearchParams array convention, i.e., `name=value1&name=value2`
   */
  multiple?: boolean;
  /**
   * This attribute is used to specify the name of the control.
   */
  name?: string;
  /**
   * A Boolean attribute indicating that an option with a non-empty string value must be selected.
   */
  required?: boolean;
  /**
   * If the control is presented as a scrolling list box (e.g., when multiple is specified), this attribute represents the number of rows in the list that should be visible at one time. Browsers are not required to present a select element as a scrolled list box.
   *
   * @default 0
   */
  size?: number;
}

/**
 * The <slot> HTML element—part of the Web Components technology suite—is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.
 */
export interface HTMLSlotAttributes extends HTMLAttributes {
  /**
   * The slot's name. When the slot's containing component gets rendered, the slot is rendered with the custom element's child that has a matching slot attribute
   */
  name?: string;
}

/**
 * The <source> HTML element specifies one or more media resources for the <picture>, <audio>, and <video> elements
 */
export interface HTMLSourceAttributes extends HTMLAttributes {
  /**
   * Specifies the intrinsic height of the image in pixels. Allowed if the parent of <source> is a <picture>. Not allowed if the parent is <audio> or <video>.
   */
  height?: number | `${number}`;
  /**
   * Specifies the media query for the resource's intended media.
   */
  media?: string;
  /**
   * Specifies the URL of the media resource. Required if the parent of <source> is <audio> or <video>. Not allowed if the parent is <picture>.
   */
  src?: string;
  /**
   * Specifies a comma-separated list of one or more image URLs and their descriptors. Required if the parent of <source> is <picture>. Not allowed if the parent is <audio> or <video>.
   */
  srcset?: string;
  /**
   * Specifies a list of source sizes that describe the final rendered width of the image. Allowed if the parent of <source> is <picture>. Not allowed if the parent is <audio> or <video>.
   */
  sizes?: string;
  /**
   * Specifies the MIME media type of the image or other media type, optionally including a codecs parameter.
   */
  type?: string;
  /**
   * Specifies the intrinsic width of the image in pixels. Allowed if the parent of <source> is a <picture>. Not allowed if the parent is <audio> or <video>.
   */
  width?: number | `${number}`;
}

/**
 * The <style> HTML element contains style information for a document, or part of a document. It contains CSS, which is applied to the contents of the document containing the <style> element
 */
export interface HTMLStyleAttributes extends HTMLAttributes {
  /**
   * This attribute explicitly indicates that certain operations should be blocked on the fetching of critical subresources and the application of the stylesheet to the document
   */
  blocking?: "render";
  /**
   * This attribute defines which media the style should be applied to. Its value is a media query
   *
   * @default "all"
   */
  media?: string;
  /**
   * A cryptographic nonce (number used once) used to allow inline styles in a style-src Content-Security-Policy. The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource's policy is otherwise trivial.
   */
  nonce?: string;
  /**
   * This attribute specifies alternative style sheet sets
   */
  title?: string;
}

/**
 * The <td> HTML element defines a cell of a table that contains data and may be used as a child of the <tr> element
 */
export interface HTMLTdAttributes extends HTMLAttributes {
  /**
   * Contains a non-negative integer value that indicates how many columns the data cell spans or extends.
   *
   * @default 1
   */
  colspan?: number;
  /**
   * Contains a list of space-separated strings, each corresponding to the id attribute of the <th> elements that provide headings for this table cell
   */
  headers?: string;
  /**
   * Contains a non-negative integer value that indicates for how many rows the data cell spans or extends
   *
   * @default 1
   */
  rowspan?: number;
}

/**
 * The <template> HTML element serves as a mechanism for holding HTML fragments, which can either be used later via JavaScript or generated immediately into shadow DOM
 */
export interface HTMLTemplateAttributes extends HTMLAttributes {
  /**
   * Creates a shadow root for the parent element. It is a declarative version of the `Element.attachShadow()` method and accepts the same enumerated values
   */
  shadowrootmode?: "open" | "closed";
  /**
   * Sets the value of the clonable property of a ShadowRoot created using this element to true. If set, a clone of the shadow host (the parent element of this <template>) created with `Node.cloneNode()` or `Document.importNode()` will include a shadow root in the copy
   */
  shadowrootclonable?: boolean;
  /**
   * Sets the value of the delegatesFocus property of a ShadowRoot created using this element to true. If this is set and a non-focusable element in the shadow tree is selected, then focus is delegated to the first focusable element in the tree.
   *
   * @default false
   */
  shadowrootdelegatesfocus?: boolean;
  /**
   * Sets the value of the serializable property of a ShadowRoot created using this element to true. If set, the shadow root may be serialized by calling the `Element.getHTML()` or `ShadowRoot.getHTML()` methods with the options.serializableShadowRoots parameter set true.
   *
   * @default false
   */
  shadowrootserializable?: boolean;
}

/**
 * The <textarea> HTML element represents a multi-line plain-text editing control, useful when you want to allow users to enter a sizeable amount of free-form text, for example a comment on a review or feedback form.
 */
export interface HTMLTextareaAttributes extends HTMLAttributes {
  /**
   * Controls whether entered text can be automatically completed by the browser. Possible values are:
   */
  autocomplete?: FullAutoFill;
  /**
   * The visible width of the text control, in average character widths. If it is specified, it must be a positive integer
   *
   * @default 20
   */
  cols?: number;
  /**
   * This attribute is used to indicate the text directionality of the element contents
   */
  dirname?: "ltr" | "rtl";
  /**
   * This Boolean attribute indicates that the user cannot interact with the control. If this attribute is not specified, the control inherits its setting from the containing element, for example <fieldset>; if there is no containing element when the disabled attribute is set, the control is enabled
   */
  disabled?: boolean;
  /**
   * The form element that the <textarea> element is associated with (its "form owner"). The value of the attribute must be the id of a form element in the same document
   */
  form?: string;
  /**
   * The maximum string length (measured in UTF-16 code units) that the user can enter. If this value isn't specified, the user can enter an unlimited number of characters.
   */
  maxlength?: number;
  /**
   * The minimum string length (measured in UTF-16 code units) required that the user should enter.
   */
  minlength?: number;
  /**
   * The name of the control.
   */
  name?: string;
  /**
   * A hint to the user of what can be entered in the control. Carriage returns or line-feeds within the placeholder text must be treated as line breaks when rendering the hint
   */
  placeholder?: string;
  /**
   * This Boolean attribute indicates that the user cannot modify the value of the control. Unlike the disabled attribute, the readonly attribute does not prevent the user from clicking or selecting in the control. The value of a read-only control is still submitted with the form
   */
  readonly?: boolean;
  /**
   * This attribute specifies that the user must fill in a value before submitting a form.
   */
  required?: boolean;
  /**
   * The number of visible text lines for the control. If it is specified, it must be a positive integer
   *
   * @default 2
   */
  rows?: number;
  /**
   * Indicates how the control should wrap the value for form submission. Possible values are:
   *
   * - `hard`: The browser automatically inserts line breaks (CR+LF) so that each line is no longer than the width of the control; the cols attribute must be specified for this to take effect
   * - `soft`: The browser ensures that all line breaks in the entered value are a CR+LF pair, but no additional line breaks are added to the value.
   */
  wrap?: "hard" | "soft";
}

/**
 * The <th> HTML element defines a cell as the header of a group of table cells and may be used as a child of the <tr> element. The exact nature of this group is defined by the scope and headers attributes.
 */
export interface HTMLThAttributes extends HTMLAttributes {
  /**
   * A short, abbreviated description of the header cell's content provided as an alternative label to use for the header cell when referencing the cell in other contexts. Some user-agents, such as screen readers, may present this description before the content itself.
   */
  abbr?: string;
  /**
   * A non-negative integer value indicating how many columns the header cell spans or extends
   *
   * @default 1
   */
  colspan?: number;
  /**
   * A list of space-separated strings corresponding to the id attributes of the <th> elements that provide the headers for this header cell.
   */
  headers?: string;
  /**
   * A non-negative integer value indicating how many rows the header cell spans or extends
   *
   * @default 1
   */
  rowspan?: number;
  /**
   * Defines the cells that the header (defined in the <th>) element relates to.
   *
   * - `row`: the header relates to all cells of the row it belongs to;
   * - `col`: the header relates to all cells of the column it belongs to;
   * - `rowgroup`: the header belongs to a rowgroup and relates to all of its cells;
   * - `colgroup`: the header belongs to a colgroup and relates to all of its cells.
   */
  scope?: "col" | "colgroup" | "row" | "rowgroup";
}

/**
 * The <time> HTML element represents a specific period in time. It may include the datetime attribute to translate dates into machine-readable format, allowing for better search engine results or custom features such as reminders.
 */
export interface HTMLTimeAttributes extends HTMLAttributes {
  /**
   * This attribute indicates the time and/or date of the element
   */
  datetime?: string;
}

/**
 * The <track> HTML element is used as a child of the media elements, <audio> and <video>. Each track element lets you specify a timed text track (or time-based data) that can be displayed in parallel with the media element, for example to overlay subtitles or closed captions on top of a video or alongside audio tracks.
 */
export interface HTMLTrackAttributes extends HTMLAttributes {
  /**
   * This attribute indicates that the track should be enabled unless the user's preferences indicate that another track is more appropriate. This may only be used on one track element per media element.
   */
  default?: boolean;
  /**
   * How the text track is meant to be used. If omitted the default kind is subtitles. If the attribute contains an invalid value, it will use metadata
   */
  kind?:
    | "captions"
    | "chapters"
    | "descriptions"
    | "metadata"
    | "subtitles";
  /**
   * A user-readable title of the text track which is used by the browser when listing available text tracks.
   */
  label?: string;
  /**
   * Address of the track (.vtt file). Must be a valid URL. This attribute must be specified and its URL value must have the same origin as the document — unless the <audio> or <video> parent element of the track element has a crossorigin attribute
   */
  src?: string;
  /**
   * Language of the track text data. It must be a valid BCP 47 language tag. If the `kind` attribute is set to subtitles, then `srclang` must be defined.
   */
  srclang?: string;
}

/**
 * The <video> HTML element embeds a media player which supports video playback into the document. You can use <video> for audio content as well, but the <audio> element may provide a more appropriate user experience
 */
export interface HTMLVideoAttributes extends HTMLMediaAttributes {
  /**
   * Prevents the browser from suggesting a Picture-in-Picture context menu or to request Picture-in-Picture automatically in some cases.
   */
  disablepictureinpicture?: boolean;
  /**
   * The height of the video's display area, in CSS pixels
   */
  height?: number | `${number}`;
  /**
   * A Boolean attribute indicating that the video is to be played "inline", that is, within the element's playback area. Note that the absence of this attribute does not imply that the video will always be played in fullscreen.
   */
  playsinline?: boolean;
  /**
   * A URL for an image to be shown while the video is downloading. If this attribute isn't specified, nothing is displayed until the first frame is available, then the first frame is shown as the poster frame.
   */
  poster?: string;
  /**
   * The width of the video's display area, in CSS pixels
   */
  width?: number | `${number}`;
}

/**
 * Global SVG Attributes
 *
 * @internal
 */
interface SVGAttributes {
  /**
   * Assigns a class name or set of class names to an element
   */
  class?: string;
  /**
   * The color attribute is used to provide a potential indirect value, currentColor, for the fill, stroke, stop-color, flood-color, and lighting-color attributes
   */
  color?: string;
  /**
   * The data-* SVG attributes are called custom data attributes. They let SVG markup and its resulting DOM share information that standard attributes can't, usually for scripting purposes. Their custom data are available via the SVGElement interface of the element the attributes belong to, with the `SVGElement.dataset` property.
   */
  [key: `data-${string}`]: any;
  /**
   * The id attribute assigns a unique name to an element.
   */
  id?: string;
  /**
   * The lang attribute specifies the primary language used in contents and attributes containing text content of particular elements.
   */
  lang?: string;
  /**
   * The style attribute allows to style an element using CSS declarations. It functions identically to the style attribute in HTML.
   */
  style?: string;
  /**
   * The tabindex attribute allows you to control whether an element is focusable and to define the relative order of the element for the purposes of sequential focus navigation
   */
  tabindex?: number | string;
  /**
   * The transform attribute defines a list of transform definitions that are applied to an element and the element's children
   */
  transform?: string;
  /**
   * The transform-origin SVG attribute sets the origin for an item's transformations.
   */
  "transform-origin"?: string;
}

// Mixins

/**
 * Shared by
    <animate>
    <animateMotion>
    <animateTransform>
    <set>

    @internal
 */
interface SVGBaseAnimationAttributes {
  /**
   * The begin attribute defines when the associated element becomes active. For an animation element, this is the point at which the animation should begin
   */
  begin?: string;
  /**
   * The `dur` attribute indicates the simple duration of an animation.
   */
  dur?: string;
  /**
   * The end attribute defines an end value for the animation that can constrain the active duration.
   */
  end?: string;
  /**
   * The keyPoints attribute indicates the simple duration of an animation.
   */
  keyPoints?: string;
  /**
   * The max attribute specifies the maximum value of the active animation duration.
   */
  max?: string;
  /**
   * The min attribute specifies the minimum value of the active animation duration.
   *
   * @default 0
   */
  min?: string;
  /**
   * The repeatCount attribute indicates the number of times an animation will take place.
   */
  repeatCount?: number | "indefinite";
  /**
   * The repeatDur attribute specifies the total duration for repeating an animation.
   */
  repeatDur?: "indefinite" | (string & {});
  /**
   * The restart attribute specifies whether or not an animation can restart.
   *
   * @default "always"
   */
  restart?: "always" | "whenNotActive" | "never";
  /**
   * The to attribute indicates the final value of the attribute that will be modified during the animation.
   */
  to?: string;
}

/**
 * Shared by
 *    <animate>
 *    <animateMotion>
 *    <animateTransform>
 *
 * @internal
 */
interface SVGAnimationAttributes extends SVGBaseAnimationAttributes {
  /**
   * The accumulate attribute controls whether or not an animation is cumulative.
   */
  accumulate?: "none" | "sum";
  /**
   * The additive attribute controls whether or not an animation is additive.
   */
  additive?: "replace" | "sum";
  /**
   * The by attribute specifies a relative offset value for an attribute that will be modified during an animation.
   */
  by?: string;
  /**
   * The calcMode attribute specifies the interpolation mode for the animation.
   *
   * @default "linear"
   */
  calcMode?: "discrete" | "linear" | "paced" | "spline";
  /**
   * The from attribute indicates the initial value of the attribute that will be modified during the animation.
   */
  from?: string;
  /**
   * The keySplines attribute defines a set of Bézier curve control points associated with the keyTimes list, defining a cubic Bézier function that controls interval pacing
   */
  keySplines?: string;
  /**
   * The keyTimes attribute represents a list of time values used to control the pacing of the animation.
   */
  keyTimes?: string;
  /**
   * For <animate>, <animateMotion>, and <animateTransform>, values is a list of values defining the sequence of values over the course of the animation. If this attribute is specified, any from, to, and by attribute values set on the element are ignored.
   */
  values?: string;
}

/**
 * Shared by
    <feFuncR>
    <feFuncG>
    <feFuncB>
    <feFuncA>

    @internal
 */
interface SVGfeFuncAttributes {
  /**
   * The amplitude attribute controls the amplitude of the gamma function of a component transfer element when its `type` attribute is `gamma`.
   *
   * @default 1
   */
  amplitude?: number;
  /**
   * The exponent attribute defines the exponent of the gamma function.
   *
   * @default 1
   */
  exponent?: number;
  /**
   * The intercept attribute defines the intercept of the linear function of color component transfers when the `type` attribute is set to `linear`.
   *
   * @default 0
   */
  intercept?: number;
  /**
   * The slope attribute defines the values for linear filters, such as brightness.
   *
   * @default 1
   */
  slope?: number;
  /**
   * The tableValues attribute defines a list of numbers defining a lookup table of values for a color component transfer function.
   */
  tableValues?: string;
  /**
   * Indicates the type of component transfer function.
   */
  type?: "identity" | "table" | "discrete" | "linear" | "gamma";
}

/**
 * Shared by
 *    <linearGradient>
 *    <radialGradient>
 *
 * @internal
 */
interface SVGGradientAttributes {
  /**
   * The gradientTransform attribute contains the definition of an optional additional transformation from the gradient coordinate system onto the target coordinate system (i.e., userSpaceOnUse or objectBoundingBox). This allows for things such as skewing the gradient. This additional transformation matrix is post-multiplied to (i.e., inserted to the right of) any previously defined transformations, including the implicit transformation necessary to convert from object bounding box units to user space.
   */
  gradientTransform?: string;
  /**
   * The gradientUnits attribute defines the coordinate system used for attributes specified on the gradient elements.
   *
   * @default "objectBoundingBox"
   */
  gradientUnits?: "userSpaceOnUse" | "objectBoundingBox";
  /**
   * The spreadMethod attribute determines how a shape is filled beyond the defined edges of a gradient.
   *
   * @default "pad"
   */
  spreadMethod?: "pad" | "reflect" | "repeat";
}

/**
 * Shared by
 *    <text>
 *    <textPath>
 *    <tspan>
 *
 * @internal
 */
interface SVGTextualAttributes {
  /**
   * The alignment-baseline attribute specifies how an object is aligned with respect to its parent
   */
  "alignment-baseline"?:
    | "auto"
    | "baseline"
    | "before-edge"
    | "text-before-edge"
    | "middle"
    | "central"
    | "after-edge"
    | "text-after-edge"
    | "ideographic"
    | "alphabetic"
    | "hanging"
    | "mathematical"
    | "top"
    | "center"
    | "bottom";
  /**
   * The `direction` attribute specifies the inline-base direction of a <text> or <tspan> element. It defines the start and end points of a line of text as used by the `text-anchor` and `inline-size` properties. It also may affect the direction in which characters are positioned if the `unicode-bidi` property's value is either `embed` or `bidi-override`.
   *
   * @default "ltr"
   */
  direction?: "ltr" | "rtl";
  /**
   * The dominant-baseline attribute specifies the dominant baseline, which is the baseline used to align the box's text and inline-level contents. It also indicates the default alignment baseline of any boxes participating in baseline alignment in the box's alignment context
   *
   * @default "auto"
   */
  "dominant-baseline"?:
    | "auto"
    | "text-bottom"
    | "alphabetic"
    | "ideographic"
    | "middle"
    | "central"
    | "mathematical"
    | "hanging"
    | "text-top";
  /**
   * The font-family attribute indicates which font family will be used to render the text, specified as a prioritized list of font family names and/or generic family names
   */
  "font-family"?: string;
  /**
   * The font-size attribute refers to the size of the font from baseline to baseline when multiple lines of text are set solid in a multiline layout environment.
   *
   * @default "medium"
   */
  "font-size"?: LengthPercentage;
  /**
   * The font-size-adjust attribute allows authors to specify an aspect value for an element that will preserve the x-height of the first choice font in a substitute font.
   *
   * @default "none"
   */
  "font-size-adjust"?: "none" | number;
  /**
   * The font-style attribute specifies whether the text is to be rendered using a normal, italic, or oblique face
   *
   * @default "normal"
   */
  "font-style"?: "normal" | "italic" | "oblique";
  /**
   * The font-variant attribute indicates whether the text is to be rendered using variations of the font's glyphs.
   *
   * @default "normal"
   */
  "font-variant"?: string;
  /**
   * The font-weight attribute refers to the boldness or lightness of the glyphs used to render the text, relative to other fonts in the same font family
   *
   * @default "normal"
   */
  "font-weight"?: "normal" | "bold" | "bolder" | "lighter" | number;
  /**
   * The lengthAdjust attribute controls how the text is stretched into the length defined by the textLength attribute.
   */
  lengthAdjust?: "spacing" | "spacingAndGlyphs";
  /**
   * The letter-spacing attribute controls spacing between text characters
   *
   * @default "normal"
   */
  "letter-spacing"?: "normal" | Length;
  /**
   * The text-anchor attribute is used to align (start-, middle- or end-alignment) a string of pre-formatted text or auto-wrapped text where the wrapping area is determined from the inline-size property relative to a given point
   *
   * @default "start"
   */
  "text-anchor"?: "start" | "middle" | "end";
  /**
   * The text-decoration attribute defines whether text is decorated with an underline, overline and/or strike-through. It is a shorthand for the text-decoration-line and text-decoration-style properties.
   */
  "text-decoration"?: string;
  /**
   * The textLength attribute, available on SVG <text> and <tspan> elements, lets you specify the width of the space into which the text will draw. The user agent will ensure that the text does not extend farther than that distance, using the method or methods specified by the lengthAdjust attribute. By default, only the spacing between characters is adjusted, but the glyph size can also be adjusted if you change lengthAdjust.
   */
  textLength?: SVGLengthPercentage;
  /**
   * The unicode-bidi attribute specifies how the accumulation of the background image is managed.
   */
  "unicode-bidi"?: string;
  /**
   * The word-spacing attribute specifies spacing behavior between words.
   */
  "word-spacing"?: "normal" | Length;
  /**
   * The writing-mode attribute specifies whether the initial inline-progression-direction for a <text> element shall be left-to-right, right-to-left, or top-to-bottom. The writing-mode attribute applies only to <text> elements; the attribute is ignored for <tspan> and <textPath> sub-elements. (Note that the inline-progression-direction can change within a <text> element due to the Unicode bidirectional algorithm and properties direction and unicode-bidi.)
   *
   * @default "horizontal-tb"
   */
  "writing-mode"?: "horizontal-tb" | "vertical-rl" | "vertical-lr";
}

// SVG Attributes

/**
 * @internal
 */
interface SVGAttributeNameAttribute {
  /**
   * The attributeName attribute indicates the name of the CSS property or attribute of the target element that is going to be changed during an animation
   */
  attributeName?: string;
}

/**
 * @internal
 */
interface SVGBaselineShiftAttribute {
  /**
   * The baseline-shift attribute allows repositioning of the dominant-baseline relative to the dominant-baseline of the parent text content element. The shifted object might be a sub- or superscript
   *
   * @default 0
   */
  "baseline-shift"?: SVGLengthPercentage | "sub" | "sup";
}

/**
 * @internal
 */
interface SVGClipPathAttribute {
  /**
   * The `clip-path` presentation attribute defines or associates a clipping path with the element it is related to.
   */
  "clip-path"?: string;
}

/**
 * @internal
 */
interface SVGClipRuleAttribute {
  /**
   * The `clip-rule` attribute only applies to graphics elements that are contained within a <clipPath> element. The `clip-rule` attribute basically works as the `fill-rule` attribute, except that it applies to <clipPath> definitions.
   *
   * @default "nonzero"
   */
  "clip-rule"?: "nonzero" | "evenodd" | "inherit";
}

/**
 * @internal
 */
interface SVGColorInterpolationAttribute {
  /**
   * The color-interpolation attribute chooses between color operations occurring in the sRGB color space or in a (light energy linear) linearized RGB color space. Having chosen the appropriate color space, component-wise linear interpolation is used
   *
   * @default "sRGB"
   */
  "color-interpolation"?: "auto" | "sRGB" | "linearRGB";
}

/**
 * @internal
 */
interface SVGColorInterpolationFiltersAttribute {
  /**
   * The color-interpolation-filters attribute specifies the color space for imaging operations performed via filter effects.
   *
   * @default "linearRGB"
   */
  "color-interpolation-filters"?: "auto" | "sRGB" | "linearRGB";
}

/**
 * @internal
 */
interface SVGCrossOriginAttribute {
  /**
   * Provides support for configuration of the Cross-Origin Resource Sharing (CORS) requests for the element's fetched data
   */
  crossorigin?: "anonymous" | "use-credentials";
}

/**
 * @internal
 */
interface SVGCursorAttribute {
  /**
   * The cursor attribute specifies the mouse cursor displayed when the mouse pointer is over an element.
   */
  cursor?: string;
}

/**
 * @internal
 */
interface SVGCAttributes {
  /**
   * The cx attribute defines the x-axis coordinate of a center point.
   *
   * @default 0
   */
  cx?: SVGLengthPercentage;
  /**
   * The cy attribute defines the y-axis coordinate of a center point.
   *
   * @default 0
   */
  cy?: SVGLengthPercentage;
}

/**
 * @internal
 */
interface SVGDisplayAttribute {
  /**
   * The display attribute lets you control the rendering of graphical or container elements.
   *
   * @default "inline"
   */
  display?: string;
}

/**
 * @internal
 */
interface SVGDAttributes {
  /**
   * The dx attribute indicates a shift along the x-axis on the position of an element or its content.
   *
   * @default 2
   */
  dx?: number;
  /**
   * The dy attribute indicates a shift along the y-axis on the position of an element or its content.
   *
   * @default 2
   */
  dy?: number;
}

/**
 * @internal
 */
interface SVGFillAttribute {
  /**
   * The fill attribute has two different meanings. For shapes and text it's a presentation attribute that defines the color (or any SVG paint servers like gradients or patterns) used to paint the element; for animation it defines the final state of the animation.
   */
  fill?: string;
}

/**
 * @internal
 */
interface SVGFillOpacityAttribute {
  /**
   * The fill-opacity attribute is a presentation attribute defining the opacity of the paint server (color, gradient, pattern, etc.) applied to a shape..
   *
   * @default 1
   */
  "fill-opacity"?: number | Percentage;
}

/**
 * @internal
 */
interface SVGFillRuleAttribute {
  /**
   * The fill-rule attribute is a presentation attribute defining the algorithm to use to determine the inside part of a shape.
   *
   * @default "nonzero"
   */
  "fill-rule"?: "nonzero" | "evenodd";
}

/**
 * @internal
 */
interface SVGFilterAttribute {
  /**
   * The filter attribute specifies the filter effects defined by the <filter> element that shall be applied to its element
   */
  filter?: string;
}

/**
 * @internal
 */
interface SVGFloodAttributes {
  /**
   * The flood-color attribute indicates what color to use to flood the current filter primitive subregion.
   *
   * @default "black"
   */
  "flood-color"?: string;
  /**
   * The flood-opacity attribute indicates the opacity value to use across the current filter primitive subregion.
   *
   * @default 1
   */
  "flood-opacity"?: number;
}

/**
 * @internal
 */
interface SVGSizeAttributes {
  /**
   * The height attribute defines the vertical length of an element in the user coordinate system.
   */
  height?: "auto" | LengthPercentage;
  /**
   * The width attribute defines the horizontal length of an element in the user coordinate system.
   */
  width?: "auto" | LengthPercentage;
}

/**
 * @internal
 */
interface SVGHrefAttribute {
  /**
   * The href attribute defines a link to a resource as a reference URL. The exact meaning of that link depends on the context of each element using it.
   */
  href?: string;
}

/**
 * @internal
 */
interface SVGInAttribute {
  /**
   * The in attribute identifies input for the given filter primitive.
   */
  in?:
    | "SourceGraphic"
    | "SourceAlpha"
    | "BackgroundImage"
    | "BackgroundAlpha"
    | "FillPaint"
    | "StrokePaint"
    | (string & {});
}

/**
 * @internal
 */
interface SVGIn2Attribute {
  /**
   * The in2 attribute identifies the second input for the given filter primitive. It works exactly like the `in` attribute.
   */
  in2?:
    | "SourceGraphic"
    | "SourceAlpha"
    | "BackgroundImage"
    | "BackgroundAlpha"
    | "FillPaint"
    | "StrokePaint"
    | (string & {});
}

/**
 * @internal
 */
interface SVGKernelUnitLengthAttribute {
  /**
   * The kernelUnitLength attribute has two meanings based on the context it's used in. For lighting filter primitives, it indicates the intended distance for the x and y coordinates, for <feConvolveMatrix>, it indicates the intended distance between successive columns and rows in the kernel matrix.
   */
  kernelUnitLength?: string;
}

/**
 * @internal
 */
interface SVGLightingColorAttribute {
  /**
   * The lighting-color attribute defines the color of the light source for lighting filter primitives.
   *
   * @default "white"
   */
  "lighting-color"?: string;
}

/**
 * @internal
 */
interface SVGArrowheadAttributes {
  /**
   * The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.
   *
   * @default "none"
   */
  "marker-end"?: string;
  /**
   * The marker-mid attribute defines the arrowhead or polymarker that will be drawn at all interior vertices of the given shape.
   *
   * @default "none"
   */
  "marker-mid"?: string;
  /**
   * The marker-start attribute defines the arrowhead or polymarker that will be drawn at the first vertex of the given shape.
   *
   * @default "none"
   */
  "marker-start"?: string;
}

/**
 * @internal
 */
interface SVGMaskAttribute {
  /**
   * The mask attribute is a presentation attribute mainly used to bind a given <mask> element with the element the attribute belongs to.
   *
   * @default "none"
   */
  mask?: string;
}

/**
 * @internal
 */
interface SVGOpacityAttribute {
  /**
   * The opacity attribute specifies the transparency of an object or of a group of objects, that is, the degree to which the background behind the element is overlaid.
   *
   * @default 1
   */
  opacity?: number;
}

/**
 * @internal
 */
interface SVGOverflowAttribute {
  /**
   * The overflow attribute sets what to do when an element's content is too big to fit in its block formatting context
   *
   * @default "visible"
   */
  overflow?: "visible" | "hidden" | "scroll" | "auto";
}

/**
 * @internal
 */
interface SVGPaintOrderAttribute {
  /**
   * The paint-order attribute specifies the order that the fill, stroke, and markers of a given shape or text element are painted
   *
   * @default "normal"
   */
  "paint-order"?: string;
}

/**
 * @internal
 */
interface SVGPathAttribute {
  /**
   * For <animateMotion>, path defines the motion path, expressed in the same format and interpreted the same way as the `d` geometric property for the <path> element. The effect of a motion path animation is a translation along the x- and y-axes of the current user coordinate system by the x and y values computed over time.
   *
   * For <textPath>, path defines the path onto which the glyphs of a <text> element will be rendered. An empty string indicates that there is no path data for the element. This means that the text within the <textPath> element does not render or contribute to the bounding box of the <text> element. If the attribute is not specified, the path specified in href is used instead.
   */
  path?: string;
}

/**
 * @internal
 */
interface SVGPathLengthAttribute {
  /**
   * The pathLength attribute lets authors specify a total length for the path, in user units. This value is then used to calibrate the browser's distance calculations with those of the author, by scaling all distance computations using the ratio pathLength / (computed value of path length).
   */
  pathLength?: number;
}

/**
 * @internal
 */
interface SVGPointerEventsAttribute {
  /**
   * The pointer-events attribute is a presentation attribute that allows defining whether or when an element may be the target of a mouse event.
   *
   * @default "visiblePainted"
   */
  "pointer-events"?:
    | "bounding-box"
    | "visiblePainted"
    | "visibleFill"
    | "visibleStroke"
    | "visible"
    | "painted"
    | "fill"
    | "stroke"
    | "all"
    | "none";
}

/**
 * @internal
 */
interface SVGPointsAttribute {
  /**
   * The points attribute defines a list of points. Each point is defined by a pair of number representing a X and a Y coordinate in the user coordinate system. If the attribute contains an odd number of coordinates, the last one will be ignored
   */
  points?: string;
}

/**
 * @internal
 */
interface SVGRequiredExtensionsAttribute {
  /**
   * The requiredExtensions SVG conditional processing attribute is a list of space-separated URL values each referencing a language extension. Language extensions are extended capabilities that go beyond those defined by standard browser specifications.
   */
  requiredExtensions?: string;
}

/**
 * @internal
 */
interface SVGResultAttribute {
  /**
   * The result attribute defines the assigned name for this filter primitive. If supplied, then graphics that result from processing this filter primitive can be referenced by an `in` attribute on a subsequent filter primitive within the same <filter> element. If no value is provided, the output will only be available for re-use as the implicit input into the next filter primitive if that filter primitive provides no value for its `in` attribute.
   */
  result?: string;
}

/**
 * @internal
 */
interface SVGRAttributes {
  /**
   * The rx attribute defines a radius on the x-axis.
   *
   * @default "auto"
   */
  rx?: SVGLengthPercentage | "auto";
  /**
   * The ry attribute defines a radius on the y-axis.
   *
   * @default "auto"
   */
  ry?: SVGLengthPercentage | "auto";
}

/**
 * @internal
 */
interface SVGShapeRenderingAttribute {
  /**
   * The result attribute defines the assigned name for this filter primitive. If supplied, then graphics that result from processing this filter primitive can be referenced by an `in` attribute on a subsequent filter primitive within the same <filter> element. If no value is provided, the output will only be available for re-use as the implicit input into the next filter primitive if that filter primitive provides no value for its `in` attribute.
   *
   * @default "auto"
   */
  "shape-rendering"?:
    | "auto"
    | "optimizeSpeed"
    | "crispEdges"
    | "geometricPrecision";
}

/**
 * @internal
 */
interface SVGSpecularExponentAttribute {
  /**
   * The specularExponent attribute controls the focus for the light source. The bigger the value the brighter the light
   *
   * @default 1
   */
  specularExponent?: number;
}

/**
 * @internal
 */
interface SVGStdDeviationAttribute {
  /**
   * The stdDeviation attribute defines the standard deviation for the blur operation.
   *
   * @default 0
   */
  stdDeviation?: string;
}

/**
 * @internal
 */
interface SVGStrokeAttribute {
  /**
   * The stroke attribute is a presentation attribute defining the color (or any SVG paint servers like gradients or patterns) used to paint the outline of the shape
   */
  stroke?: string;
}

/**
 * @internal
 */
interface SVGStrokeDashArrayAttribute {
  /**
   * The stroke-dasharray attribute is a presentation attribute defining the pattern of dashes and gaps used to paint the outline of the shape.
   *
   * @default "none"
   */
  "stroke-dasharray"?: "none" | (string & {});
}

/**
 * @internal
 */
interface SVGStrokeDashOffsetAttribute {
  /**
   * The stroke-dashoffset attribute is a presentation attribute defining an offset on the rendering of the associated dash array.
   *
   * @default 0
   */
  "stroke-dashoffset"?: LengthPercentage;
}

/**
 * @internal
 */
interface SVGStrokeLineCapAttribute {
  /**
   * The stroke-linecap attribute is a presentation attribute defining the shape to be used at the end of open subpaths when they are stroked.
   *
   * @default "butt"
   */
  "stroke-linecap"?: "butt" | "round" | "square";
}

/**
 * @internal
 */
interface SVGStrokeLineJoinAttribute {
  /**
   * The stroke-linejoin attribute is a presentation attribute defining the shape to be used at the corners of paths when they are stroked
   *
   * @default "miter"
   */
  "stroke-linejoin"?: "arcs" | "bevel" | "miter" | "miter-clip" | "round";
}

/**
 * @internal
 */
interface SVGStrokeMiterLimitAttribute {
  /**
   * The stroke-miterlimit attribute is a presentation attribute defining a limit on the ratio of the miter length to the stroke-width used to draw a miter join. When the limit is exceeded, the join is converted from a miter to a bevel.
   *
   * @default 4
   */
  "stroke-miterlimit"?: number;
}

/**
 * @internal
 */
interface SVGStrokeOpacityAttribute {
  /**
   * The stroke-opacity attribute is a presentation attribute defining the opacity of the paint server (color, gradient, pattern, etc.) applied to the stroke of a shape.
   *
   * @default 1
   */
  "stroke-opacity"?: number | Percentage;
}

/**
 * @internal
 */
interface SVGStrokeWidthAttribute {
  /**
   * The stroke-width attribute is a presentation attribute defining the width of the stroke to be applied to the shape. It applies to any SVG shape or text-content element, but as an inherited property, it may be applied to elements such as <g> and still have the intended effect on descendant elements' strokes.
   *
   * @default 1px
   */
  "stroke-width"?: LengthPercentage;
}

/**
 * @internal
 */
interface SVGSurfaceScaleAttribute {
  /**
   * The surfaceScale attribute represents the height of the surface for a light filter primitive.
   *
   * @default 1
   */
  surfaceScale?: number;
}

/**
 * @internal
 */
interface SVGSystemLanguageAttribute {
  /**
   * The systemLanguage attribute represents a list of supported language tags. This list is matched against the language defined in the user preferences
   */
  systemLanguage?: string;
}

/**
 * @internal
 */
interface SVGVectorEffectAttribute {
  /**
   * The vector-effect property specifies the vector effect to use when drawing an object. Vector effects are applied before any of the other compositing operations, i.e., filters, masks and clips
   *
   * @default "none"
   */
  "vector-effect"?:
    | "none"
    | "non-scaling-stroke"
    | "non-scaling-size"
    | "non-rotation"
    | "fixed-position";
}

/**
 * @internal
 */
interface SVGViewBoxAttribute {
  /**
   * The viewBox attribute defines the position and dimension, in user space, of an SVG viewport.
   */
  viewBox?: string;
}

/**
 * @internal
 */
interface SVGVisibilityAttribute {
  /**
   * The visibility attribute lets you control the visibility of graphical elements. With a value of hidden or collapse the current graphics element is invisible
   *
   * @default "visible"
   */
  visibility?: "visible" | "hidden" | "collapse";
}

/**
 * The <animate> SVG element provides a way to animate an attribute of an element over time.
 */
export interface SVGAnimateAttributes
  extends
    SVGAttributes,
    SVGAnimationAttributes,
    SVGAttributeNameAttribute,
    SVGColorInterpolationAttribute,
    SVGFillAttribute,
    SVGHrefAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {}

/**
 * The <animateMotion> SVG element provides a way to define how an element moves along a motion path
 */
export interface SVGAnimateMotionAttributes
  extends
    SVGAttributes,
    SVGAnimationAttributes,
    SVGFillAttribute,
    SVGHrefAttribute,
    SVGPathAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {
  /**
   * The origin attribute specifies the origin of motion for an animation. It has no effect in SVG.
   */
  origin?: "default";
  /**
   * The rotate attribute specifies how the animated element rotates as it travels along a path specified in an <animateMotion> element.
   *
   * @default 0
   */
  rotate?: "auto" | "auto-reverse" | number;
}

/**
 * The <animateTransform> SVG element animates a transformation attribute on its target element, thereby allowing animations to control translation, scaling, rotation, and/or skewing
 */
export interface SVGAnimateTransformAttributes
  extends
    SVGAttributes,
    SVGAnimationAttributes,
    SVGAttributeNameAttribute,
    SVGFillAttribute,
    SVGHrefAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {
  /**
   * Defines the type of transformation, whose values change over time.
   */
  type?: "translate" | "scale" | "rotate" | "skewX" | "skewY";
}

/**
 * The <circle> SVG element is an SVG basic shape, used to draw circles based on a center point and a radius
 */
export interface SVGCircleAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGCAttributes,
    SVGDisplayAttribute,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFilterAttribute,
    SVGArrowheadAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPathLengthAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGShapeRenderingAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   * Defines the radius of the circle and therefor its size. With a value lower or equal to zero the circle won't be drawn at all.
   *
   * @default 0
   */
  r?: SVGLengthPercentage;
}

/**
 * The <clipPath> SVG element defines a clipping path, to be used by the clip-path property.
 */
export interface SVGClipPathAttributes
  extends
    SVGAttributes,
    SVGClipPathAttribute,
    SVGColorInterpolationAttribute,
    SVGMaskAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {
  /**
   * The clipPathUnits attribute indicates which coordinate system to use for the contents of the <clipPath> element.
   *
   * @default "userSpaceOnUse"
   */
  clipPathUnits?: "userSpaceOnUse" | "objectBoundingBox";
}

/**
 * The <defs> SVG element is used to store graphical objects that will be used at a later time. Objects created inside a <defs> element are not rendered directly. To display them you have to reference them (with a <use> element for example).
 */
export interface SVGDefsAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {}

/**
 * The <desc> SVG element provides an accessible, long-text description of any SVG container element or graphics element.
 */
export interface SVGDescAttributes extends SVGAttributes {}

/**
 * The <ellipse> SVG element is an SVG basic shape, used to create ellipses based on a center coordinate, and both their x and y radius
 */
export interface SVGEllipseAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGCAttributes,
    SVGDisplayAttribute,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFilterAttribute,
    SVGArrowheadAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPathLengthAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGRAttributes,
    SVGShapeRenderingAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {}

/**The <feBlend> SVG filter primitive composes two objects together ruled by a certain blending mode. This is similar to what is known from image editing software when blending two layers. The mode is defined by the mode attribute */
export interface SVGfeBlendAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGIn2Attribute,
    SVGResultAttribute {
  /**
   * The mode attribute defines the blending mode on the <feBlend> filter primitive.
   *
   * @default "normal"
   */
  mode?: string;
  /**
   * For <feBlend>, x defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feColorMatrix> SVG filter element changes colors based on a transformation matrix. Every pixel's color value [R,G,B,A] is matrix multiplied by a 5 by 5 color matrix to create new color [R',G',B',A'].
 */
export interface SVGfeColorMatrixAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGResultAttribute {
  /**
   * Indicates the type of matrix operation. The keyword matrix indicates that a full 5x4 matrix of values will be provided. The other keywords represent convenience shortcuts to allow commonly used color operations to be performed without specifying a complete matrix.
   */
  type?: "matrix" | "saturate" | "hueRotate" | "luminanceToAlpha";
  /**
   * For the <feColorMatrix> element, values is a list of numbers interpreted differently depending on the value of the type attribute.
   */
  values?: string;
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.
 */
export interface SVGfeComponentTransferAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGResultAttribute {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feComposite> SVG filter primitive performs the combination of two input images pixel-wise in image space using one of the Porter-Duff compositing operations: over, in, atop, out, xor, lighter, or arithmetic.
 */
export interface SVGfeCompositeAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGIn2Attribute,
    SVGResultAttribute {
  /**
   * The `k1` attribute defines one of the values to be used within the arithmetic operation of the <feComposite> filter primitive
   *
   * @default 0
   */
  k1?: number;
  /**
   * The `k2` attribute defines one of the values to be used within the arithmetic operation of the <feComposite> filter primitive
   *
   * @default 0
   */
  k2?: number;
  /**
   * The `k3` attribute defines one of the values to be used within the arithmetic operation of the <feComposite> filter primitive
   *
   * @default 0
   */
  k3?: number;
  /**
   * The `k4` attribute defines one of the values to be used within the arithmetic operation of the <feComposite> filter primitive
   *
   * @default 0
   */
  k4?: number;
  /**
   * Defines the compositing operation that is to be performed
   *
   * @default "over"
   */
  operator?: "over" | "in" | "out" | "atop" | "xor" | "lighter" | "arithmetic";
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feConvolveMatrix> SVG filter primitive applies a matrix convolution filter effect. A convolution combines pixels in the input image with neighboring pixels to produce a resulting image. A wide variety of imaging operations can be achieved through convolutions, including blurring, edge detection, sharpening, embossing and beveling
 */
export interface SVGfeConvolveMatrixAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGKernelUnitLengthAttribute,
    SVGResultAttribute {
  /**
   * The `bias` attribute shifts the range of the filter. After applying the `kernelMatrix` of the <feConvolveMatrix> element to the input image to yield a number and applied the `divisor` attribute, the `bias` attribute is added to each component. This allows representation of values that would otherwise be clamped to 0 or 1.
   *
   * @default 0
   */
  biais?: number;
  /**
   * The divisor attribute specifies the value by which the resulting number of applying the `kernelMatrix` of a <feConvolveMatrix> element to the input image color value is divided to yield the destination color value.
   */
  divisor?: number;
  /**
   * For <feConvolveMatrix>, edgeMode determines how to extend the input image as necessary with color values so that the matrix operations can be applied when the kernel is positioned at or near the edge of the input image.
   *
   * @default "duplicate"
   */
  edgeMode?: "duplicate" | "wrap" | "none";
  /**
   * The `kernelMatrix` attribute defines the list of numbers that make up the kernel matrix for the <feConvolveMatrix> element
   */
  kernelMatrix?: string;
  /**
   * The order attribute indicates the size of the matrix to be used by a <feConvolveMatrix> element.
   *
   * @default 3
   */
  order?: string;
  /**
   * The preserveAlpha attribute indicates how a <feConvolveMatrix> element handles alpha transparency
   *
   * @default false
   */
  preserveAlpha?: Booleanish;
  /**
   * The targetX attribute determines the positioning in horizontal direction of the convolution matrix relative to a given target pixel in the input image. The leftmost column of the matrix is column number zero. The value must be such that: 0 <= targetX < x of order.
   */
  targetX?: number;
  /**
   * The targetY attribute determines the positioning in vertical direction of the convolution matrix relative to a given target pixel in the input image. The topmost row of the matrix is row number zero. The value must be such that: 0 <= targetY < y of order.
   */
  targetY?: number;
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map
 */
export interface SVGfeDiffuseLightingAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGKernelUnitLengthAttribute,
    SVGLightingColorAttribute,
    SVGResultAttribute,
    SVGSurfaceScaleAttribute {
  /**
   * The `diffuseConstant` attribute represents the `k_d` value in the Phong lighting model. In SVG, this can be any non-negative number.
   *
   * @default 1
   */
  diffuseConstant?: number;
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feDisplacementMap> SVG filter primitive uses the pixel values from the image from in2 to spatially displace the image from in.
 */
export interface SVGfeDisplacementMapAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGIn2Attribute,
    SVGResultAttribute {
  /**
   * The scale attribute defines the displacement scale factor to be used on a <feDisplacementMap> filter primitive. The amount is expressed in the coordinate system established by the `primitiveUnits` attribute on the <filter> element.
   */
  scale?: number;
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * The xChannelSelector attribute indicates which color channel from `in2` to use to displace the pixels in `in` along the x-axis
   *
   * @default "A"
   */
  xChannelSelector?: "R" | "G" | "B" | "A";
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
  /**
   * The xChannelSelector attribute indicates which color channel from `in2` to use to displace the pixels in `in` along the x-axis
   *
   * @default "A"
   */
  yChannelSelector?: "R" | "G" | "B" | "A";
}

/**
 * The <feDistantLight> SVG element defines a distant light source that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 */
export interface SVGfeDistantLightAttributes extends SVGAttributes {
  /**
   * The azimuth attribute specifies the direction angle for the light source on the XY plane (clockwise), in degrees from the x axis.
   *
   * @default 0
   */
  azimuth?: number;
  /**
   * The elevation attribute specifies the direction angle for the light source from the XY plane towards the Z-axis, in degrees. Note that the positive Z-axis points towards the viewer of the content
   *
   * @default 0
   */
  elevation?: number;
}

/**
 * The <feDropShadow> SVG filter primitive creates a drop shadow of the input image. It can only be used inside a <filter> element.
 */
export interface SVGfeDropShadowAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGDAttributes,
    SVGFloodAttributes,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGResultAttribute,
    SVGStdDeviationAttribute {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feFlood> SVG filter primitive fills the filter subregion with the color and opacity defined by flood-color and flood-opacity.
 */
export interface SVGfeFloodAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGFloodAttributes,
    SVGSizeAttributes,
    SVGResultAttribute {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**The <feFuncA> SVG filter primitive defines the transfer function for the alpha component of the input graphic of its parent <feComponentTransfer> element */
export interface SVGfeFuncAAttributes
  extends SVGAttributes, SVGfeFuncAttributes {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feFuncB> SVG filter primitive defines the transfer function for the blue component of the input graphic of its parent <feComponentTransfer> element.
 */
export interface SVGfeFuncBAttributes
  extends SVGAttributes, SVGfeFuncAttributes {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feFuncG> SVG filter primitive defines the transfer function for the green component of the input graphic of its parent <feComponentTransfer> element.
 */
export interface SVGfeFuncGAttributes
  extends SVGAttributes, SVGfeFuncAttributes {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feFuncR> SVG filter primitive defines the transfer function for the red component of the input graphic of its parent <feComponentTransfer> element.
 */
export interface SVGfeFuncRAttributes
  extends SVGAttributes, SVGfeFuncAttributes {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feGaussianBlur> SVG filter primitive blurs the input image by the amount specified in stdDeviation, which defines the bell-curve.
 */
export interface SVGfeGaussianBlurAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGResultAttribute,
    SVGStdDeviationAttribute {
  /**
   * For <feGaussianBlur>, edgeMode determines how to extend the input image as necessary with color values so that the matrix operations can be applied when the kernel is positioned at or near the edge of the input image
   *
   * @default "none"
   */
  edgeMode?: "duplicate" | "wrap" | "none";
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feImage> SVG filter primitive fetches image data from an external source and provides the pixel data as output (meaning if the external source is an SVG image, it is rasterized)
 */
export interface SVGfeImageAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGCrossOriginAttribute,
    SVGSizeAttributes,
    SVGHrefAttribute,
    SVGResultAttribute {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feMerge> SVG element allows filter effects to be applied concurrently instead of sequentially. This is achieved by other filters storing their output via the result attribute and then accessing it in a <feMergeNode> child.
 */
export interface SVGfeMergeAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGResultAttribute {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feMergeNode> SVG takes the result of another filter to be processed by its parent <feMerge>.
 */
export interface SVGfeMergeNodeAttributes
  extends SVGAttributes, SVGInAttribute {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feMorphology> SVG filter primitive is used to erode or dilate the input image. Its usefulness lies especially in fattening or thinning effects.
 */
export interface SVGfeMorphologyAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGResultAttribute {
  /**
   * Defines whether to erode (i.e., thin) or dilate (fatten) the source graphic.
   *
   * @default "erode"
   */
  operator?: "erode" | "dilate";
  /**
   * The radius attribute represents the radius (or radii) for the operation on a given <feMorphology> filter primitive.
   *
   * @default 0
   */
  radius?: string;
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feOffset> SVG filter primitive enables offsetting an input image relative to its current position. The input image as a whole is offset by the values specified in the dx and dy attributes.
 */
export interface SVGfeOffsetAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGDAttributes,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGResultAttribute {
  /**
   * `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * `y` defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <fePointLight> SVG element defines a light source which allows to create a point light effect. It can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>
 */
export interface SVGfePointLightAttributes extends SVGAttributes {
  /**
   * For <fePointLight>, `x` defines the x location for the light source in the coordinate system defined by the `primitiveUnits` attribute on the <filter> element.
   *
   * @default 0
   */
  x?: number;
  /**
   * For <fePointLight>, y defines the y location for the light source in the coordinate system defined by the primitiveUnits attribute on the <filter> element.
   *
   * @default 0
   */
  y?: number;
  /**
   * For <fePointLight>, z defines the location along the z-axis for the light source in the coordinate system established by the primitiveUnits attribute on the <filter> element.
   *
   * @default 1
   */
  z?: number;
}

/**
 * The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction
 */
export interface SVGfeSpecularLightingAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGKernelUnitLengthAttribute,
    SVGLightingColorAttribute,
    SVGResultAttribute,
    SVGSpecularExponentAttribute,
    SVGSurfaceScaleAttribute {
  /**
   * The specularConstant attribute controls the ratio of reflection of the specular lighting. It represents the ks value in the Phong lighting model. The bigger the value the stronger the reflection
   *
   * @default 1
   */
  specularConstant?: number;
  /**
   * For <feSpecularLighting>, `x` defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * For <feSpecularLighting>, y defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feSpotLight> SVG element defines a light source that can be used to create a spotlight effect. It is used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 */
export interface SVGfeSpotLightAttributes
  extends SVGAttributes, SVGSpecularExponentAttribute {
  /**
   * The limitingConeAngle attribute represents the angle in degrees between the spot light axis (i.e., the axis between the light source and the point to which it is pointing at) and the spot light cone. So it defines a limiting cone which restricts the region where the light is projected. No light is projected outside the cone.
   *
   * @default 0
   */
  limitingConeAngle?: number;
  /**
   * The pointsAtX attribute represents the x location in the coordinate system established by attribute primitiveUnits on the <filter> element of the point at which the light source is pointing.
   *
   * @default 0
   */
  pointsAtX?: number;
  /**
   * The pointsAtY attribute represents the y location in the coordinate system established by attribute primitiveUnits on the <filter> element of the point at which the light source is pointing.
   *
   * @default 0
   */
  pointsAtY?: number;
  /**
   * The pointsAtZ attribute represents the z location in the coordinate system established by attribute primitiveUnits on the <filter> element of the point at which the light source is pointing, assuming that, in the initial local coordinate system, the positive z-axis comes out towards the person viewing the content and assuming that one unit along the z-axis equals one unit in x and y.
   *
   * @default 0
   */
  pointsAtZ?: number;
  /**
   * For <feSpotLight>, x defines the x location for the light source in the coordinate system defined by the primitiveUnits attribute on the <filter> element.
   *
   * @default 0
   */
  x?: number;
  /**
   * For <feSpotLight>, y defines the y location for the light source in the coordinate system defined by the primitiveUnits attribute on the <filter> element
   *
   * @default 0
   */
  y?: number;
  /**
   * For <feSpotLight>, z defines the location along the z-axis for the light source in the coordinate system established by the primitiveUnits attribute on the <filter> element.
   *
   * @default 1
   */
  z?: number;
}

/**
 * The <feTile> SVG filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image. The effect is similar to the one of a <pattern>.
 */
export interface SVGfeTileAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGInAttribute,
    SVGResultAttribute {
  /**
   * For <feTile>, x defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * For <feTile>, y defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <feTurbulence> SVG filter primitive creates an image using the Perlin turbulence function. It allows the synthesis of artificial textures like clouds or marble. The resulting image will fill the entire filter primitive subregion.
 */
export interface SVGfeTurbulenceAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationFiltersAttribute,
    SVGSizeAttributes,
    SVGResultAttribute {
  /**
   * The baseFrequency attribute represents the base frequency parameter for the noise function of the <feTurbulence> filter primitive.
   *
   * @default 0
   */
  baseFrequency?: number | string;
  /**
   * The numOctaves attribute defines the number of octaves for the noise function of the <feTurbulence> primitive
   *
   * @default 1
   */
  numOctaves?: number;
  /**
   * The seed attribute represents the starting number for the pseudo random number generator of the <feTurbulence> filter primitive.
   *
   * @default 0
   */
  seed?: number;
  /**
   * The stitchTiles attribute defines how the Perlin Noise tiles behave at the border.
   *
   * @default "noStitch
   */
  stitchTiles?: "noStitch" | "stitch";
  /**
   * Indicates whether the filter primitive should perform a noise or turbulence function.
   */
  type?: "fractalNoise" | "turbulence";
  /**
   * For <feTurbulence>, x defines the minimum x coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  x?: SVGLengthPercentage;
  /**
   * For <feTurbulence>, y defines the minimum y coordinate for the rendering area of the primitive.
   *
   * @default 0%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements
 */
export interface SVGFilterAttributes extends SVGAttributes, SVGSizeAttributes {
  /**
   * The filterUnits attribute defines the coordinate system for the attributes x, y, width and height.
   *
   * @default "objectBoundingBox"
   */
  filterUnits?: "userSpaceOnUse" | "objectBoundingBox";
  /**
   * The primitiveUnits attribute specifies the coordinate system for the various length values within the filter primitives and for the attributes that define the filter primitive subregion
   *
   * @default "userSpaceOnUse"
   */
  primitiveUnits?: "userSpaceOnUse" | "objectBoundingBox";
  /**
   * For <filter>, x defines the x coordinate of the upper left corner for the rendering area of the filter.
   *
   * @default -10%
   */
  x?: SVGLengthPercentage;
  /**
   * For <filter>, y defines the y coordinate of the upper left corner for the rendering area of the filter.
   *
   * @default -10%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <foreignObject> SVG element includes elements from a different XML namespace. In the context of a browser, it is most likely (X)HTML
 */
export interface SVGForeignObjectAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGColorInterpolationAttribute,
    SVGSizeAttributes,
    SVGOpacityAttribute,
    SVGOverflowAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   * For <foreignObject>, x defines the x coordinate of the upper left corner of its viewport.
   *
   * @default 0
   */
  x?: SVGLengthPercentage;
  /**
   * For <foreignObject>, y defines the y coordinate of the upper left corner of its viewport.
   *
   * @default 0
   */
  y?: SVGLengthPercentage;
}

/**
 * The <g> SVG element is a container used to group other SVG elements.
 */
export interface SVGGAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {}

/**
 * The <image> SVG element includes images inside SVG documents. It can display raster image files or other SVG files.
 */
export interface SVGImageAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCrossOriginAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGSizeAttributes,
    SVGHrefAttribute,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGOverflowAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   * The `decoding` attribute, valid on <image> elements, provides a hint to the browser as to whether it should perform image decoding along with rendering other content in a single presentation step that looks more "correct" (`sync`), or render and present the other content first and then decode the image and present it later (`async`). In practice, `async` means that the next paint does not wait for the image to decode.
   */
  decoding?: string;
  /**
   * The image-rendering attribute provides a hint to the browser about how to make speed vs. quality tradeoffs as it performs image processing
   *
   * @default "auto"
   */
  "image-rendering"?: "auto" | "optimizeSpeed" | "optimizeQuality";
  /**
   * For <image>, x defines the x coordinate of the upper left corner of the image.
   *
   * @default 0
   */
  x?: SVGLengthPercentage;
  /**
   * For <image>, y defines the y coordinate of the upper left corner of the image.
   *
   * @default 0
   */
  y?: SVGLengthPercentage;
}

/**
 * The <line> SVG element is an SVG basic shape used to create a line connecting two points.
 */
export interface SVGLineAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGArrowheadAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPathLengthAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGShapeRenderingAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   * For <line>, x1 defines the x coordinate of the starting point of the line.
   *
   * @default 0
   */
  x1?: SVGLengthPercentage;
  /**
   * For <line>, x2 defines the x coordinate of the ending point of the line.
   */
  x2?: SVGLengthPercentage;
  /**
   * For <line>, y1 defines the y coordinate of the starting point of the line.
   *
   * @default 0
   */
  y1?: SVGLengthPercentage;
  /**
   * For <line>, y2 defines the y coordinate of the ending point of the line.
   *
   * @default 0
   */
  y2?: SVGLengthPercentage;
}

/**
 * The <linearGradient> SVG element lets authors define linear gradients to apply to other SVG elements
 */
export interface SVGLinearGradientAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationAttribute,
    SVGGradientAttributes,
    SVGHrefAttribute {
  /**
   * For <linearGradient>, x1 defines the x coordinate of the starting point of the gradient vector used to map the gradient stop values. The exact behavior of this attribute is influenced by the gradientUnits attributes
   *
   * @default 0%
   */
  x1?: SVGLengthPercentage;
  /**
   * For <linearGradient>, x2 defines the x coordinate of the ending point of the gradient vector used to map the gradient stop values. The exact behavior of this attribute is influenced by the gradientUnits attributes
   *
   * @default 100%
   */
  x2?: SVGLengthPercentage;
  /**
   * For <linearGradient>, y1 defines the y coordinate of the starting point of the gradient vector used to map the gradient stop values. The exact behavior of this attribute is influenced by the gradientUnits attributes
   *
   * @default 0%
   */
  y1?: SVGLengthPercentage;
  /**
   * For <linearGradient>, y2 defines the y coordinate of the ending point of the gradient vector used to map the gradient stop values. The exact behavior of this attribute is influenced by the gradientUnits attributes
   *
   * @default 0%
   */
  y2?: SVGLengthPercentage;
}

/**
 * The <marker> SVG element defines a graphic used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element
 */
export interface SVGMarkerAttributes
  extends
    SVGAttributes,
    SVGClipPathAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGOverflowAttribute,
    SVGPointerEventsAttribute,
    SVGViewBoxAttribute {
  /**
   * The markerHeight attribute represents the height of the viewport into which the <marker> is to be fitted when it is rendered according to the viewBox and preserveAspectRatio attributes
   *
   * @default 3
   */
  markerHeight?: SVGLengthPercentage;
  /**
   * The markerUnits attribute defines the coordinate system for the markerWidth and markerHeight attributes and the contents of the <marker>.
   *
   * @default "strokeWidth"
   */
  markerUnits?: "userSpaceOnUse" | "strokeWidth";
  /**
   * The markerWidth attribute represents the width of the viewport into which the <marker> is to be fitted when it is rendered according to the `viewBox` and `preserveAspectRatio` attributes
   *
   * @default 3
   */
  markerWidth?: SVGLengthPercentage;
  /**
   * The orient attribute indicates how a marker is rotated when it is placed at its position on the shape.
   *
   * @default "auto"
   */
  orient?: "auto" | "auto-start-reverse" | Angle | number;
  /**
   * refX defines the x coordinate of the marker's reference point, which is to be placed exactly at the marker's position on the shape.
   *
   * @default 0
   */
  refX?: SVGLengthPercentage | "left" | "center" | "right";
  /**
   * refY defines the y coordinate of the marker's reference point, which is to be placed exactly at the marker's position on the shape.
   *
   * @default 0
   */
  refY?: SVGLengthPercentage | "top" | "center" | "bottom";
}

/**
 * The <mask> SVG element defines a mask for compositing the current object into the background. A mask is used/referenced using the mask property and CSS mask-image property.
 */
export interface SVGMaskAttributes
  extends
    SVGAttributes,
    SVGClipPathAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGSizeAttributes,
    SVGMaskAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {
  /**
   * The mask-type attribute indicates which mask mode, alpha or luminance, to use for the contents of the <mask> element when masking.
   *
   * @default "luminance"
   */
  "mask-type"?: "alpha" | "luminance";
  /**
   * The maskContentUnits attribute indicates which coordinate system to use for the contents of the <mask> element
   *
   * @default "userSpaceOnUse"
   */
  maskContentUnits?: "userSpaceOnUse" | "objectBoundingBox";
  /**
   * The maskUnits attribute indicates which coordinate system to use for the geometry properties of the <mask> element.
   *
   * @default "objectBoundingBox"
   */
  maskUnits?: "userSpaceOnUse" | "objectBoundingBox";
  /**
   * For <mask>, x defines the x coordinate of the upper left corner of its area of effect. The exact effect of this attribute is influenced by the maskUnits attribute
   *
   * @default -10%
   */
  x?: SVGLengthPercentage;
  /**
   * For <mask>, y defines the y coordinate of the upper left corner of its area of effect. The exact effect of this attribute is influenced by the maskUnits attribute.
   *
   * @default -10%
   */
  y?: SVGLengthPercentage;
}

/**
 * The <metadata> SVG element adds metadata to SVG content. Metadata is structured information about data. The contents of <metadata> should be elements from other XML namespaces such as RDF, FOAF, etc
 */
export interface SVGMetadataAttributes extends SVGAttributes {}

/**
 * The <mpath> SVG sub-element for the <animateMotion> element provides the ability to reference an external <path> element as the definition of a motion path
 */
export interface SVGMpathAttributes extends SVGAttributes, SVGHrefAttribute {}

/**
 * The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element
 */
export interface SVGPathAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFillRuleAttribute,
    SVGFilterAttribute,
    SVGArrowheadAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPathLengthAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGShapeRenderingAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeLineCapAttribute,
    SVGStrokeLineJoinAttribute,
    SVGStrokeMiterLimitAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   * The d attribute defines a path to be drawn.
   */
  d?: string;
}

/**
 * The <pattern> SVG element defines a graphics object which can be redrawn at repeated x- and y-coordinate intervals ("tiled") to cover an area.
 */
export interface SVGPatternAttributes
  extends
    SVGAttributes,
    SVGClipPathAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGSizeAttributes,
    SVGHrefAttribute,
    SVGMaskAttribute,
    SVGOverflowAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute,
    SVGViewBoxAttribute {
  /**
   * The patternContentUnits attribute indicates which coordinate system to use for the contents of the <pattern> element
   *
   * @default "userSpaceOnUse"
   */
  patternContentUnits?: "userSpaceOnUse" | "objectBoundingBox";
  /**
   * The patternTransform attribute defines a list of transform definitions that are applied to a pattern tile.
   */
  patternTransform?: string;
  /**
   * The patternUnits attribute indicates which coordinate system to use for the geometry properties of the <pattern> element
   *
   * @default "objectBoundingBox"
   */
  patternUnits?: "userSpaceOnUse" | "objectBoundingBox";
  /**
   * For <pattern>, x defines the x coordinate of the upper left corner of the tile pattern. The exact effect of this attribute is influenced by the `patternUnits` and `patternTransform` attributes
   *
   * @default 0
   */
  x?: SVGLength;
  /**
   * For <pattern>, y defines the y coordinate of the upper left corner of the tile pattern. The exact effect of this attribute is influenced by the patternUnits and patternTransform attributes.
   *
   * @default 0
   */
  y?: SVGLength;
}

/**
 * The <polygon> SVG element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point
 */
export interface SVGPolygonAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFillRuleAttribute,
    SVGFilterAttribute,
    SVGArrowheadAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPathLengthAttribute,
    SVGPointerEventsAttribute,
    SVGPointsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGShapeRenderingAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeLineCapAttribute,
    SVGStrokeLineJoinAttribute,
    SVGStrokeMiterLimitAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {}

/**
 * The <polyline> SVG element is an SVG basic shape that creates straight lines connecting several points. Typically a polyline is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the <polygon> element
 */
export interface SVGPolylineAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFilterAttribute,
    SVGArrowheadAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPathLengthAttribute,
    SVGPointerEventsAttribute,
    SVGPointsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGShapeRenderingAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeLineCapAttribute,
    SVGStrokeLineJoinAttribute,
    SVGStrokeMiterLimitAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {}

/**
 * The <radialGradient> SVG element lets authors define radial gradients that can be applied to fill or stroke of graphical elements
 */
export interface SVGRadialGradientAttributes
  extends
    SVGAttributes,
    SVGColorInterpolationAttribute,
    SVGCAttributes,
    SVGGradientAttributes,
    SVGHrefAttribute {
  /**
   * The fr attribute defines the radius of the focal point for the radial gradient.
   *
   * @default 0
   */
  fr?: SVGLength;
  /**
   * The fx attribute defines the x-axis coordinate of the focal point for a radial gradient.
   */
  fx?: SVGLength;
  /**
   * The fy attribute defines the y-axis coordinate of the focal point for a radial gradient.
   */
  fy?: SVGLength;
  /**
   * Defines the radius of the end circle for the radial gradient
   *
   * @default 50%
   */
  r?: SVGLengthPercentage;
}

/**
 * The <rect> SVG element is a basic SVG shape that draws rectangles, defined by their position, width, and height. The rectangles may have their corners rounded
 */
export interface SVGRectAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFilterAttribute,
    SVGSizeAttributes,
    SVGArrowheadAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPathLengthAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGRAttributes,
    SVGShapeRenderingAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeLineJoinAttribute,
    SVGStrokeMiterLimitAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   * For <rect>, x defines the x coordinate of the upper left corner of the shape.
   *
   * @default 0
   */
  x?: SVGLengthPercentage;
  /**
   * For <rect>, y defines the y coordinate of the upper left corner of the shape.
   *
   * @default 0
   */
  y?: SVGLengthPercentage;
}

/**
 * The <set> SVG element provides a method of setting the value of an attribute for a specified duration
 */
export interface SVGSetAttributes
  extends
    SVGAttributes,
    SVGAttributeNameAttribute,
    SVGBaseAnimationAttributes,
    SVGFillAttribute,
    SVGHrefAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {}

/**
 * The <stop> SVG element defines a color and its position to use on a gradient. This element is always a child of a <linearGradient> or <radialGradient> element
 */
export interface SVGStopAttributes extends SVGAttributes {
  /**
   * The stop-color attribute indicates what color to use at a gradient stop.
   *
   * @default "black"
   */
  "stop-color"?: string;
  /**
   * The stop-opacity attribute defines the opacity of a given color gradient stop.
   *
   * @default 1
   */
  "stop-opacity"?: number;
}

/**
 * The <svg> SVG element is a container that defines a new coordinate system and viewport. It is used as the outermost element of SVG documents, but it can also be used to embed an SVG fragment inside an SVG or HTML document
 */
export interface SVGSVGAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGSizeAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGOverflowAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute,
    SVGViewBoxAttribute {
  /**
   * The preserveAspectRatio attribute indicates how an element with a viewBox providing a given aspect ratio must fit into a viewport with a different aspect ratio
   */
  preserveAspectRatio?: string;
  /**
   * For <svg>, x defines the x coordinate of the upper left corner of its viewport.
   *
   * @default 0
   */
  x?: SVGLengthPercentage;
  /**
   * For <svg>, y defines the y coordinate of the upper left corner of its viewport.
   *
   * @default 0
   */
  y?: SVGLengthPercentage;
}

/**
 * The <switch> SVG element evaluates any requiredFeatures, requiredExtensions and systemLanguage attributes on its direct child elements in order, and then renders the first child where these attributes evaluate to true
 */
export interface SVGSwitchAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGOpacityAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute {}

/**
 * The <symbol> SVG element is used to define graphical template objects which can be instantiated by a <use> element
 */
export interface SVGSymbolAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGFilterAttribute,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGOverflowAttribute,
    SVGPointerEventsAttribute,
    SVGViewBoxAttribute {
  /**
   * refX defines the x coordinate of the symbol, which is defined by the cumulative effect of the x attribute and any transformations on the <symbol> and its host <use> element
   */
  refX?: SVGLength | "left" | "center" | "right";
  /**
   * refT defines the y coordinate of the symbol, which is defined by the cumulative effect of the y attribute and any transformations on the <symbol> and its host <use> element
   */
  refY?: SVGLength | "top" | "center" | "bottom";
}

/**
 * The <text> SVG element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element
 */
export interface SVGTextAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGDisplayAttribute,
    SVGDAttributes,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFillRuleAttribute,
    SVGFilterAttribute,
    SVGTextualAttributes,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGOverflowAttribute,
    SVGPaintOrderAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeLineCapAttribute,
    SVGStrokeLineJoinAttribute,
    SVGStrokeMiterLimitAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   * The SVG text-overflow attribute specifies how text content block elements render when text overflows line boxes. This can happen, for example, when the white-space attribute or CSS white-space property has the value nowrap. The property does not apply to pre-formatted text or text situated on a path
   *
   * @default "clip"
   */
  "text-overflow"?: "clip" | "ellipses";
  /**
   * The text-rendering attribute provides hints to the renderer about what tradeoffs to make when rendering text.
   *
   * @default "auto"
   */
  "text-rendering"?:
    | "auto"
    | "optimizeSpeed"
    | "optimizeLegibility"
    | "geometricPrecision";
  /**
   * The white-space SVG attribute specifies how white space within text should be handled
   */
  "white-space"?:
    | "normal"
    | "pre"
    | "nowrap"
    | "pre-wrap"
    | "break-space"
    | "pre-line";

  /**
   * For <text>, if it contains a single value, x defines the x coordinate where the content text position must be placed. The content text position is usually a point on the baseline of the first line of text. The exact content text position is influenced by other properties, such as text-anchor or direction
   *
   * If it contains multiple values, x defines the x coordinate of each individual glyph from the text. If there are fewer values than glyphs, the remaining glyphs are placed in line with the last positioned glyph. If there are more values than glyphs, the extra values are ignored.
   *
   * @default 0
   */
  x?: string;
  /**
   * For <text>, if it contains a single value, y defines the y coordinate where the content text position must be placed. The content text position is usually a point on the baseline of the first line of text. The exact content text position is influenced by other properties, such as text-anchor or direction.
   *
   * If it contains multiple values, y defines the y coordinate of each individual glyph from the text. If there are fewer values than glyphs, the remaining glyphs are placed in line with the last positioned glyph. If there are more values than glyphs, the extra values are ignored.
   *
   * @default 0
   */
  y?: string;
}

/**
 * The <textPath> SVG element is used to render text along the shape of a <path> element. The text must be enclosed in the <textPath> element and its href attribute is used to reference the desired <path>.
 */
export interface SVGTextPathAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGBaselineShiftAttribute,
    SVGColorInterpolationAttribute,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFillOpacityAttribute,
    SVGHrefAttribute,
    SVGTextualAttributes,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPathAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeLineCapAttribute,
    SVGStrokeLineJoinAttribute,
    SVGStrokeMiterLimitAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   * The method attribute indicates the method by which text should be rendered along the path of a <textPath> element.
   */
  method?: "align" | "stretch";
  /**
   * The spacing attribute indicates how the user agent should determine the spacing between typographic characters that are to be rendered along a path.
   *
   * @default "exact"
   */
  spacing?: "auto" | "exact";
  /**
   * The startOffset attribute defines an offset from the start of the path for the initial current text position along the path after converting the path to the <textPath> element's coordinate system
   *
   * @default 0
   */
  startOffset?: SVGLengthPercentage;
}

/**
 * The <title> SVG element provides an accessible, short-text description of any SVG container element or graphics element.
 */
export interface SVGTitleAttributes extends SVGAttributes {}

/**
 * The <tspan> SVG element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed
 */
export interface SVGTspanAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGBaselineShiftAttribute,
    SVGColorInterpolationAttribute,
    SVGDAttributes,
    SVGFillAttribute,
    SVGFillOpacityAttribute,
    SVGFillOpacityAttribute,
    SVGTextualAttributes,
    SVGOpacityAttribute,
    SVGPaintOrderAttribute,
    SVGPointerEventsAttribute,
    SVGStrokeAttribute,
    SVGStrokeDashArrayAttribute,
    SVGStrokeDashOffsetAttribute,
    SVGStrokeLineCapAttribute,
    SVGStrokeLineJoinAttribute,
    SVGStrokeMiterLimitAttribute,
    SVGStrokeOpacityAttribute,
    SVGStrokeWidthAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute,
    SVGVisibilityAttribute {
  /**
   *  For <tspan>, if it contains a single value, x defines the x coordinate where the content text position must be placed. The content text position is usually a point on the baseline of the first line of text. The exact content text position is influenced by other properties, such as text-anchor or direction.
   *
   * If it contains multiple values, x defines the x coordinate of each individual glyph from the text. If there are fewer values than glyphs, the remaining glyphs are placed in line with the last positioned glyph. If there are more values than glyphs, the extra values are ignored.
   */
  x?: string;
  /**
   * For <tspan>, if it contains a single value, y defines the y coordinate where the content text position must be placed. The content text position is usually a point on the baseline of the first line of text. The exact content text position is influenced by other properties, such as text-anchor or direction.
   *
   * If it contains multiple values, y defines the y coordinate of each individual glyph from the text. If there are fewer values than glyphs, the remaining glyphs are placed in line with the last positioned glyph. If there are more values than glyphs, the extra values are ignored.
   *
   * @default 0
   */
  y?: string;
}

/**
 * The <use> element takes nodes from within an SVG document, and duplicates them somewhere else. The effect is the same as if the nodes were deeply cloned into a non-exposed DOM, then pasted where the <use> element is, much like cloned <template> elements.
 */
export interface SVGUseAttributes
  extends
    SVGAttributes,
    AriaAttributes,
    SVGClipPathAttribute,
    SVGClipRuleAttribute,
    SVGDisplayAttribute,
    SVGColorInterpolationAttribute,
    SVGCursorAttribute,
    SVGFilterAttribute,
    SVGSizeAttributes,
    SVGHrefAttribute,
    SVGMaskAttribute,
    SVGOpacityAttribute,
    SVGPointerEventsAttribute,
    SVGRequiredExtensionsAttribute,
    SVGSystemLanguageAttribute,
    SVGVectorEffectAttribute {
  /**
   * For <use>, x defines the x coordinate of the upper left corner of the referenced element.
   *
   * @default 0
   */
  x?: SVGLengthPercentage;
  /**
   * For <use>, y defines the y coordinate of the upper left corner of the referenced element.
   *
   * @default 0
   */
  y?: SVGLengthPercentage;
}

/**
 * The <view> SVG element defines a particular view of an SVG document. A specific view can be displayed by referencing the <view> element's id as the target fragment of a URL
 */
export interface SVGViewAttributes
  extends SVGAttributes, AriaAttributes, SVGViewBoxAttribute {}

// MathML

/**
 * Global MathML Attributes
 */
export interface MathMLAttributes {
  /**
   * A boolean attribute that indicates that the element should be focused on page load.
   */
  autofocus?: boolean;
  /**
   * A space-separated list of the classes of the element
   */
  class?: string;
  /**
   * Forms a class of attributes, called custom data attributes, that allow proprietary information to be exchanged between the MathML and its DOM representation that may be used by scripts. All such custom data are available via the `MathMLElement` interface of the element the attribute is set on. The `MathMLElement.dataset` property gives access to them.
   */
  [key: `data-${string}`]: any;
  /**
   * An enumerated attribute indicating the directionality of the MathML element.
   */
  dir?: "ltr" | "rtl";
  /**
   * A boolean setting the math-style for the element which indicates whether MathML equations should render with normal or compact height.
   *
   * - `true`, which means `normal`
   * - `false`, which means `compact`
   */
  displaystyle?: Booleanish;
  /**
   * Makes a MathML element a hyperlink
   */
  href?: string;
  /**
   * Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS).
   */
  id?: string;
  /**
   * A cryptographic nonce ("number used once") which can be used by Content Security Policy to determine whether a given fetch will be allowed to proceed.
   */
  nonce?: string;
  /**
   * Specifies a math-depth for the element. See the scriptlevel page for accepted values and mapping.
   */
  scriptlevel?: number | string;
  /**
   * Contains CSS styling declarations to be applied to the element. Note that it is recommended for styles to be defined in a separate file or files. This attribute and the <style> element have mainly the purpose of allowing for quick styling, for example for testing purposes.
   */
  style?: string;
  /**
   * An integer attribute indicating if the element can take input focus (is focusable), if it should participate to sequential keyboard navigation, and if so, at what position. It can take several values:
   * - a negative value means that the element should be focusable, but should not be reachable via sequential keyboard navigation;
   * - 0 means that the element should be focusable and reachable via sequential keyboard navigation, but its relative order is defined by the platform convention;
   * - a positive value means that the element should be focusable and reachable via sequential keyboard navigation; the order in which the elements are focused is the increasing value of the tabindex. If several elements share the same tabindex, their relative order follows their relative positions in the document.
   */
  tabindex?: number | `-${number}` | `${number}`;
}

/**
 * The <annotation-xml> MathML element contains an annotation to the MathML expression in the XML format, for example Content MathML or SVG.
 */
export interface MathMLAnnotationXMLAttributes extends MathMLAttributes {
  /**
   * The encoding of the semantic information in the annotation (e.g., "application/mathml+xml", "application/mathml-presentation+xml", "application/mathml-content+xml")
   */
  encoding?: string;
}

/**
 * The <annotation> MathML element contains an annotation to the MathML expression in a textual format, for example LaTeX.
 */
export interface MathMLAnnotationAttributes extends MathMLAttributes {
  /**
   * The encoding of the semantic information in the annotation (e.g., "application/x-tex")
   */
  encoding?: string;
}

/**
 * The <math> MathML element is the top-level MathML element, used to write a single mathematical formula. It can be placed in HTML content where flow content is permitted.
 */
export interface MathMLMathAttributes extends MathMLAttributes {
  /**
   * Specifies how the enclosed MathML markup should be rendered. It can have one of the following values
   * - `block`, which means that this element will be displayed in its own block outside the current span of text and with math-style set to normal.
   * - `inline`, which means that this element will be displayed inside the current span of text and with math-style set to compact.
   *
   * @default "inline"
   */
  display?: "block" | "inline";
}

/**
 * The <mfrac> MathML element is used to display fractions. It can also be used to mark up fraction-like objects such as binomial coefficients and Legendre symbols.
 */
export interface MathMLMfracAttributes extends MathMLAttributes {
  /**
   * A <length-percentage> indicating the thickness of the horizontal fraction line.
   */
  linethickness?: LengthPercentage;
}

/**
 * The <mi> MathML element indicates that the content should be rendered as an identifier, such as a function name, variable or symbolic constant.
 */
export interface MathMLMiAttributes extends MathMLAttributes {
  /**
   * The only value allowed in the current specification is normal (case insensitive):
   *
   * - `normal`: Use default/normal rendering, removing automatic styling of single characters to italic.
   */
  mathvariant?: "normal";
}

/**
 * The <mo> MathML element represents an operator in a broad sense. Besides operators in strict mathematical meaning, this element also includes "operators" like parentheses, separators like comma and semicolon, or "absolute value" bars.
 */
export interface MathMLMoAttributes extends MathMLAttributes {
  /**
   * Indicates whether the operator should be treated as an accent when used as an under- or over-script.
   */
  accent?: Booleanish;
  /**
   * A <boolean> indicating whether the operator is a fence (such as parentheses). There is no visual effect for this attribute.
   */
  fence?: Booleanish;
  /**
   * An enumerated attribute specifying how the operator is to be presented. For example, depending on the value, a different amount of space might be rendered on either side of the operator
   */
  form?: "prefix" | "infix" | "postfix";
  /**
   * Whether the operator should be drawn bigger when math-style is set to normal.
   */
  largeop?: Booleanish;
  /**
   * A <length-percentage> indicating the amount of space before the operator
   */
  lspace?: LengthPercentage;
  /**
   * A <length-percentage> indicating the maximum size of the operator when it is stretchy.
   */
  maxsize?: LengthPercentage;
  /**
   * A <length-percentage> indicating the minimum size of the operator when it is stretchy.
   */
  minsize?: LengthPercentage;
  /**
   * A <boolean> indicating whether attached under- and overscripts move to sub- and superscript positions when math-style is set to compact.
   */
  movablelimits?: Booleanish;
  /**
   * A <length-percentage> indicating the amount of space after the operator.
   */
  rspace?: LengthPercentage;
  /**
   * A <boolean> indicating whether the operator is a separator (such as commas). There is no visual effect for this attribute.
   */
  separator?: Booleanish;
  /**
   * A <boolean> indicating whether the operator stretches to the size of the adjacent element.
   */
  stretchy?: Booleanish;
  /**
   * A <boolean> indicating whether a stretchy operator should be vertically symmetric around the imaginary math axis (centered fraction line).
   */
  symmetric?: Booleanish;
}

/**
 * The <mover> MathML element is used to attach an accent or a limit over an expression. Use the following syntax: <mover> base overscript </mover>
 */
export interface MathMLMoverAttributes extends MathMLAttributes {
  /**
   * A <boolean> indicating whether the over script should be treated as an accent (i.e., drawn bigger and closer to the base expression).
   */
  accent?: Booleanish;
}

/**
 * The <mpadded> MathML element is used to add extra padding and to set the general adjustment of position and size of enclosed contents.
 */
export interface MathMLMpaddedAttributes extends MathMLAttributes {
  /**
   * A <length-percentage> indicating the desired depth (below the baseline) of the <mpadded> element.
   */
  depth?: LengthPercentage;
  /**
   * A <length-percentage> indicating the desired height (above the baseline) of the <mpadded> element.
   */
  height?: LengthPercentage;
  /**
   * A <length-percentage> indicating the horizontal location of the positioning point of the child content with respect to the positioning point of the <mpadded> element
   */
  lspace?: LengthPercentage;
  /**
   * A <length-percentage> indicating the vertical location of the positioning point of the child content with respect to the positioning point of the <mpadded> element.
   */
  voffset?: LengthPercentage;
  /**
   * A <length-percentage> indicating the desired horizontal length of the <mpadded> element.
   */
  width?: LengthPercentage;
}

/**
 * The <mspace> MathML element is used to display a blank space, whose size is set by its attributes
 */
export interface MathMLMspaceAttributes extends MathMLAttributes {
  /**
   *  A <length-percentage> indicating the desired depth (below the baseline) of the space.
   */
  depth?: LengthPercentage;
  /**
   * A <length-percentage> indicating the desired height (above the baseline) of the space.
   */
  height?: LengthPercentage;
  /**
   * A <length-percentage> indicating the desired width of the space.
   */
  width?: LengthPercentage;
}

/**
 * Specifies vertical alignment
 */
export type MathMLAlign = "axis" | "baseline" | "bottom" | "center" | "top";

/**
 * The <mtable> MathML element allows you to create tables or matrices
 */
export interface MathMLMtableAttributes extends MathMLAttributes {
  /**
   * Specifies the vertical alignment of the table with respect to its environment. Possible values are:
   *
   * - axis (default): The vertical center of the table aligns on the environment's axis (typically the minus sign).
   * - baseline: The vertical center of the table aligns on the environment's baseline.
   * - bottom: The bottom of the table aligns on the environments baseline.
   * - center: See baseline.
   * - top: The top of the table aligns on the environments baseline.

    In addition, values of the align attribute can end with a row number (e.g., align="center 3"). This allows you to align the specified row of the table rather than the whole table. A negative Integer value counts rows from the bottom of the table.

    @default "axis"
   */
  align?: MathMLAlign | `${MathMLAlign} ${number}`;
  /**
   * Specifies the horizontal alignment of the cells. Multiple values separated by space are allowed and apply to the corresponding columns (e.g., columnalign="left right center"). Possible values are: left, center (default) and right.
   */
  columnalign?: string;
  /**
   * Specifies column borders. Multiple values separated by space are allowed and apply to the corresponding columns (e.g., columnlines="none none solid"). Possible values are: none (default), solid and dashed.
   */
  columnlines?: string;
  /**
   * Specifies the space between table columns. Multiple values separated by space are allowed and apply to the corresponding columns (e.g., columnspacing="1em 2em"). Possible values are <length-percentage>.
   */
  columnspacing?: string;
  /**
   * Specifies borders of the entire table.
   *
   * @default "none"
   */
  frame?: "none" | "solid" | "dashed";
  /**
   * Specifies additional space added between the table and frame. The first value specifies the spacing on the right and left; the second value specifies the spacing above and below. Possible values are <length-percentage>.
   */
  framespacing?: `${LengthPercentage} ${LengthPercentage}`;
  /**
   * Specifies the vertical alignment of the cells. Multiple values separated by space are allowed and apply to the corresponding rows (e.g., rowalign="top bottom axis"). Possible values are: axis, baseline (default), bottom, center and top.
   */
  rowalign?: string;
  /**
   * Specifies row borders. Multiple values separated by space are allowed and apply to the corresponding rows (e.g., rowlines="none none solid"). Possible values are: none (default), solid and dashed.
   *
   * @default "none"
   */
  rowlines?: string;
  /**
   * Specifies the space between table rows. Multiple values separated by space are allowed and apply to the corresponding rows (e.g., rowspacing="1em 2em"). Possible values are <length-percentage>.
   */
  rowspacing?: string;
  /**
   * A <length-percentage> indicating the width of the entire table.
   */
  width?: LengthPercentage;
}

/**
 * The <mtd> MathML element represents a cell in a table or a matrix. It may only appear in a <mtr> element. This element is similar to the <td> element of HTML.
 */
export interface MathMLMtdAttributes extends MathMLAttributes {
  /**
   * A non-negative integer value that indicates on how many columns does the cell extend.
   */
  columnspan?: number;
  /**
   * A non-negative integer value that indicates on how many rows does the cell extend.
   */
  rowspan?: number;
  /**
   * Specifies the horizontal alignment of this cell and overrides values specified by <mtable> or <mtr>. Possible values are: left, center and right
   */
  columnalign?: "left" | "center" | "right";
  /**
   * Specifies the vertical alignment of this cell and overrides values specified by <mtable> or <mtr>.
   */
  rowalign?: MathMLAlign;
}

/**
 * The <mtr> MathML element represents a row in a table or a matrix. It may only appear in a <mtable> element and its children are <mtd> elements representing cells. This element is similar to the <tr> element of HTML.
 */
export interface MathMLMtrAttributes extends MathMLAttributes {
  /**
   * Overrides the horizontal alignment of cells specified by <mtable> for this row. Multiple values separated by space are allowed and apply to the corresponding columns (e.g., columnalign="left center right"). Possible values are: left, center and right.
   */
  columnalign?: string;
  /**
   * Overrides the vertical alignment of cells specified by <mtable> for this row
   */
  rowalign?: MathMLAlign;
}

/**
 * The <munder> MathML element is used to attach an accent or a limit under an expression. It uses the following syntax: <munder> base underscript </munder>
 */
export interface MathMLMunderAttributes extends MathMLAttributes {
  /**
   * A <boolean> indicating whether the under script should be treated as an accent (i.e., drawn bigger and closer to the base expression).
   */
  accentunder?: Booleanish;
}

/**
 * The <munderover> MathML element is used to attach accents or limits both under and over an expression.
 * It uses the following syntax: <munderover> base underscript overscript </munderover>
 */
export interface MathMLMunderoverAttributes extends MathMLAttributes {
  /**
   * A <boolean> indicating whether the over script should be treated as an accent (i.e., drawn bigger and closer to the base expression).
   */
  accent?: Booleanish;
  /**
   * A <boolean> indicating whether the under script should be treated as an accent (i.e., drawn bigger and closer to the base expression).
   */
  accentunder?: Booleanish;
}

/**
 * All DOM Elements
 *
 * @internal
 */
export interface DOMAttributesTagNameMap {
  a: HTMLAnchorAttributes;
  abbr: HTMLAttributes;
  address: HTMLAttributes;
  area: HTMLAreaAttributes;
  article: HTMLAttributes;
  aside: HTMLAttributes;
  audio: HTMLAudioAttributes;
  b: HTMLAttributes;
  base: HTMLBaseAttributes;
  bdi: HTMLAttributes;
  bdo: HTMLBDOAttributes;
  blockquote: HTMLBlockquoteAttributes;
  body: HTMLAttributes;
  br: HTMLAttributes;
  button: HTMLButtonAttributes;
  canvas: HTMLCanvasAttributes;
  caption: HTMLAttributes;
  cite: HTMLAttributes;
  code: HTMLAttributes;
  col: HTMLColAttributes;
  colgroup: HTMLColgroupAttributes;
  data: HTMLDataAttributes;
  datalist: HTMLAttributes;
  dd: HTMLAttributes;
  del: HTMLDelAttributes;
  details: HTMLDetailsAttributes;
  dfn: HTMLAttributes;
  dialog: HTMLDialogAttributes;
  div: HTMLAttributes;
  dl: HTMLAttributes;
  dt: HTMLAttributes;
  em: HTMLAttributes;
  embed: HTMLEmbedAttributes;
  fieldset: HTMLFieldsetAttributes;
  figcaption: HTMLAttributes;
  figure: HTMLAttributes;
  footer: HTMLAttributes;
  form: HTMLFormAttributes;
  h1: HTMLAttributes;
  h2: HTMLAttributes;
  h3: HTMLAttributes;
  h4: HTMLAttributes;
  h5: HTMLAttributes;
  h6: HTMLAttributes;
  head: HTMLAttributes;
  header: HTMLAttributes;
  hgroup: HTMLAttributes;
  hr: HTMLAttributes;
  html: HTMLHtmlAttributes;
  i: HTMLAttributes;
  iframe: HTMLIframeAttributes;
  img: HTMLImgAttributes;
  input: HTMLInputAttributes;
  ins: HTMLInsAttributes;
  kbd: HTMLAttributes;
  label: HTMLLabelAttributes;
  legend: HTMLAttributes;
  li: HTMLLiAttributes;
  link: HTMLLinkAttributes;
  main: HTMLAttributes;
  map: HTMLMapAttributes;
  mark: HTMLAttributes;
  menu: HTMLAttributes;
  meta: HTMLMetaAttributes;
  meter: HTMLMeterAttributes;
  nav: HTMLAttributes;
  noscript: HTMLAttributes;
  object: HTMLObjectAttributes;
  ol: HTMLOlAttributes;
  optgroup: HTMLOptgroupAttributes;
  option: HTMLOptionAttributes;
  output: HTMLOutputAttributes;
  p: HTMLAttributes;
  picture: HTMLAttributes;
  pre: HTMLAttributes;
  progress: HTMLProgressAttributes;
  q: HTMLQuoteAttributes;
  rp: HTMLAttributes;
  rt: HTMLAttributes;
  ruby: HTMLAttributes;
  s: HTMLAttributes;
  samp: HTMLAttributes;
  slot: HTMLSlotAttributes;
  script: HTMLScriptAttributes;
  search: HTMLAttributes;
  section: HTMLAttributes;
  select: HTMLSelectAttributes;
  small: HTMLAttributes;
  source: HTMLSourceAttributes;
  span: HTMLAttributes;
  strong: HTMLAttributes;
  style: HTMLStyleAttributes;
  sub: HTMLAttributes;
  summary: HTMLAttributes;
  sup: HTMLAttributes;
  table: HTMLAttributes;
  template: HTMLTemplateAttributes;
  tbody: HTMLAttributes;
  td: HTMLTdAttributes;
  textarea: HTMLTextareaAttributes;
  tfoot: HTMLAttributes;
  th: HTMLThAttributes;
  thead: HTMLAttributes;
  time: HTMLTimeAttributes;
  title: HTMLAttributes;
  tr: HTMLAttributes;
  track: HTMLTrackAttributes;
  u: HTMLAttributes;
  ul: HTMLAttributes;
  var: HTMLAttributes;
  video: HTMLVideoAttributes;
  wbr: HTMLAttributes;

  // SVG
  svg: SVGSVGAttributes;

  animate: SVGAnimateAttributes;
  animateMotion: SVGAnimateMotionAttributes;
  animateTransform: SVGAnimateTransformAttributes;
  circle: SVGCircleAttributes;
  clipPath: SVGClipPathAttributes;
  defs: SVGDefsAttributes;
  desc: SVGDescAttributes;
  ellipse: SVGEllipseAttributes;
  feBlend: SVGfeBlendAttributes;
  feColorMatrix: SVGfeColorMatrixAttributes;
  feComponentTransfer: SVGfeComponentTransferAttributes;
  feComposite: SVGfeCompositeAttributes;
  feConvolveMatrix: SVGfeConvolveMatrixAttributes;
  feDiffuseLighting: SVGfeDiffuseLightingAttributes;
  feDisplacementMap: SVGfeDisplacementMapAttributes;
  feDistantLight: SVGfeDistantLightAttributes;
  feDropShadow: SVGfeDropShadowAttributes;
  feFlood: SVGfeFloodAttributes;
  feFuncA: SVGfeFuncAAttributes;
  feFuncB: SVGfeFuncBAttributes;
  feFuncG: SVGfeFuncGAttributes;
  feFuncR: SVGfeFuncRAttributes;
  feGaussianBlur: SVGfeGaussianBlurAttributes;
  feImage: SVGfeImageAttributes;
  feMerge: SVGfeMergeAttributes;
  feMergeNode: SVGfeMergeNodeAttributes;
  feMorphology: SVGfeMorphologyAttributes;
  feOffset: SVGfeOffsetAttributes;
  fePointLight: SVGfePointLightAttributes;
  feSpecularLighting: SVGfeSpecularLightingAttributes;
  feSpotLight: SVGfeSpotLightAttributes;
  feTile: SVGfeTileAttributes;
  feTurbulence: SVGfeTurbulenceAttributes;
  filter: SVGFilterAttributes;
  foreignObject: SVGForeignObjectAttributes;
  g: SVGGAttributes;
  image: SVGImageAttributes;
  line: SVGLineAttributes;
  linearGradient: SVGLinearGradientAttributes;
  marker: SVGMarkerAttributes;
  mask: SVGMaskAttributes;
  metadata: SVGMetadataAttributes;
  mpath: SVGMpathAttributes;
  path: SVGPathAttributes;
  pattern: SVGPatternAttributes;
  polygon: SVGPolygonAttributes;
  polyline: SVGPolylineAttributes;
  radialGradient: SVGRadialGradientAttributes;
  rect: SVGRectAttributes;
  stop: SVGStopAttributes;
  switch: SVGSwitchAttributes;
  symbol: SVGSymbolAttributes;
  text: SVGTextAttributes;
  textPath: SVGTextPathAttributes;
  tspan: SVGTspanAttributes;
  use: SVGUseAttributes;
  view: SVGViewAttributes;

  // MathML

  annotation: MathMLAnnotationAttributes;
  "annotation-xml": MathMLAnnotationXMLAttributes;
  math: MathMLMathAttributes;
  merror: MathMLAttributes;
  mfrac: MathMLMfracAttributes;
  mi: MathMLMiAttributes;
  mmultiscripts: MathMLAttributes;
  mn: MathMLAttributes;
  mo: MathMLMoAttributes;
  mover: MathMLMoverAttributes;
  mpadded: MathMLMpaddedAttributes;
  mphantom: MathMLAttributes;
  mprescripts: MathMLAttributes;
  mroot: MathMLAttributes;
  mrow: MathMLAttributes;
  ms: MathMLAttributes;
  mspace: MathMLMspaceAttributes;
  msqrt: MathMLAttributes;
  mstyle: MathMLAttributes;
  msub: MathMLAttributes;
  msubsup: MathMLAttributes;
  msup: MathMLAttributes;
  mtable: MathMLMtableAttributes;
  mtd: MathMLMtdAttributes;
  mtext: MathMLAttributes;
  mtr: MathMLMtrAttributes;
  munder: MathMLMunderAttributes;
  munderover: MathMLMunderoverAttributes;
  semantics: MathMLAttributes;
}
