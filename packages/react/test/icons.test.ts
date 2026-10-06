// @vitest-environment jsdom
import { createElement, createRef, act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { icons, metadata, type IconNode as CoreIconNode } from "../../core/src/index.js";
import { toPascalCase } from "../src/to-pascal-case.js";
import * as Praticon from "../src/index.js";

const { ArrowLeft, createIcon } = Praticon;
const GitBranchSafe = createIcon("git-branch-safe", [["circle", { cx: "6", cy: "6", r: "2" }]]);

const render = renderToStaticMarkup;
const registry = Praticon as unknown as Record<string, Praticon.PraticonIcon>;

// Compile-time check that React's copy of IconNode stays in step with core's.
const reactNode: Praticon.IconNode = icons.check satisfies CoreIconNode;
const coreNode: CoreIconNode = reactNode;
void coreNode;

describe("@praticon-glyphs/react", () => {
  it("exports a component and an *Icon alias for every icon", () => {
    for (const { name } of metadata) {
      const component = toPascalCase(name);
      expect(registry[component], component).toBeDefined();
      expect(registry[`${component}Icon`]).toBe(registry[component]);
      expect(registry[component].displayName).toBe(component);
    }
  });

  it.each(metadata.map(({ name }) => toPascalCase(name)))("renders <%s /> consistently", (component) => {
    expect(render(createElement(registry[component]))).toMatchSnapshot();
  });

  it("renders with spec defaults", () => {
    const html = render(createElement(ArrowLeft));
    expect(html).toContain('width="24" height="24"');
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('fill="none"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('stroke-linecap="round"');
    expect(html).toContain('stroke-linejoin="round"');
    expect(html).toContain('class="praticon praticon-arrow-left"');
  });

  it("applies size, color and strokeWidth", () => {
    const html = render(createElement(ArrowLeft, { size: 32, color: "#5b21b6", strokeWidth: 1.5 }));
    expect(html).toContain('width="32" height="32"');
    expect(html).toContain('stroke="#5b21b6"');
    expect(html).toContain('stroke-width="1.5"');
  });

  it("merges className and passes through SVG props", () => {
    const html = render(createElement(ArrowLeft, { className: "nav", style: { opacity: 0.5 }, "data-testid": "back" } as Praticon.IconProps));
    expect(html).toContain('class="praticon praticon-arrow-left nav"');
    expect(html).toContain('style="opacity:0.5"');
    expect(html).toContain('data-testid="back"');
  });

  it("is hidden from assistive tech by default", () => {
    const html = render(createElement(ArrowLeft));
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("role=");
  });

  it("becomes role=img when labelled", () => {
    const html = render(createElement(ArrowLeft, { "aria-label": "Go back" }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Go back"');
    expect(html).not.toContain("aria-hidden");
  });

  it("stays hidden when the label is empty", () => {
    const html = render(createElement(ArrowLeft, { "aria-label": "" }));
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("role=");
  });

  it("renders children such as <title>", () => {
    const html = render(createElement(ArrowLeft, { "aria-labelledby": "t" }, createElement("title", { id: "t" }, "Back")));
    expect(html).toContain('<title id="t">Back</title>');
    expect(html).toContain('role="img"');
  });

  it("forwards refs to the <svg> element", async () => {
    const ref = createRef<SVGSVGElement>();
    const container = document.createElement("div");
    const root = createRoot(container);
    await act(async () => root.render(createElement(ArrowLeft, { ref })));
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
    expect(ref.current?.getAttribute("class")).toBe("praticon praticon-arrow-left");
    await act(async () => root.unmount());
  });

  it("lets you build custom icons with createIcon", () => {
    const html = render(createElement(GitBranchSafe));
    expect(html).toContain("praticon-git-branch-safe");
    expect(html).toContain('<circle cx="6" cy="6" r="2"></circle>');
  });
});
