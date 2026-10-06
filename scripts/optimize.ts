/**
 * Runs SVGO over icons/outline and writes the results into @praticon-glyphs/core:
 *   packages/core/svg/<name>.svg       optimised SVG files
 *   packages/core/metadata.json        copy of icons/metadata.json
 *   packages/core/src/generated/*.ts   icon nodes and metadata as typed modules
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { optimize } from "svgo";
import svgoConfig from "../svgo.config.mjs";
import { CORE_DIR, GENERATED_HEADER, SOURCE_DIR, listSvgNames, parseSvg, readMetadata } from "./lib.ts";

const svgDir = join(CORE_DIR, "svg");
const generatedDir = join(CORE_DIR, "src", "generated");
rmSync(svgDir, { recursive: true, force: true });
rmSync(generatedDir, { recursive: true, force: true });
mkdirSync(svgDir, { recursive: true });
mkdirSync(generatedDir, { recursive: true });

const header = GENERATED_HEADER.replace("%s", "optimize.ts");
const names = listSvgNames(SOURCE_DIR);
const entries: string[] = [];
let before = 0;
let after = 0;

for (const name of names) {
  const source = readFileSync(join(SOURCE_DIR, `${name}.svg`), "utf8");
  const { data } = optimize(source, { ...svgoConfig, path: name });
  writeFileSync(join(svgDir, `${name}.svg`), `${data}\n`);
  before += source.length;
  after += data.length;
  entries.push(`  ${JSON.stringify(name)}: ${JSON.stringify(parseSvg(data).children)},`);
}

writeFileSync(
  join(generatedDir, "icons.ts"),
  `${header}import type { IconNode } from "../types.js";\n\n` +
    `export const icons = {\n${entries.join("\n")}\n} as const satisfies Record<string, IconNode>;\n\n` +
    `export type IconName = keyof typeof icons;\n`,
);

const metadata = readMetadata();
writeFileSync(join(CORE_DIR, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);
writeFileSync(
  join(generatedDir, "metadata.ts"),
  `${header}import type { IconMetadata } from "../types.js";\n\n` +
    `export const metadata: readonly IconMetadata[] = ${JSON.stringify(metadata, null, 2)};\n`,
);

const saved = Math.round((1 - after / before) * 100);
console.log(`✔ optimised ${names.length} icons (${before} → ${after} bytes, -${saved}%)`);
