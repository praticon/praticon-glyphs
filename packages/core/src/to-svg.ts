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

const ATTR_NAME_RE = /^[a-zA-Z_:][\w:.-]*$/;

const serialise = (attrs: Readonly<Record<string, string | number>>) =>
  Object.entries(attrs)
    .map(([key, value]) => {
      if (!ATTR_NAME_RE.test(key)) throw new Error(`Invalid SVG attribute name ${JSON.stringify(key)}`);
      return ` ${key}="${escape(value)}"`;
    })
    .join("");

/** Renders an icon to an SVG markup string, for plain HTML or server templates. */
export function toSvg(name: IconName, options: ToSvgOptions = {}): string {
  if (!Object.hasOwn(icons, name)) throw new Error(`Unknown Praticon icon "${name}"`);
  const node = icons[name];
  const { size = 24, color = "currentColor", strokeWidth = 2, attrs = {} } = options;
  // Decorative by default; becomes an image with an accessible name when labelled.
  const labelled = Boolean(attrs["aria-label"] || attrs["aria-labelledby"]);
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
    ...(labelled ? { role: "img" } : { "aria-hidden": "true" }),
    ...attrs,
  });
  const children = node.map(([tag, childAttrs]) => `<${tag}${serialise(childAttrs)}/>`).join("");
  return `<svg${root}>${children}</svg>`;
}
