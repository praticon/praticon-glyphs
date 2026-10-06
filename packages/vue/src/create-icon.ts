import { h, type FunctionalComponent, type SVGAttributes } from "vue";
import { toPascalCase } from "./to-pascal-case.js";

/**
 * A single SVG child element: `[tagName, attributes]`. Mirrors `IconNode` in
 * @praticon-glyphs/core so this package has no runtime dependency on it.
 */
export type IconNode = ReadonlyArray<readonly [tag: string, attrs: Readonly<Record<string, string>>]>;

export interface IconProps extends /* @vue-ignore */ SVGAttributes {
  /** Width and height, in px or any CSS length. @default 24 */
  size?: number | string;
  /** Stroke colour. @default "currentColor" */
  color?: string;
  /** Stroke width in viewBox units (the icon is drawn on a 24×24 grid). @default 2 */
  strokeWidth?: number | string;
}

export type PraticonIcon = FunctionalComponent<IconProps>;

/**
 * Builds an icon component from its SVG children. Used by the generated icons,
 * and exported so you can wrap your own 24×24 stroke icons in the same API.
 */
export function createIcon(name: string, node: IconNode): PraticonIcon {
  const Icon: PraticonIcon = ({ size = 24, color = "currentColor", strokeWidth = 2 }, { attrs, slots }) => {
    const { class: className, ...rest } = attrs;
    // Decorative by default; becomes an image with an accessible name when labelled.
    const labelled = Boolean(rest["aria-label"] || rest["aria-labelledby"]);
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        "stroke-width": strokeWidth,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: ["praticon", `praticon-${name}`, className],
        ...(labelled ? { role: "img" } : { "aria-hidden": "true" }),
        ...rest,
      },
      [...node.map(([tag, attrs]) => h(tag, attrs)), slots.default?.()],
    );
  };
  Icon.props = { size: [Number, String], color: String, strokeWidth: [Number, String] };
  // The class is merged above, so Vue must not add the attributes a second time.
  Icon.inheritAttrs = false;
  Icon.displayName = toPascalCase(name);
  return Icon;
}
