import type { Snippet } from "svelte";
import type { SVGAttributes } from "svelte/elements";

/**
 * A single SVG child element: `[tagName, attributes]`. Mirrors `IconNode` in
 * @praticon-glyphs/core so this package has no runtime dependency on it.
 */
export type IconNode = ReadonlyArray<readonly [tag: string, attrs: Readonly<Record<string, string>>]>;

// `name` is left out: on an icon it is the icon's name, not the rarely used SVG attribute.
export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "name"> {
  /** Width and height, in px or any CSS length. @default 24 */
  size?: number | string;
  /** Stroke colour. @default "currentColor" */
  color?: string;
  /** Stroke width in viewBox units (the icon is drawn on a 24×24 grid). @default 2 */
  strokeWidth?: number | string;
  /** Extra SVG content, such as a `<title>`. */
  children?: Snippet;
}
