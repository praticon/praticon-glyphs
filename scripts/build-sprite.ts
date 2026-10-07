/**
 * Builds packages/core/sprite.svg from the optimised SVGs (run scripts/optimize.ts
 * first): one <symbol> per icon, with the icon's name as its id.
 *
 * Symbols leave out the stroke width, so each <use> inherits it from the <svg>
 * around it, which also sets the size; the colour follows CSS `color`:
 *   <svg width="24" height="24" stroke-width="2"><use href="sprite.svg#arrow-left"/></svg>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CORE_DIR, listSvgNames, parseSvg } from "./lib.ts";

const svgDir = join(CORE_DIR, "svg");
const names = listSvgNames(svgDir);
if (names.length === 0) throw new Error("No optimised SVGs found. Run `pnpm optimize` first.");

const symbols = names.map((name) => {
  const children = parseSvg(readFileSync(join(svgDir, `${name}.svg`), "utf8"))
    .children.map(([tag, attrs]) => `<${tag}${Object.entries(attrs).map(([key, value]) => ` ${key}="${value}"`).join("")}/>`)
    .join("");
  // A <use> clones only the symbol, so the shared attributes go on each one rather than the root.
  return `<symbol id="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${children}</symbol>`;
});

const sprite = `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join("\n")}\n</svg>\n`;
writeFileSync(join(CORE_DIR, "sprite.svg"), sprite);
console.log(`✔ built the SVG sprite with ${names.length} symbols (${(sprite.length / 1024).toFixed(1)} KB)`);
