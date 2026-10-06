import { icons, type IconName } from "./generated/icons.js";

export interface ToSvgOptions {
  /** Width and height. @default 24 */
  size?: number | string;
  /** Stroke colour. @default "currentColor" */
  color?: string;
  /** Stroke width in viewBox units. @default 2 */
  strokeWidth?: number | string;
  /** Extra attributes for the <svg> element, e.g. `{ class: "icon" }`. */
  attrs?: Record<string, string | number>;
}

const escape = (value: string | number) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const serialise = (attrs: Readonly<Record<string, string | number>>) =>
  Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${escape(value)}"`)
    .join("");

/** Renders an icon to an SVG markup string, for plain HTML or server templates. */
export function toSvg(name: IconName, options: ToSvgOptions = {}): string {
  const node = icons[name];
  if (!node) throw new Error(`Unknown Praticon icon "${name}"`);
  const { size = 24, color = "currentColor", strokeWidth = 2, attrs = {} } = options;
  const root = serialise({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    "stroke-width": strokeWidth,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    ...attrs,
  });
  const children = node.map(([tag, childAttrs]) => `<${tag}${serialise(childAttrs)}/>`).join("");
  return `<svg${root}>${children}</svg>`;
}
