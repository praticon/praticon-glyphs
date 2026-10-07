// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { icons, metadata, type IconNode as CoreIconNode } from "../../core/src/index.js";
import { toPascalCase } from "../../react/src/to-pascal-case.js";
import * as Praticon from "../src/index.js";

const { ArrowLeft, defineIcon, PraticonElement } = Praticon;
const registry = Praticon as unknown as Record<string, typeof PraticonElement>;

// Compile-time check that this package's copy of IconNode stays in step with core's.
const elementsNode: Praticon.IconNode = icons.check satisfies CoreIconNode;
const coreNode: CoreIconNode = elementsNode;
void coreNode;

const mount = (html: string) => {
  document.body.innerHTML = html;
  return document.body.firstElementChild as InstanceType<typeof PraticonElement>;
};
const svgOf = (element: Element) => element.shadowRoot!.querySelector("svg")!;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("@praticon-glyphs/elements", () => {
  it("exports and registers an element for every icon", () => {
    for (const { name } of metadata) {
      const component = toPascalCase(name);
      expect(registry[component], component).toBeDefined();
      expect(registry[`${component}Icon`]).toBe(registry[component]);
      expect(customElements.get(`praticon-${name}`)).toBe(registry[component]);
    }
  });

  it.each(metadata.map(({ name }) => name))("draws %s with the same shapes as core", (name) => {
    const svg = svgOf(mount(`<praticon-${name}></praticon-${name}>`));
    const shapes = [...svg.children].map((child) => [child.tagName, Object.fromEntries([...child.attributes].map((a) => [a.name, a.value]))]);
    expect(shapes).toEqual(icons[name as keyof typeof icons]);
  });

  it("renders with the default size, colour and stroke", () => {
    const svg = svgOf(mount("<praticon-arrow-left></praticon-arrow-left>"));
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg.style.width).toBe("24px");
    expect(svg.style.height).toBe("24px");
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    expect(svg.getAttribute("stroke-width")).toBe("2");
    expect(svg.getAttribute("fill")).toBe("none");
    expect(svg.getAttribute("class")).toBe("praticon praticon-arrow-left");
  });

  it("applies size, colour and stroke width, and follows changes", () => {
    const element = mount('<praticon-check size="32" color="#5b21b6" stroke-width="1.5"></praticon-check>');
    const svg = svgOf(element);
    expect(svg.style.width).toBe("32px");
    expect(svg.getAttribute("stroke")).toBe("#5b21b6");
    expect(svg.getAttribute("stroke-width")).toBe("1.5");

    element.size = "2em";
    element.strokeWidth = 2.5;
    element.color = "red";
    expect(svg.style.width).toBe("2em");
    expect(svg.getAttribute("stroke-width")).toBe("2.5");
    expect(svg.getAttribute("stroke")).toBe("red");
    expect(element.getAttribute("size")).toBe("2em");
  });

  it("is hidden from assistive technology unless labelled", () => {
    const element = mount("<praticon-check></praticon-check>");
    expect(element.getAttribute("aria-hidden")).toBe("true");
    expect(element.hasAttribute("role")).toBe(false);
    expect(svgOf(element).getAttribute("aria-hidden")).toBe("true");

    element.setAttribute("aria-label", "Done");
    expect(element.hasAttribute("aria-hidden")).toBe(false);
    expect(element.getAttribute("role")).toBe("img");

    element.removeAttribute("aria-label");
    expect(element.getAttribute("aria-hidden")).toBe("true");
    expect(element.hasAttribute("role")).toBe(false);
  });

  it("leaves accessibility attributes the page set alone", () => {
    const element = mount('<praticon-check aria-label="Done" role="presentation"></praticon-check>');
    expect(element.getAttribute("role")).toBe("presentation");
    element.removeAttribute("aria-label");
    expect(element.getAttribute("role")).toBe("presentation");
  });

  it("keeps working when moved in the page", () => {
    const element = mount('<praticon-check size="20"></praticon-check>');
    const svg = svgOf(element);
    document.body.append(document.createElement("div"));
    document.body.lastElementChild!.append(element);
    expect(svgOf(element)).toBe(svg);
    expect(element.shadowRoot!.querySelectorAll("svg")).toHaveLength(1);
  });

  it("wraps custom icons and never redefines a tag", () => {
    const node = [["circle", { cx: "12", cy: "12", r: "4" }]] as const;
    const Dot = defineIcon("dot", node);
    expect(customElements.get("praticon-dot")).toBe(Dot);
    expect(defineIcon("dot", node)).not.toBe(Dot);
    expect(customElements.get("praticon-dot")).toBe(Dot);

    defineIcon("dot", node, "my-dot");
    expect(svgOf(mount("<my-dot></my-dot>")).querySelector("circle")!.getAttribute("r")).toBe("4");
  });

  it("is typed for querySelector", () => {
    mount("<praticon-arrow-left></praticon-arrow-left>");
    const element = document.querySelector("praticon-arrow-left");
    expect(element).toBeInstanceOf(ArrowLeft);
    expect(element?.strokeWidth).toBe("2");
  });
});
