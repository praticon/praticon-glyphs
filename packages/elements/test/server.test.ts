import { describe, expect, it } from "vitest";

describe("@praticon-glyphs/elements on the server", () => {
  it("loads without a DOM and registers nothing", async () => {
    expect(globalThis.HTMLElement).toBeUndefined();
    const { ArrowLeft } = await import("../src/index.js");
    expect(ArrowLeft.iconName).toBe("arrow-left");
  });
});
