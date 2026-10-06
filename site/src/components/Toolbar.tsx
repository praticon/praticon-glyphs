import type { RefObject } from "react";
import { categories, metadata, type IconCategory } from "@praticon-glyphs/core";
import { SearchIcon } from "@praticon-glyphs/react";
import { DEFAULT_STYLE, type IconStyle } from "../snippets.ts";
import { Star } from "../ui-icons.ts";

export type Filter = IconCategory | "all" | "saved";

export const CATEGORY_LABELS: Record<IconCategory, string> = {
  "core-ui": "Core UI",
  code: "Code & editor",
  browser: "Browser & web",
};

const COLOR_PRESETS = ["#5b21b6", "#2563eb", "#059669", "#d97706", "#dc2626"];
const counts = Object.fromEntries(categories.map((c) => [c, metadata.filter((i) => i.category === c).length]));

export function Toolbar({
  query,
  onQuery,
  filter,
  onFilter,
  savedCount,
  style,
  onStyle,
  searchRef,
}: {
  query: string;
  onQuery: (query: string) => void;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  savedCount: number;
  style: IconStyle;
  onStyle: (style: IconStyle) => void;
  searchRef: RefObject<HTMLInputElement | null>;
}) {
  const tabs: Array<[Filter, string, number]> = [
    ["all", "All", metadata.length],
    ...categories.map((c): [Filter, string, number] => [c, CATEGORY_LABELS[c], counts[c]]),
  ];
  return (
    <section className="toolbar" aria-label="Search and customise icons">
      <div className="toolbar-inner">
        <div className="search">
          <SearchIcon size={18} aria-hidden="true" />
          <input
            ref={searchRef}
            id="icon-search"
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={`Search ${metadata.length} icons by name, tag or alias`}
            aria-label="Search icons"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd aria-hidden="true">/</kbd>
        </div>

        <div className="toolbar-row">
          <div className="tabs-filter" role="group" aria-label="Filter icons">
            {tabs.map(([value, label, count]) => (
              <button key={value} type="button" className="chip" aria-pressed={filter === value} onClick={() => onFilter(value)}>
                {label}
                <span className="chip-count mono">{count}</span>
              </button>
            ))}
            <button type="button" className="chip chip-saved" aria-pressed={filter === "saved"} onClick={() => onFilter("saved")}>
              <Star size={14} aria-hidden="true" />
              Saved
              <span className="chip-count mono">{savedCount}</span>
            </button>
          </div>
          <StyleControls style={style} onChange={onStyle} />
        </div>
      </div>
    </section>
  );
}

function StyleControls({ style, onChange }: { style: IconStyle; onChange: (style: IconStyle) => void }) {
  const changed = style.size !== DEFAULT_STYLE.size || style.strokeWidth !== DEFAULT_STYLE.strokeWidth || style.color;
  return (
    <div className="controls" aria-label="Icon style">
      <label className="control">
        <span>Size</span>
        <input
          id="icon-size"
          type="range"
          min={16}
          max={48}
          step={4}
          value={style.size}
          onChange={(event) => onChange({ ...style, size: Number(event.target.value) })}
        />
        <output className="mono">{style.size}</output>
      </label>
      <label className="control">
        <span>Stroke</span>
        <input
          id="icon-stroke"
          type="range"
          min={1}
          max={3}
          step={0.25}
          value={style.strokeWidth}
          onChange={(event) => onChange({ ...style, strokeWidth: Number(event.target.value) })}
        />
        <output className="mono">{style.strokeWidth}</output>
      </label>
      <div className="swatches" role="group" aria-label="Colour">
        <button
          type="button"
          className="swatch swatch-text"
          aria-pressed={!style.color}
          aria-label="Text colour"
          title="Text colour"
          onClick={() => onChange({ ...style, color: undefined })}
        />
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            className="swatch"
            style={{ background: color }}
            aria-pressed={style.color === color}
            aria-label={`Colour ${color}`}
            title={color}
            onClick={() => onChange({ ...style, color })}
          />
        ))}
        <label className="swatch swatch-custom" title="Pick any colour">
          <input
            id="icon-color"
            type="color"
            value={style.color ?? "#5b21b6"}
            onChange={(event) => onChange({ ...style, color: event.target.value })}
            aria-label="Pick any colour"
          />
        </label>
      </div>
      <button type="button" className="text-button" disabled={!changed} onClick={() => onChange(DEFAULT_STYLE)}>
        Reset
      </button>
    </div>
  );
}
