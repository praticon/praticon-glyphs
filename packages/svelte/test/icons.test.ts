import { createRawSnippet, type Component } from "svelte";
import { render as renderServer } from "svelte/server";
import { describe, expect, it } from "vitest";
import { icons, metadata, type IconName, type IconNode as CoreIconNode } from "../../core/src/index.js";
import * as Praticon from "../src/index.js";
import type { IconProps } from "../src/types.js";

const { ArrowLeft, Icon } = Praticon;
const registry = Praticon as unknown as Record<string, Component<IconProps>>;

// Compile-time check that Svelte's copy of IconNode stays in step with core's.
const svelteNode: Praticon.IconNode = icons.check satisfies CoreIconNode;
const coreNode: CoreIconNode = svelteNode;
void coreNode;

const toPascalCase = (name: string) => name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase());
// Svelte marks hydration boundaries with comments; they are not part of the markup.
const render = <Props extends Record<string, unknown>>(component: Component<Props>, props = {} as Props) =>
  renderServer(component, { props }).body.replace(/<!--.*?-->/g, "");

describe("@praticon-glyphs/svelte", () => {
  it("exports a component and an *Icon alias for every icon", () => {
    for (const { name } of metadata) {
      const component = toPascalCase(name);
      expect(registry[component], component).toBeDefined();
      expect(registry[`${component}Icon`]).toBe(registry[component]);
    }
  });

  it.each(metadata.map(({ name }) => name))("draws %s with the same shapes as core", (name) => {
    const html = render(registry[toPascalCase(name)]);
    for (const [tag, attrs] of icons[name as IconName]) {
      const attributes = Object.entries(attrs).map(([key, value]) => `${key}="${value}"`);
      expect(html).toMatch(new RegExp(`<${tag} ${attributes.join(" ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    }
  });

  it("renders with spec defaults", () => {
    const html = render(ArrowLeft);
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
    const html = render(ArrowLeft, { size: 32, color: "#5b21b6", strokeWidth: 1.5 });
    expect(html).toContain('width="32" height="32"');
    expect(html).toContain('stroke="#5b21b6"');
    expect(html).toContain('stroke-width="1.5"');
  });

  it("merges class and passes through other attributes", () => {
    const html = render(ArrowLeft, { class: "nav", style: "opacity: 0.5", "data-testid": "back" });
    expect(html).toContain('class="praticon praticon-arrow-left nav"');
    expect(html).toContain('style="opacity: 0.5"');
    expect(html).toContain('data-testid="back"');
  });

  it("is hidden from assistive tech by default", () => {
    const html = render(ArrowLeft);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("role=");
  });

  it("becomes role=img when labelled", () => {
    const html = render(ArrowLeft, { "aria-label": "Go back" });
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Go back"');
    expect(html).not.toContain("aria-hidden");
  });

  it("stays hidden when the label is empty", () => {
    const html = render(ArrowLeft, { "aria-label": "" });
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("role=");
  });

  it("renders children such as <title>", () => {
    const children = createRawSnippet(() => ({ render: () => '<title id="t">Back</title>' }));
    const html = render(ArrowLeft, { "aria-labelledby": "t", children });
    expect(html).toContain('<title id="t">Back</title>');
    expect(html).toContain('role="img"');
  });

  it("lets you draw custom icons with Icon", () => {
    const node: Praticon.IconNode = [["circle", { cx: "6", cy: "6", r: "2" }]];
    const html = render(Icon, { name: "git-branch-safe", node });
    expect(html).toContain("praticon-git-branch-safe");
    expect(html).toMatch(/<circle cx="6" cy="6" r="2"\s*(\/>|><\/circle>)/);
  });
});
