/**
 * Compares every icon in icons/outline with every icon in Lucide, Tabler,
 * Feather and Heroicons, and with the rest of Praticon, to catch icons that
 * look like copies or like each other.
 *
 * Score: intersection over union of the rendered strokes at 96 px, with every
 * stroke set to 2. 1.00 is identical; two different drawings of the same idea
 * usually land around 0.4–0.65.
 *
 *   pnpm audit:icons                      report for all icons
 *   pnpm audit:icons copy file            report for some icons
 *   pnpm audit:icons --fail-above 0.85    exit 1 if any icon scores above 0.85
 *   pnpm audit:icons --json report.json   also write the full results
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import resvg from "@resvg/resvg-js";
import { optimize } from "svgo";
import svgoConfig from "../svgo.config.mjs";
import { ROOT, SOURCE_DIR, listSvgNames } from "./lib.ts";

/** Shapes every library draws the same way; a high score here means nothing. */
const UNIVERSAL = new Set([
  "chevron-down", "chevron-left", "chevron-right", "chevron-up",
  "close", "ellipsis", "menu", "minus", "plus",
]);
const NEAR_COPY = 0.9;
const CLOSE = 0.8;
const SIZE = 96;
const WORDS = (SIZE * SIZE) / 32;

const LIBRARIES: Record<string, string> = {
  lucide: "node_modules/lucide-static/icons",
  tabler: "node_modules/@tabler/icons/icons/outline",
  feather: "node_modules/feather-icons/dist/icons",
  heroicons: "node_modules/heroicons/24/outline",
};

interface Icon {
  lib: string;
  name: string;
  bits: Uint32Array;
  count: number;
  shapes: string;
}

const { values: args, positionals: only } = parseArgs({
  allowPositionals: true,
  options: { "fail-above": { type: "string" }, json: { type: "string" } },
});
const failAbove = args["fail-above"] === undefined ? undefined : Number(args["fail-above"]);
if (failAbove !== undefined && !(failAbove > 0 && failAbove <= 1)) throw new Error("--fail-above must be a number in (0, 1]");

const popcount = (n: number) => {
  n -= (n >>> 1) & 0x55555555;
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
  return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
};

/** Same size, colour and stroke width for every library (Heroicons use 1.5). */
function normalise(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/currentColor/g, "#000")
    .replace(/<svg\b[^>]*>/, (root) =>
      root
        .replace(/\s(width|height|stroke-width)="[^"]*"/g, "")
        .replace(/^<svg\b/, '<svg width="24" height="24" stroke-width="2"'),
    );
}

/** The shape elements after SVGO, sorted, to spot exact copies. */
function shapeKey(svg: string): string {
  const { data } = optimize(svg.replace(/<!--[\s\S]*?-->/g, ""), svgoConfig);
  return [...data.matchAll(/<(path|circle|ellipse|rect|line|polyline|polygon)\b([^>]*?)\/?>/g)]
    .filter(([, , attrs]) => !attrs.includes('stroke="none"')) // Tabler's invisible 24×24 frame
    .map(([, tag, attrs]) => `${tag} ${attrs.replace(/\s+/g, " ").trim()}`)
    .sort()
    .join("|");
}

function load(lib: string, dir: string, names?: string[]): Icon[] {
  const icons: Icon[] = [];
  for (const name of names ?? readdirSync(dir).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4))) {
    const svg = readFileSync(join(dir, `${name}.svg`), "utf8");
    let pixels: Buffer;
    try {
      pixels = new resvg.Resvg(normalise(svg), { fitTo: { mode: "width", value: SIZE }, font: { loadSystemFonts: false } }).render().pixels;
    } catch (error) {
      console.warn(`skipped ${lib}/${name}: ${(error as Error).message}`);
      continue;
    }
    const bits = new Uint32Array(WORDS);
    let count = 0;
    for (let i = 0; i < SIZE * SIZE; i++) {
      if (pixels[i * 4 + 3] > 127) {
        bits[i >>> 5] |= 1 << (i & 31);
        count++;
      }
    }
    icons.push({ lib, name, bits, count, shapes: shapeKey(svg) });
  }
  return icons;
}

function iou(a: Icon, b: Icon): number {
  let inter = 0;
  for (let i = 0; i < WORDS; i++) inter += popcount(a.bits[i] & b.bits[i]);
  const union = a.count + b.count - inter;
  return union ? inter / union : 0;
}

const allNames = listSvgNames(SOURCE_DIR);
const unknown = only.filter((name) => !allNames.includes(name));
if (unknown.length) throw new Error(`Unknown icon(s): ${unknown.join(", ")}`);

const praticon = load("praticon", SOURCE_DIR, allNames);
const targets = only.length ? praticon.filter((icon) => only.includes(icon.name)) : praticon;
const libraries = Object.entries(LIBRARIES).map(([lib, dir]) => ({ lib, icons: load(lib, join(ROOT, dir)) }));

const results = targets.map((icon) => {
  const matches = libraries.map(({ lib, icons }) => {
    let best = { lib, name: "", score: 0, exact: false };
    for (const other of icons) {
      const exact = icon.shapes === other.shapes;
      const score = exact ? 1 : iou(icon, other);
      if (score > best.score) best = { lib, name: other.name, score, exact };
    }
    return best;
  });
  const top = matches.reduce((a, b) => (b.score > a.score ? b : a));
  const lookalike = praticon
    .filter((other) => other.name !== icon.name)
    .map((other) => ({ name: other.name, score: iou(icon, other) }))
    .reduce((a, b) => (b.score > a.score ? b : a), { name: "", score: 0 });
  const universal = UNIVERSAL.has(icon.name);
  const verdict = universal ? "universal" : top.score >= NEAR_COPY ? "near copy" : top.score >= CLOSE ? "close" : "distinct";
  return { name: icon.name, verdict, universal, top, matches, lookalike };
});
results.sort((a, b) => Number(a.universal) - Number(b.universal) || b.top.score - a.top.score);

const pad = (s: string, n: number) => s.padEnd(n);
const counts = libraries.map(({ lib, icons }) => `${lib} ${icons.length}`).join(", ");
console.log(`Compared ${targets.length} Praticon icons with ${counts}\n`);
console.log(`${pad("icon", 16)}${pad("score", 7)}${pad("closest match", 34)}${pad("verdict", 11)}most similar Praticon icon`);
for (const r of results) {
  const match = `${r.top.lib}/${r.top.name}${r.top.exact ? " (same shapes)" : ""}`;
  const twin = r.lookalike.score >= CLOSE ? `${r.lookalike.name} ${r.lookalike.score.toFixed(2)}` : "";
  console.log(`${pad(r.name, 16)}${pad(r.top.score.toFixed(2), 7)}${pad(match, 34)}${pad(r.verdict, 11)}${twin}`);
}
const tally = (v: string) => results.filter((r) => r.verdict === v).length;
console.log(`\n${tally("near copy")} near copy (≥ ${NEAR_COPY}), ${tally("close")} close (≥ ${CLOSE}), ${tally("distinct")} distinct, ${tally("universal")} universal shapes`);

if (args.json) {
  writeFileSync(args.json, `${JSON.stringify({ counts: Object.fromEntries(libraries.map(({ lib, icons }) => [lib, icons.length])), results }, null, 2)}\n`);
  console.log(`wrote ${args.json}`);
}
if (failAbove !== undefined) {
  const failing = results.filter((r) => !r.universal && r.top.score > failAbove);
  if (failing.length) {
    console.error(`\n✖ ${failing.length} icon(s) score above ${failAbove}: ${failing.map((r) => r.name).join(", ")}`);
    process.exit(1);
  }
  console.log(`\n✔ no icon scores above ${failAbove}`);
}
