import { describe, expect, it } from "vitest";
import { DEFAULT_STYLE, componentName, isFormat, jsxSnippet, snippet, svelteSnippet, svgSnippet, vueSnippet } from "./snippets.ts";

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

describe("framework snippets", () => {
  const style = { size: 32, strokeWidth: 1.5, color: "#5b21b6" };

  it("writes a Vue single-file component with bound props", () => {
    expect(vueSnippet("arrow-left", DEFAULT_STYLE)).toBe(
      '<script setup>\nimport { ArrowLeft } from "@praticon-glyphs/vue";\n</script>\n\n<template>\n  <ArrowLeft />\n</template>',
    );
    expect(vueSnippet("file-code", style)).toContain('<FileCode :size="32" :stroke-width="1.5" color="#5b21b6" />');
  });

  it("writes a Svelte component", () => {
    expect(svelteSnippet("arrow-left", DEFAULT_STYLE)).toBe(
      '<script>\n  import { ArrowLeft } from "@praticon-glyphs/svelte";\n</script>\n\n<ArrowLeft />',
    );
    expect(svelteSnippet("file-code", style)).toContain('<FileCode size={32} strokeWidth={1.5} color="#5b21b6" />');
  });

  it("picks the snippet for a format", () => {
    expect(snippet("react", "check", DEFAULT_STYLE)).toBe(jsxSnippet("check", DEFAULT_STYLE));
    expect(snippet("vue", "check", DEFAULT_STYLE)).toBe(vueSnippet("check", DEFAULT_STYLE));
    expect(snippet("svelte", "check", DEFAULT_STYLE)).toBe(svelteSnippet("check", DEFAULT_STYLE));
    expect(snippet("svg", "check", DEFAULT_STYLE)).toBe(svgSnippet("check", DEFAULT_STYLE));
    expect(isFormat("vue")).toBe(true);
    expect(isFormat("angular")).toBe(false);
  });
});
