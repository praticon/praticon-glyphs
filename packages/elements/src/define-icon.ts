/**
 * A single SVG child element: `[tagName, attributes]`. Mirrors `IconNode` in
 * @praticon-glyphs/core so this package has no runtime dependency on it.
 */
export type IconNode = ReadonlyArray<readonly [tag: string, attrs: Readonly<Record<string, string>>]>;

const SVG_NS = "http://www.w3.org/2000/svg";
const LABELS = ["aria-label", "aria-labelledby"];

// Server rendering has no DOM. The modules still load there; nothing is registered.
const Base: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);

/**
 * The element behind every Praticon icon. Attributes mirror the framework
 * packages' props: `size` (default 24), `color` (default currentColor) and
 * `stroke-width` (default 2). The icon is hidden from assistive technology
 * unless it has an `aria-label` or `aria-labelledby`, which makes it an image.
 */
export class PraticonElement extends Base {
  static readonly observedAttributes = ["size", "color", "stroke-width", ...LABELS];
  /** The kebab-case icon name, e.g. `arrow-left`. */
  static iconName = "";
  static node: IconNode = [];

  #svg?: SVGSVGElement;
  /** Accessibility attributes this element added itself, so they can be taken back. */
  #added = new Set<string>();

  get size(): string {
    return this.getAttribute("size") ?? "24";
  }
  set size(value: number | string) {
    this.setAttribute("size", String(value));
  }

  get color(): string {
    return this.getAttribute("color") ?? "currentColor";
  }
  set color(value: string) {
    this.setAttribute("color", value);
  }

  get strokeWidth(): string {
    return this.getAttribute("stroke-width") ?? "2";
  }
  set strokeWidth(value: number | string) {
    this.setAttribute("stroke-width", String(value));
  }

  connectedCallback() {
    if (!this.#svg) this.#render();
    this.#update();
  }

  attributeChangedCallback() {
    if (this.#svg) this.#update();
  }

  #render() {
    const { iconName, node } = this.constructor as typeof PraticonElement;
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    // line-height 0 keeps the box the size of the icon, as an inline <svg> would be.
    style.textContent = ":host{display:inline-block;line-height:0}:host([hidden]){display:none}svg{display:block}";
    const svg = document.createElementNS(SVG_NS, "svg");
    for (const [key, value] of Object.entries({
      viewBox: "0 0 24 24",
      fill: "none",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      part: "svg",
      class: `praticon praticon-${iconName}`,
      // The host carries the accessible name; the drawing itself is never announced.
      "aria-hidden": "true",
    })) {
      svg.setAttribute(key, value);
    }
    for (const [tag, attrs] of node) {
      const child = document.createElementNS(SVG_NS, tag);
      for (const [key, value] of Object.entries(attrs)) child.setAttribute(key, value);
      svg.append(child);
    }
    root.replaceChildren(style, svg);
    this.#svg = svg;
  }

  #update() {
    const svg = this.#svg!;
    // Bare numbers are pixels; any other CSS length passes through.
    const size = /^\d+(\.\d+)?$/.test(this.size) ? `${this.size}px` : this.size;
    svg.style.width = svg.style.height = size;
    svg.setAttribute("stroke", this.color);
    svg.setAttribute("stroke-width", this.strokeWidth);

    const labelled = LABELS.some((name) => this.getAttribute(name));
    this.#set("aria-hidden", labelled ? null : "true");
    this.#set("role", labelled ? "img" : null);
  }

  /** Sets or removes a host attribute, never touching one the page set itself. */
  #set(name: string, value: string | null) {
    if (this.hasAttribute(name) && !this.#added.has(name)) return;
    if (value === null) {
      this.removeAttribute(name);
      this.#added.delete(name);
    } else {
      this.setAttribute(name, value);
      this.#added.add(name);
    }
  }
}

/**
 * Creates the element class for an icon and registers it as `tagName`
 * (`praticon-<name>` by default) in the browser. Used by the generated icons,
 * and exported so you can wrap your own 24×24 stroke icons in the same API.
 */
export function defineIcon(name: string, node: IconNode, tagName = `praticon-${name}`): typeof PraticonElement {
  const Icon = class extends PraticonElement {
    static override iconName = name;
    static override node = node;
  };
  // Two copies of the package on one page must not both claim the tag.
  if (globalThis.customElements && !customElements.get(tagName)) customElements.define(tagName, Icon);
  return Icon;
}
