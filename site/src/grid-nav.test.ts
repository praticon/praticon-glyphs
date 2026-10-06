import { describe, expect, it } from "vitest";
import { nextIndex } from "./grid-nav.ts";

// 10 tiles in rows of 4:  0 1 2 3 / 4 5 6 7 / 8 9
const move = (index: number, key: string) => nextIndex(index, key, 10, 4);

describe("nextIndex", () => {
  it("moves left and right, stopping at the ends", () => {
    expect(move(5, "ArrowRight")).toBe(6);
    expect(move(5, "ArrowLeft")).toBe(4);
    expect(move(9, "ArrowRight")).toBe(9);
    expect(move(0, "ArrowLeft")).toBe(0);
  });

  it("moves up and down by a row", () => {
    expect(move(1, "ArrowDown")).toBe(5);
    expect(move(5, "ArrowUp")).toBe(1);
  });

  it("stays put when there is no tile in that direction", () => {
    expect(move(1, "ArrowUp")).toBe(1);
    expect(move(7, "ArrowDown")).toBe(7); // the last row has no column 3
    expect(move(9, "ArrowDown")).toBe(9);
  });

  it("jumps to the first and last tile", () => {
    expect(move(6, "Home")).toBe(0);
    expect(move(2, "End")).toBe(9);
  });

  it("ignores other keys", () => {
    expect(move(3, "Enter")).toBeUndefined();
  });
});
