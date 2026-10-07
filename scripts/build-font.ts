/**
 * Builds the Praticon icon font into @praticon-glyphs/core from the optimised
 * SVGs (run scripts/optimize.ts first):
 *   packages/core/font/praticon.woff2      one glyph per icon, strokes outlined
 *   packages/core/font/praticon.css        @font-face and a class per icon
 *   packages/core/font/codepoints.json     icon name → character code
 *
 * Codepoints come from icons/codepoints.json, which is committed so an icon
 * keeps its character across releases. New icons get the next free one, and
 * the file is rewritten; commit it with the icon.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import opentype from "opentype.js";
import ttf2woff2 from "ttf2woff2";
import { CORE_DIR, ROOT, listSvgNames, parseSvg } from "./lib.ts";
import { loadCanvasKit, outlineIcon, type Point } from "./outline.ts";

export const CODEPOINTS_FILE = join(ROOT, "icons", "codepoints.json");
/** First character of Unicode's Private Use Area, so icons never stand in for real text. */
const FIRST_CODEPOINT = 0xe000;
/** Font units per grid unit: the 24 px grid becomes a 960-unit em. */
const SCALE = 40;
const EM = 24 * SCALE;
/** Like a capital letter, the icon sits on the baseline with a little below it, so it lines up with text. */
const DESCENT = 3 * SCALE;

const svgDir = join(CORE_DIR, "svg");
const fontDir = join(CORE_DIR, "font");
const names = listSvgNames(svgDir);
if (names.length === 0) throw new Error("No optimised SVGs found. Run `pnpm optimize` first.");
const version: string = JSON.parse(readFileSync(join(CORE_DIR, "package.json"), "utf8")).version;

// Assign codepoints, keeping every existing one.
const known: Record<string, string> = JSON.parse(readFileSync(CODEPOINTS_FILE, "utf8"));
const codepoints = new Map(Object.entries(known).map(([name, hex]) => [name, Number.parseInt(hex, 16)]));
let next = Math.max(FIRST_CODEPOINT - 1, ...codepoints.values()) + 1;
const added = names.filter((name) => !codepoints.has(name));
for (const name of added) codepoints.set(name, next++);
if (added.length) {
  const sorted = Object.fromEntries([...codepoints].sort(([a], [b]) => a.localeCompare(b)).map(([name, code]) => [name, code.toString(16)]));
  writeFileSync(CODEPOINTS_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
}

const ck = await loadCanvasKit();
// Grid coordinates are y-down; font units are y-up from the baseline.
const fx = (x: number) => Math.round(x * SCALE);
const fy = (y: number) => Math.round(EM - DESCENT - y * SCALE);
const at = ([x, y]: Point) => [fx(x), fy(y)] as const;

const glyphs = [new opentype.Glyph({ name: ".notdef", advanceWidth: EM, path: new opentype.Path() })];
for (const name of names) {
  const path = new opentype.Path();
  for (const { start, segments } of outlineIcon(ck, parseSvg(readFileSync(join(svgDir, `${name}.svg`), "utf8")).children)) {
    path.moveTo(...at(start));
    for (const segment of segments) {
      const [a, b, c] = segment.map(at);
      if (segment.length === 1) path.lineTo(...a);
      else if (segment.length === 2) path.quadraticCurveTo(...a, ...b);
      else path.curveTo(...a, ...b, ...c);
    }
    path.close();
  }
  // PostScript glyph names allow letters, digits, "." and "_" only.
  glyphs.push(new opentype.Glyph({ name: name.replace(/-/g, "_"), unicode: codepoints.get(name), advanceWidth: EM, path }));
}

const font = new opentype.Font({
  familyName: "Praticon",
  styleName: "Regular",
  unitsPerEm: EM,
  ascender: EM - DESCENT,
  descender: -DESCENT,
  glyphs,
  version,
  description: "Crafted, grid-based icons for web development.",
  copyright: "Copyright (c) Praticon contributors",
  license: "MIT",
  licenseURL: "https://github.com/praticon/praticon-glyphs/blob/main/LICENSE",
  manufacturerURL: "https://praticon.github.io/praticon-glyphs/",
});
const otf = font.toArrayBuffer();
const check = opentype.parse(otf);
if (check.glyphs.length !== names.length + 1) throw new Error(`The font has ${check.glyphs.length} glyphs, expected ${names.length + 1}`);

rmSync(fontDir, { recursive: true, force: true });
mkdirSync(fontDir, { recursive: true });
const woff2: Buffer = ttf2woff2(Buffer.from(otf));
writeFileSync(join(fontDir, "praticon.woff2"), woff2);
writeFileSync(
  join(fontDir, "codepoints.json"),
  `${JSON.stringify(Object.fromEntries(names.map((name) => [name, codepoints.get(name)])), null, 2)}\n`,
);
writeFileSync(
  join(fontDir, "praticon.css"),
  `/* Praticon icon font ${version}. MIT licensed. https://praticon.github.io/praticon-glyphs/ */\n` +
    `@font-face {\n  font-family: "Praticon";\n  src: url("./praticon.woff2?v=${version}") format("woff2");\n` +
    `  font-weight: normal;\n  font-style: normal;\n  font-display: block;\n}\n\n` +
    `.praticon {\n  display: inline-block;\n  font-family: "Praticon" !important;\n  font-style: normal;\n  font-weight: normal;\n` +
    `  font-variant: normal;\n  line-height: 1;\n  text-transform: none;\n  speak: never;\n` +
    `  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n` +
    names.map((name) => `.praticon-${name}::before {\n  content: "\\${codepoints.get(name)!.toString(16)}";\n}\n`).join(""),
);

const note = added.length ? `; assigned ${added.length} new codepoints in icons/codepoints.json, commit it` : "";
console.log(`✔ built the icon font with ${names.length} glyphs (${(woff2.length / 1024).toFixed(1)} KB woff2)${note}`);
