import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { icons, metadata, toSvg, type IconName } from "../src/index.js";

const svgDir = join(import.meta.dirname, "..", "svg");
const names = Object.keys(icons) as IconName[];

describe("@praticon-glyphs/core", () => {
  it("has metadata for every icon and an icon for every metadata entry", () => {
    expect(metadata.map((entry) => entry.name).sort()).toEqual([...names].sort());
  });

  it.each(names)("ships an optimised %s.svg", (name) => {
    const file = join(svgDir, `${name}.svg`);
    expect(existsSync(file)).toBe(true);
    const svg = readFileSync(file, "utf8");
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('stroke="currentColor"');
  });

  it("renders an icon to SVG markup with defaults", () => {
    expect(toSvg("arrow-left")).toMatchInlineSnapshot(
      `"<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4"/><path d="m10 6-6 6 6 6"/></svg>"`,
    );
  });

  it("applies size, colour, stroke width and extra attributes", () => {
    const svg = toSvg("check", { size: 32, color: "#5b21b6", strokeWidth: 1.5, attrs: { class: "icon" } });
    expect(svg).toContain('width="32" height="32"');
    expect(svg).toContain('stroke="#5b21b6"');
    expect(svg).toContain('stroke-width="1.5"');
    expect(svg).toContain('class="icon"');
  });

  it("escapes attribute values", () => {
    expect(toSvg("check", { attrs: { "data-x": '"><script>' } })).toContain('data-x="&quot;>&lt;script>"');
  });

  it("throws on unknown icons", () => {
    expect(() => toSvg("nope" as IconName)).toThrow(/Unknown Praticon icon/);
  });
});
