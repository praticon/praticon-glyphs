import type { IconCategory, IconMetadata } from "@praticon-glyphs/core";

/** Lower is better. Icons that do not match get no rank. */
function rank(icon: IconMetadata, term: string): number | undefined {
  if (icon.name === term) return 0;
  if (icon.name.startsWith(term)) return 1;
  if (icon.name.split("-").some((part) => part.startsWith(term))) return 2;
  if (icon.aliases.some((alias) => alias.startsWith(term))) return 3;
  if (icon.tags.some((tag) => tag.startsWith(term))) return 4;
  if (icon.name.includes(term)) return 5;
  if (icon.tags.some((tag) => tag.includes(term))) return 6;
  return undefined;
}

/**
 * Filters icons by category and a free-text query matched against names,
 * aliases and tags. Every word in the query must match; results are ordered
 * by how well the weakest word matched, then by name.
 */
export function searchIcons(
  icons: readonly IconMetadata[],
  query: string,
  category?: IconCategory,
): IconMetadata[] {
  const terms = query.toLowerCase().trim().split(/[\s,]+/).filter(Boolean);
  const scored: Array<[IconMetadata, number]> = [];
  for (const icon of icons) {
    if (category && icon.category !== category) continue;
    let worst = 0;
    let matched = true;
    for (const term of terms) {
      const r = rank(icon, term);
      if (r === undefined) {
        matched = false;
        break;
      }
      worst = Math.max(worst, r);
    }
    if (matched) scored.push([icon, worst]);
  }
  return scored
    .sort(([a, ra], [b, rb]) => ra - rb || a.name.localeCompare(b.name))
    .map(([icon]) => icon);
}
