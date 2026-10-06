import { createSSRApp, h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { icons, metadata, type IconName, type IconNode as CoreIconNode } from "../../core/src/index.js";
import { toPascalCase } from "../src/to-pascal-case.js";
import * as Praticon from "../src/index.js";

const { ArrowLeft, createIcon } = Praticon;
const registry = Praticon as unknown as Record<string, Praticon.PraticonIcon>;

// Compile-time check that Vue's copy of IconNode stays in step with core's.
const vueNode: Praticon.IconNode = icons.check satisfies CoreIconNode;
const coreNode: CoreIconNode = vueNode;
void coreNode;

const render = (component: Component, props: Record<string, unknown> = {}, children?: () => unknown) =>
  renderToString(createSSRApp({ render: () => h(component, props, children) })).then((html) => html.replace(/<!--.*?-->/g, ""));

describe("@praticon-glyphs/vue", () => {
  it("exports a component and an *Icon alias for every icon", () => {
    for (const { name } of metadata) {
      const component = toPascalCase(name);
      expect(registry[component], component).toBeDefined();
      expect(registry[`${component}Icon`]).toBe(registry[component]);
      expect(registry[component].displayName).toBe(component);
    }
  });

  it.each(metadata.map(({ name }) => name))("draws %s with the same shapes as core", async (name) => {
    const html = await render(registry[toPascalCase(name)]);
    for (const [tag, attrs] of icons[name as IconName]) {
      const attributes = Object.entries(attrs).map(([key, value]) => `${key}="${value}"`);
      expect(html).toMatch(new RegExp(`<${tag} ${attributes.join(" ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    }
  });

  it("renders with spec defaults", async () => {
    const html = await render(ArrowLeft);
    expect(html).toContain('width="24" height="24"');
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('fill="none"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('stroke-linecap="round"');
    expect(html).toContain('stroke-linejoin="round"');
    expect(html).toContain('class="praticon praticon-arrow-left"');
  });

  it("applies size, color and strokeWidth", async () => {
    const html = await render(ArrowLeft, { size: 32, color: "#5b21b6", strokeWidth: 1.5 });
    expect(html).toContain('width="32" height="32"');
    expect(html).toContain('stroke="#5b21b6"');
    expect(html).toContain('stroke-width="1.5"');
  });

  it("merges class once and passes through other attributes", async () => {
    const html = await render(ArrowLeft, { class: "nav", style: { opacity: 0.5 }, "data-testid": "back" });
    expect(html).toContain('class="praticon praticon-arrow-left nav"');
    expect(html.match(/class=/g)).toHaveLength(1);
    expect(html).toContain('style="opacity:0.5;"');
    expect(html).toContain('data-testid="back"');
  });

  it("is hidden from assistive tech by default", async () => {
    const html = await render(ArrowLeft);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("role=");
  });

  it("becomes role=img when labelled", async () => {
    const html = await render(ArrowLeft, { "aria-label": "Go back" });
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Go back"');
    expect(html).not.toContain("aria-hidden");
  });

  it("stays hidden when the label is empty", async () => {
    const html = await render(ArrowLeft, { "aria-label": "" });
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("role=");
  });

  it("renders slot content such as <title>", async () => {
    const html = await render(ArrowLeft, { "aria-labelledby": "t" }, () => h("title", { id: "t" }, "Back"));
    expect(html).toContain('<title id="t">Back</title>');
    expect(html).toContain('role="img"');
  });

  it("lets you build custom icons with createIcon", async () => {
    const html = await render(createIcon("git-branch-safe", [["circle", { cx: "6", cy: "6", r: "2" }]]));
    expect(html).toContain("praticon-git-branch-safe");
    expect(html).toContain('<circle cx="6" cy="6" r="2"></circle>');
  });
});
