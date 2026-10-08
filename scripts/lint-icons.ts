/**
 * Enforces the Praticon design spec on icons/outline/*.svg
 * and keeps icons/metadata.json in sync with the files.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shapeBox } from "./geometry.ts";
import { SOURCE_DIR, categories, listSvgNames, parseSvg, readMetadata, type Attrs } from "./lib.ts";

const REQUIRED_ROOT: Attrs = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

const ALLOWED_ATTRS: Record<string, string[]> = {
  path: ["d"],
  circle: ["cx", "cy", "r"],
  ellipse: ["cx", "cy", "rx", "ry"],
  rect: ["x", "y", "width", "height", "rx", "ry"],
  line: ["x1", "y1", "x2", "y2"],
  polyline: ["points"],
  polygon: ["points"],
};

/** Starts with a letter so the generated component name is a valid identifier. */
const NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
/** Live area is 2–22; allow 1px of optical overshoot. */
const MIN = 1;
const MAX = 23;

const errors: string[] = [];
const report = (name: string, message: string) => errors.push(`${name}: ${message}`);

const names = listSvgNames(SOURCE_DIR);
for (const name of names) {
  if (!NAME_RE.test(name)) report(name, "file name must be kebab-case and start with a letter");
  // `foo-icon` would export `FooIcon`, which is already the alias of `foo`.
  if (name.endsWith("-icon")) report(name, `file name must not end in "-icon"`);

  let svg;
  try {
    svg = parseSvg(readFileSync(join(SOURCE_DIR, `${name}.svg`), "utf8"));
  } catch (error) {
    report(name, (error as Error).message);
    continue;
  }

  for (const [key, value] of Object.entries(REQUIRED_ROOT)) {
    if (svg.root[key] !== value) report(name, `<svg> must have ${key}="${value}" (found ${JSON.stringify(svg.root[key])})`);
  }
  for (const key of Object.keys(svg.root)) {
    if (!(key in REQUIRED_ROOT)) report(name, `unexpected <svg> attribute "${key}"`);
  }
  if (svg.leftover) report(name, `only self-closing shape elements are allowed, found: ${svg.leftover.slice(0, 60)}`);
  if (svg.children.length === 0) report(name, "icon is empty");

  for (const [tag, attrs] of svg.children) {
    const allowed = ALLOWED_ATTRS[tag];
    if (!allowed) {
      report(name, `<${tag}> is not allowed (use ${Object.keys(ALLOWED_ATTRS).join(", ")})`);
      continue;
    }
    for (const key of Object.keys(attrs)) {
      if (!allowed.includes(key)) report(name, `<${tag}> may not set "${key}" (fills, colours, styles and transforms are inherited from the root)`);
    }
    let box;
    try {
      box = shapeBox(tag, attrs);
    } catch (error) {
      report(name, `<${tag}> ${(error as Error).message}`);
      continue;
    }
    if (!box) report(name, `<${tag}> draws nothing`);
    else if (box[0] < MIN || box[1] < MIN || box[2] > MAX || box[3] > MAX) {
      report(name, `<${tag}> leaves the live area: [${box.map((v) => +v.toFixed(2)).join(", ")}]`);
    }
  }
}

const metadata = readMetadata();
const seen = new Set<string>();
for (const entry of metadata) {
  const name = entry.name ?? "(unnamed)";
  if (seen.has(name)) report(name, "duplicate metadata entry");
  seen.add(name);
  if (!names.includes(name)) report(name, "metadata entry has no SVG in icons/outline");
  if (!(categories as readonly string[]).includes(entry.category)) report(name, `unknown category "${entry.category}" (add it to packages/core/src/categories.ts)`);
  if (entry.tier !== "free") report(name, `tier must be "free"; Pro icons never go in this public repo`);
  if (!SEMVER_RE.test(entry.since ?? "")) report(name, `"since" must be a version like 0.1.0`);
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) report(name, "needs at least one tag");
  if (!Array.isArray(entry.aliases)) report(name, `"aliases" must be an array`);
}
for (const name of names) {
  if (!seen.has(name)) report(name, "missing from icons/metadata.json");
}
const allNames = new Set(names);
for (const entry of metadata) {
  for (const alias of entry.aliases ?? []) {
    if (allNames.has(alias)) report(entry.name, `alias "${alias}" clashes with an icon name`);
  }
}

if (errors.length) {
  console.error(`✖ ${errors.length} problem(s) in ${names.length} icons:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`✔ ${names.length} icons pass the design spec`);
