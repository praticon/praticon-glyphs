/**
 * Turns an icon's 2 px strokes into filled outlines, for formats that cannot
 * draw strokes (icon fonts). Uses Skia's exact stroker and path union, so the
 * outline matches the SVG instead of being traced from pixels.
 */
import { createRequire } from "node:module";
import type { CanvasKit, Path } from "canvaskit-wasm";
import type { IconNode } from "./lib.ts";

export type Point = readonly [x: number, y: number];

/** One closed contour: a start point, then lines (1 point), quadratics (2) or cubics (3). */
export interface Contour {
  start: Point;
  segments: Point[][];
}

let canvasKit: Promise<CanvasKit> | undefined;
// canvaskit-wasm is CommonJS, but its types describe an ES default export, which
// TypeScript then cannot call. Requiring it gives the init function either way.
const CanvasKitInit: () => Promise<CanvasKit> = createRequire(import.meta.url)("canvaskit-wasm");
export const loadCanvasKit = () => (canvasKit ??= CanvasKitInit());

function shapePath(ck: CanvasKit, tag: string, attrs: Readonly<Record<string, string>>): Path {
  const n = (key: string, fallback = 0) => (attrs[key] === undefined ? fallback : Number(attrs[key]));
  const builder = new ck.PathBuilder();
  switch (tag) {
    case "path": {
      builder.delete();
      const path = ck.Path.MakeFromSVGString(attrs.d);
      if (!path) throw new Error(`Invalid path data "${attrs.d}"`);
      return path;
    }
    case "circle":
      return builder.addCircle(n("cx"), n("cy"), n("r")).detachAndDelete();
    case "ellipse":
      return builder.addOval(ck.LTRBRect(n("cx") - n("rx"), n("cy") - n("ry"), n("cx") + n("rx"), n("cy") + n("ry"))).detachAndDelete();
    case "rect": {
      const rx = n("rx", n("ry"));
      const ry = n("ry", rx);
      return builder.addRRect(ck.RRectXY(ck.XYWHRect(n("x"), n("y"), n("width"), n("height")), rx, ry)).detachAndDelete();
    }
    default:
      builder.delete();
      throw new Error(`Cannot outline <${tag}>`);
  }
}

/** Parses the absolute M/L/Q/C/Z path data that Skia's toSVGString() writes. */
export function parseContours(d: string): Contour[] {
  const tokens = d.match(/[MLQCZ]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) ?? [];
  const contours: Contour[] = [];
  let current: Contour | undefined;
  let i = 0;
  const point = (): Point => [Number(tokens[i++]), Number(tokens[i++])];
  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === "M") contours.push((current = { start: point(), segments: [] }));
    else if (command === "L") current!.segments.push([point()]);
    else if (command === "Q") current!.segments.push([point(), point()]);
    else if (command === "C") current!.segments.push([point(), point(), point()]);
    else if (command !== "Z") throw new Error(`Unexpected path command "${command}"`);
  }
  return contours.filter((c) => c.segments.length > 0);
}

const endOf = <T>(list: readonly T[]): T => list[list.length - 1];

/** The same contour traced the other way round. */
export function reverseContour({ start, segments }: Contour): Contour {
  const starts = [start, ...segments.slice(0, -1).map(endOf)];
  const reversed = segments
    .map((segment, index) => [...segment.slice(0, -1).reverse(), starts[index]])
    .reverse();
  return { start: endOf(endOf(segments)), segments: reversed };
}

/** Points along the contour, close enough to the curves for area and containment tests. */
function flatten({ start, segments }: Contour): Point[] {
  const points: Point[] = [start];
  let from = start;
  for (const segment of segments) {
    const curve = [from, ...segment];
    const steps = segment.length === 1 ? 1 : 8;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      // De Casteljau: repeatedly interpolate the control points.
      let level = curve;
      while (level.length > 1) level = level.slice(1).map((p, k) => [level[k][0] + (p[0] - level[k][0]) * t, level[k][1] + (p[1] - level[k][1]) * t] as const);
      points.push(level[0]);
    }
    from = endOf(segment);
  }
  return points;
}

/** Positive for clockwise contours in SVG's y-down coordinates. */
const signedArea = (points: Point[]) =>
  points.reduce((sum, [x1, y1], k) => {
    const [x2, y2] = points[(k + 1) % points.length];
    return sum + (x1 * y2 - x2 * y1);
  }, 0) / 2;

function contains(polygon: Point[], [x, y]: Point): boolean {
  let inside = false;
  for (let k = 0, j = polygon.length - 1; k < polygon.length; j = k++) {
    const [xi, yi] = polygon[k];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Orients contours so the nonzero fill rule (which fonts use) gives the same
 * shape as even-odd: outer contours clockwise, holes anticlockwise, islands in
 * holes clockwise again. Skia's own makeAsWinding() mis-orients holes when two
 * strokes only touch at a point, as in `bug`.
 */
export function orientForNonzero(contours: Contour[]): Contour[] {
  const polygons = contours.map(flatten);
  return contours.map((contour, index) => {
    // A vertex's midpoint to its neighbour sits on this contour, never on another one.
    const [a, b] = polygons[index];
    const probe: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const depth = polygons.filter((polygon, other) => other !== index && contains(polygon, probe)).length;
    const clockwise = signedArea(polygons[index]) > 0;
    return clockwise === (depth % 2 === 0) ? contour : reverseContour(contour);
  });
}

/**
 * Adds the stroke of `shape` to `union`. Skia's path union occasionally fails on
 * a stroke whose round caps land on each other (an open path that ends where it
 * starts, as in `heart`). Halves of the path are then stroked separately: their
 * round caps meet exactly where the unbroken stroke would have been.
 */
function addStroke(ck: CanvasKit, union: Path, shape: Path, strokeWidth: number, splits = 0): Path {
  const stroked = shape.makeStroked({ width: strokeWidth, cap: ck.StrokeCap.Round, join: ck.StrokeJoin.Round, precision: 4 });
  if (!stroked) throw new Error("Could not stroke a shape");
  const next = ck.Path.MakeFromOp(union, stroked, ck.PathOp.Union);
  stroked.delete();
  if (next) return next;
  if (splits >= 3) throw new Error("Could not merge a shape into the outline");
  let result = union;
  for (const [from, to] of [[0, 0.5], [0.5, 1]]) {
    const half = shape.makeTrimmed(from, to, false);
    if (!half) throw new Error("Could not split a shape");
    const merged = addStroke(ck, result, half, strokeWidth, splits + 1);
    half.delete();
    if (result !== union) result.delete();
    result = merged;
  }
  return result;
}

/** The filled outline of an icon drawn with a round stroke of `strokeWidth`. */
export function outlineIcon(ck: CanvasKit, children: IconNode, strokeWidth = 2): Contour[] {
  let union = ck.Path.MakeFromSVGString("")!;
  for (const [tag, attrs] of children) {
    const shape = shapePath(ck, tag, attrs);
    const next = addStroke(ck, union, shape, strokeWidth);
    shape.delete();
    union.delete();
    union = next;
  }
  const d = union.toSVGString();
  union.delete();
  return orientForNonzero(parseContours(d));
}

/** SVG path data for contours, rounded to `precision` decimals. */
export function contoursToPath(contours: Contour[], precision = 3): string {
  const f = (n: number) => String(Number(n.toFixed(precision)));
  const p = ([x, y]: Point) => `${f(x)} ${f(y)}`;
  return contours
    .map(({ start, segments }) => `M${p(start)}${segments.map((s) => `${"LQC"[s.length - 1]}${s.map(p).join(" ")}`).join("")}Z`)
    .join("");
}
