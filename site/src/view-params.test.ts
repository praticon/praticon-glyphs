import { describe, expect, it } from "vitest";
import { DEFAULT_STYLE } from "./snippets.ts";
import { parseView, viewSearch } from "./view-params.ts";

describe("viewSearch", () => {
  it("is empty for the default view", () => {
    expect(viewSearch({ query: "", style: DEFAULT_STYLE })).toBe("");
    expect(viewSearch({ query: "   ", style: DEFAULT_STYLE })).toBe("");
  });

  it("lists only what differs from the defaults", () => {
    expect(viewSearch({ query: "arrow", style: DEFAULT_STYLE })).toBe("?q=arrow");
    expect(viewSearch({ query: "", category: "code", style: { ...DEFAULT_STYLE, size: 32 } })).toBe("?category=code&size=32");
    expect(viewSearch({ query: "file code", style: { size: 24, strokeWidth: 1.5, color: "#2563EB" } })).toBe(
      "?q=file+code&stroke=1.5&color=2563eb",
    );
  });
});

describe("parseView", () => {
  it("round-trips every part of a view", () => {
    const view = { query: "file code", category: "browser" as const, style: { size: 40, strokeWidth: 2.75, color: "#dc2626" } };
    expect(parseView(viewSearch(view))).toEqual(view);
  });

  it("returns nothing for an empty query string", () => {
    expect(parseView("")).toEqual({});
    expect(parseView("?q=%20%20")).toEqual({});
  });

  it("fills unspecified style parts with the defaults", () => {
    expect(parseView("?stroke=1")).toEqual({ style: { ...DEFAULT_STYLE, strokeWidth: 1 } });
  });

  it("ignores values the controls cannot produce", () => {
    expect(parseView("?category=saved&size=30&stroke=9&color=red")).toEqual({});
    expect(parseView("?size=12&stroke=1.1&color=%23ffffff")).toEqual({});
    expect(parseView("?size=abc&stroke=")).toEqual({});
  });

  it("caps very long searches", () => {
    expect(parseView(`?q=${"a".repeat(500)}`).query).toHaveLength(100);
  });
});
