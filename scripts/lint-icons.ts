/**
 * Enforces the Praticon design spec (PLAN.md §4) on icons/outline/*.svg
 * and keeps icons/metadata.json in sync with the files.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CATEGORIES, SOURCE_DIR, listSvgNames, parseSvg, readMetadata, type Attrs } from "./lib.ts";

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

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
/** Live area is 2–22; allow 1px of optical overshoot. */
const MIN = 1;
const MAX = 23;

type Box = [minX: number, minY: number, maxX: number, maxY: number];

/** Bounding box of a path's on-curve points (control points and arc bulges are ignored). */
function pathBox(d: string): Box {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
  const box: Box = [Infinity, Infinity, -Infinity, -Infinity];
  const add = (x: number, y: number) => {
    box[0] = Math.min(box[0], x);
    box[1] = Math.min(box[1], y);
    box[2] = Math.max(box[2], x);
    box[3] = Math.max(box[3], y);
  };
  const arity: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
  let x = 0, y = 0, startX = 0, startY = 0, cmd = "";
  let i = 0;
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const lower = cmd.toLowerCase();
    const rel = cmd === lower;
    if (lower === "z") { x = startX; y = startY; continue; }
    const args = tokens.slice(i, i + arity[lower]).map(Number);
    i += arity[lower];
    if (lower === "h") x = (rel ? x : 0) + args[0];
    else if (lower === "v") y = (rel ? y : 0) + args[0];
    else {
      const [ex, ey] = args.slice(-2);
      x = (rel ? x : 0) + ex;
      y = (rel ? y : 0) + ey;
    }
    if (lower === "m") {
      startX = x; startY = y;
      cmd = rel ? "l" : "L"; // implicit lineto after moveto
    }
    add(x, y);
  }
  return box;
}

function shapeBox(tag: string, a: Attrs): Box | null {
  const n = (key: string) => Number(a[key] ?? 0);
  switch (tag) {
    case "path": return pathBox(a.d ?? "");
    case "circle": return [n("cx") - n("r"), n("cy") - n("r"), n("cx") + n("r"), n("cy") + n("r")];
    case "ellipse": return [n("cx") - n("rx"), n("cy") - n("ry"), n("cx") + n("rx"), n("cy") + n("ry")];
    case "rect": return [n("x"), n("y"), n("x") + n("width"), n("y") + n("height")];
    case "line": return [Math.min(n("x1"), n("x2")), Math.min(n("y1"), n("y2")), Math.max(n("x1"), n("x2")), Math.max(n("y1"), n("y2"))];
    default: return null;
  }
}

const errors: string[] = [];
const report = (name: string, message: string) => errors.push(`${name}: ${message}`);

const names = listSvgNames(SOURCE_DIR);
for (const name of names) {
  if (!NAME_RE.test(name)) report(name, "file name must be kebab-case");

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
    const box = shapeBox(tag, attrs);
    if (box && (box[0] < MIN || box[1] < MIN || box[2] > MAX || box[3] > MAX)) {
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
  if (!(CATEGORIES as readonly string[]).includes(entry.category)) report(name, `unknown category "${entry.category}" (add it to CATEGORIES in scripts/lib.ts)`);
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
