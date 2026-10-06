import { describe, expect, it } from "vitest";
import { pathBox, shapeBox, type Box } from "./geometry.ts";

const close = (box: Box | null, expected: Box) => {
  expect(box).not.toBeNull();
  box!.forEach((value, i) => expect(value, `box[${i}]`).toBeCloseTo(expected[i], 6));
};

describe("pathBox", () => {
  it("handles lines, relative commands and implicit linetos", () => {
    close(pathBox("M4 12h16"), [4, 12, 20, 12]);
    close(pathBox("m10 6-6 6 6 6"), [4, 6, 10, 18]);
    close(pathBox("M3 3V21H21z"), [3, 3, 21, 21]);
  });

  it("keeps dots drawn as tiny segments", () => {
    close(pathBox("M12 17h.01"), [12, 17, 12.01, 17]);
  });

  it("includes cubic curve extremes, not just endpoints", () => {
    // Endpoints sit on y=12 but the curve bulges up to y=6.
    close(pathBox("M4 12C4 4 20 4 20 12"), [4, 6, 20, 12]);
  });

  it("reflects control points for S", () => {
    close(pathBox("M4 12C4 4 12 4 12 12S20 20 20 12"), [4, 6, 20, 18]);
  });

  it("includes quadratic extremes and reflects them for T", () => {
    close(pathBox("M4 12Q12 4 20 12"), [4, 8, 20, 12]);
    close(pathBox("M2 12Q6 4 10 12T18 12"), [2, 8, 18, 16]);
  });

  it("includes arc bulges", () => {
    // Semicircles of radius 8 through (4,12) and (20,12).
    close(pathBox("M4 12a8 8 0 0 1 16 0"), [4, 4, 20, 12]);
    close(pathBox("M4 12a8 8 0 0 0 16 0"), [4, 12, 20, 20]);
    // A full circle drawn as two arcs.
    close(pathBox("M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20"), [2, 2, 22, 22]);
  });

  it("scales up radii that are too small to reach the endpoint", () => {
    close(pathBox("M4 12A1 1 0 0 1 20 12"), [4, 4, 20, 12]);
  });

  it("parses compact arc flags", () => {
    close(pathBox("M4 12a8 8 0 0116 0"), [4, 4, 20, 12]);
  });

  it("returns null for empty data and throws on garbage", () => {
    expect(pathBox("")).toBeNull();
    expect(() => pathBox("M4 4 L x")).toThrow(/invalid path data/);
    expect(() => pathBox("4 4")).toThrow(/invalid path data/);
  });
});

describe("shapeBox", () => {
  it("measures polylines and polygons", () => {
    close(shapeBox("polyline", { points: "4 6 10 12 4 18" }), [4, 6, 10, 18]);
    close(shapeBox("polygon", { points: "12,0.5 23,22 1,22" }), [1, 0.5, 23, 22]);
  });

  it("rejects malformed points", () => {
    expect(() => shapeBox("polyline", { points: "4 6 10" })).toThrow(/invalid points/);
  });

  it("measures basic shapes", () => {
    close(shapeBox("circle", { cx: "12", cy: "12", r: "10" }), [2, 2, 22, 22]);
    close(shapeBox("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }), [3, 4, 21, 20]);
  });
});
