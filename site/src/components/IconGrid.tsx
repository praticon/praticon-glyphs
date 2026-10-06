import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import type { IconMetadata } from "@praticon-glyphs/core";
import * as allIcons from "@praticon-glyphs/react";
import { CopyIcon, type PraticonIcon } from "@praticon-glyphs/react";
import { isPlainClick } from "../browser.ts";
import { columnCount, nextIndex } from "../grid-nav.ts";
import { iconPath } from "../routes.ts";
import { FORMATS, componentName, type Format, type IconStyle } from "../snippets.ts";
import { Star } from "../ui-icons.ts";

const components = allIcons as unknown as Record<string, PraticonIcon>;
export const iconComponent = (name: string) => components[componentName(name)];

export function IconGrid({
  base,
  icons,
  selected,
  saved,
  style,
  onSelect,
  format,
  onCopyCode,
  onToggleSaved,
}: {
  base: string;
  icons: IconMetadata[];
  selected?: string;
  saved: ReadonlySet<string>;
  style: IconStyle;
  onSelect: (name: string | undefined) => void;
  format: Format;
  onCopyCode: (name: string) => void;
  onToggleSaved: (name: string) => void;
}) {
  const formatLabel = FORMATS.find(([f]) => f === format)![1];
  /** Arrow keys move between tiles, Home/End jump to the ends, C copies the focused icon. */
  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const tile = (event.target as HTMLElement).closest<HTMLAnchorElement>("a.tile");
    if (!tile || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "c" || event.key === "C") {
      event.preventDefault();
      event.stopPropagation();
      onCopyCode(tile.dataset.name!);
      return;
    }
    const tiles = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a.tile"));
    const next = nextIndex(tiles.indexOf(tile), event.key, tiles.length, columnCount(tiles));
    if (next === undefined) return;
    event.preventDefault();
    // Scroll instantly: the page's smooth scrolling would make key presses feel sluggish.
    tiles[next].focus({ preventScroll: true });
    tiles[next].scrollIntoView({ block: "nearest", behavior: "instant" });
  };

  return (
    <ul className="grid" style={{ color: style.color }} onKeyDown={onKeyDown}>
      {icons.map((icon, index) => {
        const Icon = iconComponent(icon.name);
        const isSaved = saved.has(icon.name);
        return (
          <li key={icon.name} className="tile-cell" style={{ "--n": Math.min(index, 30) } as CSSProperties}>
            <a
              className="tile"
              data-name={icon.name}
              href={iconPath(base, icon.name)}
              aria-current={icon.name === selected ? "page" : undefined}
              onClick={(event: MouseEvent) => {
                if (!isPlainClick(event)) return;
                event.preventDefault();
                onSelect(icon.name === selected ? undefined : icon.name);
              }}
            >
              <span className="tile-icon">
                <Icon size={style.size} strokeWidth={style.strokeWidth} aria-hidden="true" />
              </span>
              <span className="tile-name mono">{icon.name}</span>
            </a>
            <div className="tile-actions">
              <button
                type="button"
                className="tile-action tile-copy"
                tabIndex={-1}
                aria-label={`Copy ${componentName(icon.name)} as ${formatLabel}`}
                title={`Copy ${formatLabel}`}
                onClick={() => onCopyCode(icon.name)}
              >
                <CopyIcon size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="tile-action tile-save"
                tabIndex={-1}
                aria-pressed={isSaved}
                aria-label={isSaved ? `Remove ${icon.name} from saved` : `Save ${icon.name}`}
                title={isSaved ? "Saved" : "Save"}
                onClick={() => onToggleSaved(icon.name)}
              >
                <Star size={14} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
