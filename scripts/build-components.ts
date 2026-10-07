/**
 * Generates one tree-shakeable module per icon for each framework package from
 * the optimised SVGs in @praticon-glyphs/core (run scripts/optimize.ts first).
 *   packages/react/src/icons/<name>.ts   and index.ts
 *   packages/vue/src/icons/<name>.ts     and index.ts
 *   packages/svelte/src/icons/<name>.svelte and index.ts
 *   packages/elements/src/icons/<name>.ts and index.ts
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CORE_DIR,
  ELEMENTS_DIR,
  GENERATED_HEADER,
  REACT_DIR,
  SVELTE_DIR,
  VUE_DIR,
  listSvgNames,
  parseSvg,
  readMetadata,
  toPascalCase,
  type IconNode,
} from "./lib.ts";

const svgDir = join(CORE_DIR, "svg");
const header = GENERATED_HEADER.replace("%s", "build-components.ts");
const metadata = new Map(readMetadata().map((entry) => [entry.name, entry]));
const names = listSvgNames(svgDir);
if (names.length === 0) throw new Error("No optimised SVGs found. Run `pnpm optimize` first.");

const icons = names.map((name) => ({
  name,
  component: toPascalCase(name),
  tags: metadata.get(name)?.tags ?? [],
  children: parseSvg(readFileSync(join(svgDir, `${name}.svg`), "utf8")).children,
}));

const docComment = (name: string, tags: readonly string[]) =>
  `/**\n * Praticon \`${name}\` icon.${tags.length ? `\n * Tags: ${tags.join(", ")}.` : ""}\n` +
  ` * @see https://praticon.github.io/praticon-glyphs/icons/${name}/\n */\n`;

const nodeSource = (children: IconNode, indent: string) =>
  children.map(([tag, attrs]) => `${indent}[${JSON.stringify(tag)}, ${JSON.stringify(attrs)}],`).join("\n");

function resetDir(packageDir: string) {
  const dir = join(packageDir, "src", "icons");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  return dir;
}

// React and Vue share the same module shape; only their createIcon differs.
for (const packageDir of [REACT_DIR, VUE_DIR]) {
  const dir = resetDir(packageDir);
  for (const { name, component, tags, children } of icons) {
    writeFileSync(
      join(dir, `${name}.ts`),
      `${header}import { createIcon } from "../create-icon.js";\n\n` +
        docComment(name, tags) +
        `const ${component}Icon = createIcon(${JSON.stringify(name)}, [\n${nodeSource(children, "  ")}\n]);\n\n` +
        `export { ${component}Icon as ${component}, ${component}Icon };\n` +
        `export default ${component}Icon;\n`,
    );
  }
  const barrel = icons.map(({ name, component }) => `export { ${component}, ${component}Icon } from "./${name}.js";`);
  writeFileSync(join(dir, "index.ts"), `${header}${barrel.join("\n")}\n`);
}

// Svelte components are compiled by the consumer, so each icon is a small .svelte file.
{
  const dir = resetDir(SVELTE_DIR);
  const svelteHeader = `<!-- ${header.slice(3).trim()} -->\n`;
  for (const { name, tags, children } of icons) {
    writeFileSync(
      join(dir, `${name}.svelte`),
      svelteHeader +
        `<!--\n  @component\n  Praticon \`${name}\` icon.${tags.length ? ` Tags: ${tags.join(", ")}.` : ""}\n` +
        `  @see https://praticon.github.io/praticon-glyphs/icons/${name}/\n-->\n` +
        `<script module lang="ts">\n` +
        `  import type { IconNode } from "../types.js";\n\n` +
        `  const node: IconNode = [\n${nodeSource(children, "    ")}\n  ];\n` +
        `</script>\n\n` +
        `<script lang="ts">\n` +
        `  import Icon from "../Icon.svelte";\n` +
        `  import type { IconProps } from "../types.js";\n\n` +
        `  let props: IconProps = $props();\n` +
        `</script>\n\n` +
        `<Icon {...props} name=${JSON.stringify(name)} {node} />\n`,
    );
  }
  const barrel = icons.map(
    ({ name, component }) => `export { default as ${component}, default as ${component}Icon } from "./${name}.svelte";`,
  );
  writeFileSync(join(dir, "index.ts"), `${header}${barrel.join("\n")}\n`);
}

// Each Web Component module registers its <praticon-name> tag when imported.
{
  const dir = resetDir(ELEMENTS_DIR);
  for (const { name, component, tags, children } of icons) {
    writeFileSync(
      join(dir, `${name}.ts`),
      `${header}import { defineIcon } from "../define-icon.js";\n\n` +
        docComment(name, tags) +
        `const ${component}Icon = defineIcon(${JSON.stringify(name)}, [\n${nodeSource(children, "  ")}\n]);\n\n` +
        `declare global {\n  interface HTMLElementTagNameMap {\n    ${JSON.stringify(`praticon-${name}`)}: InstanceType<typeof ${component}Icon>;\n  }\n}\n\n` +
        `export { ${component}Icon as ${component}, ${component}Icon };\n` +
        `export default ${component}Icon;\n`,
    );
  }
  const barrel = icons.map(({ name, component }) => `export { ${component}, ${component}Icon } from "./${name}.js";`);
  writeFileSync(join(dir, "index.ts"), `${header}${barrel.join("\n")}\n`);
}

console.log(`✔ generated ${icons.length} React, Vue, Svelte and Web Components`);
