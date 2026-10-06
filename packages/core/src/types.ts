import type { categories } from "./categories.js";

/** A single SVG child element: `[tagName, attributes]`. */
export type IconNode = ReadonlyArray<readonly [tag: string, attrs: Readonly<Record<string, string>>]>;

export type IconCategory = (typeof categories)[number];

export interface IconMetadata {
  name: string;
  category: IconCategory;
  tags: readonly string[];
  aliases: readonly string[];
  tier: "free";
  /** Version the icon first shipped in. */
  since: string;
}
