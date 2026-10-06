/**
 * Exact bounding boxes of SVG shapes, used by lint-icons.ts to keep icons
 * inside the live area. The box covers the geometry, not the stroke.
 */
import type { Attrs } from "./lib.ts";

export type Box = [minX: number, minY: number, maxX: number, maxY: number];

class BoxBuilder {
  box: Box = [Infinity, Infinity, -Infinity, -Infinity];
  add(x: number, y: number) {
    this.box[0] = Math.min(this.box[0], x);
    this.box[1] = Math.min(this.box[1], y);
    this.box[2] = Math.max(this.box[2], x);
    this.box[3] = Math.max(this.box[3], y);
  }
  result(): Box | null {
    return Number.isFinite(this.box[0]) ? this.box : null;
  }
}

/** Parameters t in (0, 1) where a cubic Bézier has a zero derivative on one axis. */
function cubicExtrema(p0: number, p1: number, p2: number, p3: number): number[] {
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  let roots: number[];
  if (Math.abs(a) < 1e-12) roots = Math.abs(b) < 1e-12 ? [] : [-c / b];
  else {
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    const sqrt = Math.sqrt(disc);
    roots = [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)];
  }
  return roots.filter((t) => t > 0 && t < 1);
}

const cubicAt = (t: number, p0: number, p1: number, p2: number, p3: number) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

const quadAt = (t: number, p0: number, p1: number, p2: number) =>
  (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;

/** Adds the extreme points of an elliptical arc (SVG endpoint parameterisation, spec §B.2.4). */
function addArc(
  out: BoxBuilder,
  x1: number, y1: number,
  rx: number, ry: number, rotation: number, largeArc: boolean, sweep: boolean,
  x2: number, y2: number,
) {
  out.add(x2, y2);
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2)) return; // straight line, or nothing

  const phi = (rotation * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;

  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = (largeArc !== sweep ? 1 : -1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;

  const angle = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let delta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  // Angles where dx/dθ = 0 or dy/dθ = 0, repeated every π.
  const bases = [Math.atan2(-ry * sin, rx * cos), Math.atan2(ry * cos, rx * sin)];
  for (const base of bases) {
    for (let k = -4; k <= 4; k++) {
      const theta = base + k * Math.PI;
      const progress = (theta - theta1) / delta;
      if (progress <= 0 || progress >= 1) continue;
      out.add(
        cx + rx * cos * Math.cos(theta) - ry * sin * Math.sin(theta),
        cy + rx * sin * Math.cos(theta) + ry * cos * Math.sin(theta),
      );
    }
  }
}

const NUMBER_RE = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
const FLAG_RE = /[01]/y;
const SEPARATOR_RE = /[\s,]*/y;
const COMMAND_RE = /[MmLlHhVvCcSsQqTtAaZz]/y;

/** Exact bounding box of path data, including curve and arc extremes. Throws on malformed data. */
export function pathBox(d: string): Box | null {
  let pos = 0;
  const match = (re: RegExp) => {
    re.lastIndex = pos;
    const m = re.exec(d);
    if (m) pos = re.lastIndex;
    return m?.[0];
  };
  const skip = () => match(SEPARATOR_RE);
  const number = () => {
    skip();
    const value = match(NUMBER_RE);
    if (value === undefined) throw new Error(`invalid path data at position ${pos}: ${JSON.stringify(d.slice(pos, pos + 10))}`);
    return Number(value);
  };
  const flag = () => {
    skip();
    const value = match(FLAG_RE);
    if (value === undefined) throw new Error(`invalid arc flag at position ${pos}`);
    return value === "1";
  };

  const out = new BoxBuilder();
  let x = 0, y = 0, startX = 0, startY = 0;
  // Last control point, for the smooth S and T commands.
  let lastCubic: [number, number] | null = null;
  let lastQuad: [number, number] | null = null;
  let cmd = "";

  skip();
  while (pos < d.length) {
    const next = match(COMMAND_RE);
    if (next) cmd = next;
    else if (!cmd || cmd === "z" || cmd === "Z") throw new Error(`invalid path data at position ${pos}: ${JSON.stringify(d.slice(pos, pos + 10))}`);

    const lower = cmd.toLowerCase();
    const rel = cmd === lower;
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    let cubic: [number, number] | null = null;
    let quad: [number, number] | null = null;

    switch (lower) {
      case "z":
        x = startX; y = startY;
        break;
      case "m":
        x = ox + number(); y = oy + number();
        startX = x; startY = y;
        out.add(x, y);
        cmd = rel ? "l" : "L"; // further pairs are implicit linetos
        break;
      case "l":
        x = ox + number(); y = oy + number();
        out.add(x, y);
        break;
      case "h":
        x = ox + number();
        out.add(x, y);
        break;
      case "v":
        y = oy + number();
        out.add(x, y);
        break;
      case "c":
      case "s": {
        let c1x: number, c1y: number;
        if (lower === "c") { c1x = ox + number(); c1y = oy + number(); }
        else [c1x, c1y] = lastCubic ? [2 * x - lastCubic[0], 2 * y - lastCubic[1]] : [x, y];
        const c2x = ox + number(), c2y = oy + number();
        const ex = ox + number(), ey = oy + number();
        for (const t of cubicExtrema(x, c1x, c2x, ex)) out.add(cubicAt(t, x, c1x, c2x, ex), cubicAt(t, y, c1y, c2y, ey));
        for (const t of cubicExtrema(y, c1y, c2y, ey)) out.add(cubicAt(t, x, c1x, c2x, ex), cubicAt(t, y, c1y, c2y, ey));
        out.add(ex, ey);
        cubic = [c2x, c2y];
        x = ex; y = ey;
        break;
      }
      case "q":
      case "t": {
        let cx: number, cy: number;
        if (lower === "q") { cx = ox + number(); cy = oy + number(); }
        else [cx, cy] = lastQuad ? [2 * x - lastQuad[0], 2 * y - lastQuad[1]] : [x, y];
        const ex = ox + number(), ey = oy + number();
        for (const [p0, p1, p2] of [[x, cx, ex], [y, cy, ey]]) {
          const den = p0 - 2 * p1 + p2;
          if (Math.abs(den) < 1e-12) continue;
          const t = (p0 - p1) / den;
          if (t > 0 && t < 1) out.add(quadAt(t, x, cx, ex), quadAt(t, y, cy, ey));
        }
        out.add(ex, ey);
        quad = [cx, cy];
        x = ex; y = ey;
        break;
      }
      case "a": {
        const rx = number(), ry = number(), rotation = number();
        const largeArc = flag(), sweep = flag();
        const ex = ox + number(), ey = oy + number();
        addArc(out, x, y, rx, ry, rotation, largeArc, sweep, ex, ey);
        x = ex; y = ey;
        break;
      }
    }
    lastCubic = cubic;
    lastQuad = quad;
    skip();
  }
  return out.result();
}

/** Bounding box of an allowed shape element, or null if it draws nothing. */
export function shapeBox(tag: string, a: Attrs): Box | null {
  const n = (key: string) => Number(a[key] ?? 0);
  switch (tag) {
    case "path":
      return pathBox(a.d ?? "");
    case "circle":
      return [n("cx") - n("r"), n("cy") - n("r"), n("cx") + n("r"), n("cy") + n("r")];
    case "ellipse":
      return [n("cx") - n("rx"), n("cy") - n("ry"), n("cx") + n("rx"), n("cy") + n("ry")];
    case "rect":
      return [n("x"), n("y"), n("x") + n("width"), n("y") + n("height")];
    case "line":
      return [Math.min(n("x1"), n("x2")), Math.min(n("y1"), n("y2")), Math.max(n("x1"), n("x2")), Math.max(n("y1"), n("y2"))];
    case "polyline":
    case "polygon": {
      const values = (a.points ?? "").trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (values.length % 2 !== 0 || values.some(Number.isNaN)) throw new Error(`invalid points ${JSON.stringify(a.points)}`);
      const out = new BoxBuilder();
      for (let i = 0; i < values.length; i += 2) out.add(values[i], values[i + 1]);
      return out.result();
    }
    default:
      return null;
  }
}
