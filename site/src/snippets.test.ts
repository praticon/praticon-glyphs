import { describe, expect, it } from "vitest";
import { DEFAULT_STYLE, componentName, jsxSnippet, svgSnippet } from "./snippets.ts";

describe("snippets", () => {
  it("names components the way the React package exports them", () => {
    expect(componentName("arrow-left")).toBe("ArrowLeft");
    expect(componentName("file-code")).toBe("FileCode");
  });

  it("leaves default props out of the JSX", () => {
    expect(jsxSnippet("arrow-left", DEFAULT_STYLE)).toBe(
      'import { ArrowLeft } from "@praticon-glyphs/react";\n\n<ArrowLeft />',
    );
  });

  it("includes props that differ from the defaults", () => {
    expect(jsxSnippet("file-code", { size: 32, strokeWidth: 1.5, color: "#5b21b6" })).toContain(
      '<FileCode size={32} strokeWidth={1.5} color="#5b21b6" />',
    );
  });

  it("renders SVG markup with the chosen style", () => {
    const svg = svgSnippet("check", { size: 20, strokeWidth: 1.5, color: "#5b21b6" });
    expect(svg).toContain('width="20" height="20"');
    expect(svg).toContain('stroke-width="1.5"');
    expect(svg).toContain('stroke="#5b21b6"');
    expect(svgSnippet("check", DEFAULT_STYLE)).toContain('stroke="currentColor"');
  });
});
