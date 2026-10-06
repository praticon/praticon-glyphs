import { categories, type IconCategory } from "@praticon-glyphs/core";
import { DEFAULT_STYLE, type IconStyle } from "./snippets.ts";

/** The parts of the browse view that a link can carry. Saved icons stay out: they are private to each visitor. */
export interface View {
  query: string;
  category?: IconCategory;
  style: IconStyle;
}

export const SIZE = { min: 16, max: 48, step: 4 } as const;
export const STROKE = { min: 1, max: 3, step: 0.25 } as const;

const onStep = (value: number, { min, max, step }: { min: number; max: number; step: number }) =>
  Number.isFinite(value) && value >= min && value <= max && Number.isInteger((value - min) / step);

/**
 * Reads a view from a query string such as `?q=arrow&category=code&size=32&stroke=1.5&color=2563eb`.
 * Only the parts present and valid are returned, so a hand-edited link never breaks the page.
 */
export function parseView(search: string): Partial<View> {
  const params = new URLSearchParams(search);
  const view: Partial<View> = {};

  const query = params.get("q")?.trim();
  if (query) view.query = query.slice(0, 100);

  const category = params.get("category");
  if (categories.includes(category as IconCategory)) view.category = category as IconCategory;

  const size = Number(params.get("size"));
  const strokeWidth = Number(params.get("stroke"));
  const color = params.get("color")?.toLowerCase();
  const style: Partial<IconStyle> = {};
  if (params.has("size") && onStep(size, SIZE)) style.size = size;
  if (params.has("stroke") && onStep(strokeWidth, STROKE)) style.strokeWidth = strokeWidth;
  if (color && /^[0-9a-f]{6}$/.test(color)) style.color = `#${color}`;
  if (Object.keys(style).length) view.style = { ...DEFAULT_STYLE, ...style };

  return view;
}

/** The query string for a view, listing only what differs from the defaults ("" when nothing does). */
export function viewSearch({ query, category, style }: View): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category) params.set("category", category);
  if (style.size !== DEFAULT_STYLE.size) params.set("size", String(style.size));
  if (style.strokeWidth !== DEFAULT_STYLE.strokeWidth) params.set("stroke", String(style.strokeWidth));
  if (style.color) params.set("color", style.color.slice(1).toLowerCase());
  const search = params.toString();
  return search ? `?${search}` : "";
}
