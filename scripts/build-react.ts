/**
 * Generates one tree-shakeable React module per icon from the optimised SVGs
 * in @praticon-glyphs/core (run scripts/optimize.ts first).
 *   packages/react/src/icons/<name>.ts
 *   packages/react/src/icons/index.ts
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CORE_DIR, GENERATED_HEADER, REACT_DIR, listSvgNames, parseSvg, readMetadata, toPascalCase } from "./lib.ts";

const svgDir = join(CORE_DIR, "svg");
const iconsDir = join(REACT_DIR, "src", "icons");
rmSync(iconsDir, { recursive: true, force: true });
mkdirSync(iconsDir, { recursive: true });

const header = GENERATED_HEADER.replace("%s", "build-react.ts");
const metadata = new Map(readMetadata().map((entry) => [entry.name, entry]));
const names = listSvgNames(svgDir);
if (names.length === 0) throw new Error("No optimised SVGs found. Run `pnpm optimize` first.");

const barrel: string[] = [];
for (const name of names) {
  const component = toPascalCase(name);
  const { children } = parseSvg(readFileSync(join(svgDir, `${name}.svg`), "utf8"));
  const tags = metadata.get(name)?.tags ?? [];
  const node = children
    .map(([tag, attrs]) => `  [${JSON.stringify(tag)}, ${JSON.stringify(attrs)}],`)
    .join("\n");

  writeFileSync(
    join(iconsDir, `${name}.ts`),
    `${header}import { createIcon } from "../create-icon.js";\n\n` +
      `/**\n * Praticon \`${name}\` icon.${tags.length ? `\n * Tags: ${tags.join(", ")}.` : ""}\n` +
      ` * @see https://praticon.github.io/praticon-glyphs/#${name}\n */\n` +
      `const ${component}Icon = createIcon(${JSON.stringify(name)}, [\n${node}\n]);\n\n` +
      `export { ${component}Icon as ${component}, ${component}Icon };\n` +
      `export default ${component}Icon;\n`,
  );
  barrel.push(`export { ${component}, ${component}Icon } from "./${name}.js";`);
}

writeFileSync(join(iconsDir, "index.ts"), `${header}${barrel.join("\n")}\n`);
console.log(`✔ generated ${names.length} React components`);
