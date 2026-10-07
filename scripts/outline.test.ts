import { describe, expect, it } from "vitest";
import { contoursToPath, loadCanvasKit, orientForNonzero, outlineIcon, parseContours, reverseContour, type Contour } from "./outline.ts";

const square = (x: number, y: number, size: number): Contour => ({
  start: [x, y],
  segments: [[[x + size, y]], [[x + size, y + size]], [[x, y + size]], [[x, y]]],
});
const clockwise = (contour: Contour) => {
  const points = [contour.start, ...contour.segments.map((s) => s[s.length - 1])];
  return points.reduce((sum, [x1, y1], k) => sum + x1 * points[(k + 1) % points.length][1] - points[(k + 1) % points.length][0] * y1, 0) > 0;
};

describe("parseContours and contoursToPath", () => {
  it("round-trip lines, quadratics and cubics", () => {
    const d = "M1 2L3 4Q5 6 7 8C9 10 11 12 13 14ZM0 0L1 0L1 1Z";
    expect(contoursToPath(parseContours(d))).toBe(d);
  });
});

describe("reverseContour", () => {
  it("traces the same points the other way", () => {
    const [contour] = parseContours("M0 0L10 0Q10 10 0 10C-2 8 -2 2 0 0Z");
    expect(contoursToPath([reverseContour(contour)])).toBe("M0 0C-2 2 -2 8 0 10Q10 10 10 0L0 0Z");
    expect(reverseContour(reverseContour(contour))).toEqual(contour);
  });
});

describe("orientForNonzero", () => {
  it("makes outer contours clockwise, holes anticlockwise and islands clockwise", () => {
    const nested = [square(0, 0, 30), square(5, 5, 20), square(10, 10, 10)].map((c, k) => (k === 1 ? c : reverseContour(c)));
    expect(orientForNonzero(nested).map(clockwise)).toEqual([true, false, true]);
  });
});

describe("outlineIcon", () => {
  it("outlines a stroked circle as a ring", async () => {
    const ck = await loadCanvasKit();
    const contours = outlineIcon(ck, [["circle", { cx: "12", cy: "12", r: "8" }]]);
    expect(contours.map(clockwise)).toEqual(expect.arrayContaining([true, false]));
    expect(contours).toHaveLength(2);
  });

  it("outlines a path that ends where it starts, which Skia cannot merge in one piece", async () => {
    const ck = await loadCanvasKit();
    const heart = "M12 20c-6.5-4.5-9.5-8-9.5-11.5a4.5 4.5 0 0 1 9.5-2 4.5 4.5 0 0 1 9.5 2c0 3.5-3 7-9.5 11.5";
    expect(outlineIcon(ck, [["path", { d: heart }]]).length).toBeGreaterThanOrEqual(2);
  });

  it("rejects shapes it cannot outline", async () => {
    const ck = await loadCanvasKit();
    expect(() => outlineIcon(ck, [["text", {}]])).toThrow("Cannot outline <text>");
  });
});
