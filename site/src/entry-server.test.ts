import { describe, expect, it } from "vitest";
import { render } from "./entry-server.tsx";

describe("pre-rendering", () => {
  it("renders an icon page with its details and head tags", () => {
    const { head, html } = render({ page: "browse", icon: "terminal" });
    expect(head).toContain("<title>terminal icon · Praticon Icons</title>");
    expect(head).toContain('<link rel="canonical" href="https://praticon.github.io/praticon-glyphs/icons/terminal/" />');
    expect(html).toContain('aria-label="terminal details"');
  });

  it("links every tile to its icon page so crawlers can follow them", () => {
    const { html } = render({ page: "browse" });
    expect(html).toContain('href="/icons/file-code/"');
    expect(html.match(/class="tile"/g)?.length).toBeGreaterThanOrEqual(50);
  });

  it("renders the Getting started page", () => {
    const { head, html } = render({ page: "docs" });
    expect(head).toContain("<title>Getting started · Praticon Icons</title>");
    expect(html).toContain("<h1>Getting started</h1>");
    expect(html).toContain("npm i @praticon-glyphs/react");
  });

  it("renders a not-found notice", () => {
    expect(render({ page: "not-found" }).html).toContain("That page does not exist");
  });
});
