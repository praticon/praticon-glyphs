import { createElement, forwardRef } from "react";
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";
import { toPascalCase } from "./to-pascal-case.js";

/**
 * A single SVG child element: `[tagName, attributes]`. Mirrors `IconNode` in
 * @praticon-glyphs/core so this package has no runtime dependency on it.
 */
export type IconNode = ReadonlyArray<readonly [tag: string, attrs: Readonly<Record<string, string>>]>;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** Width and height, in px or any CSS length. @default 24 */
  size?: number | string;
  /** Stroke colour. @default "currentColor" */
  color?: string;
  /** Stroke width in viewBox units (the icon is drawn on a 24×24 grid). @default 2 */
  strokeWidth?: number | string;
}

export type PraticonIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

/**
 * Builds an icon component from its SVG children. Used by the generated icons,
 * and exported so you can wrap your own 24×24 stroke icons in the same API.
 */
export function createIcon(name: string, node: IconNode): PraticonIcon {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function PraticonIcon(
    { size = 24, color = "currentColor", strokeWidth = 2, className, children, ...rest },
    ref,
  ) {
    // Decorative by default; becomes an image with an accessible name when labelled.
    const labelled = Boolean(rest["aria-label"] || rest["aria-labelledby"]);
    return createElement(
      "svg",
      {
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: ["praticon", `praticon-${name}`, className].filter(Boolean).join(" "),
        ...(labelled ? { role: "img" } : { "aria-hidden": true }),
        ...rest,
      },
      ...node.map(([tag, attrs]) => createElement(tag, attrs)),
      children,
    );
  });
  Icon.displayName = toPascalCase(name);
  return Icon;
}
