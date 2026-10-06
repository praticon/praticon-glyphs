import { describe, expect, it } from "vitest";
import type { IconMetadata } from "@praticon-glyphs/core";
import { iconPath, parseRoute, pathFor } from "./routes.ts";
import { headFor, renderHead } from "./seo.ts";

const base = "/praticon-glyphs/";
const names = new Set(["arrow-left", "file-code"]);
const metadata = [
  { name: "file-code", category: "code", tags: ["source", "script"], aliases: [], tier: "free", since: "0.1.0" },
] as unknown as IconMetadata[];

describe("parseRoute", () => {
  it("maps the site root to the browser", () => {
    expect(parseRoute("/praticon-glyphs/", base, names)).toEqual({ page: "browse" });
    expect(parseRoute("/praticon-glyphs", base, names)).toEqual({ page: "browse" });
    expect(parseRoute("/praticon-glyphs/index.html", base, names)).toEqual({ page: "browse" });
  });

  it("maps icon pages, with or without a trailing slash", () => {
    expect(parseRoute("/praticon-glyphs/icons/file-code/", base, names)).toEqual({ page: "browse", icon: "file-code" });
    expect(parseRoute("/praticon-glyphs/icons/file-code", base, names)).toEqual({ page: "browse", icon: "file-code" });
  });

  it("treats unknown icons and other paths as not found", () => {
    expect(parseRoute("/praticon-glyphs/icons/nope/", base, names)).toEqual({ page: "not-found" });
    expect(parseRoute("/praticon-glyphs/somewhere/", base, names)).toEqual({ page: "not-found" });
    expect(parseRoute("/elsewhere/", base, names)).toEqual({ page: "not-found" });
  });

  it("maps the Getting started page", () => {
    expect(parseRoute("/praticon-glyphs/docs/", base, names)).toEqual({ page: "docs" });
    expect(pathFor(base, { page: "docs" })).toBe("/praticon-glyphs/docs/");
  });

  it("builds icon paths that round-trip", () => {
    expect(iconPath(base, "arrow-left")).toBe("/praticon-glyphs/icons/arrow-left/");
    expect(parseRoute(iconPath(base, "arrow-left"), base, names)).toEqual({ page: "browse", icon: "arrow-left" });
  });
});

describe("headFor", () => {
  it("describes an icon page with its own URL and preview image", () => {
    const head = headFor({ page: "browse", icon: "file-code" }, metadata);
    expect(head.title).toBe("file-code icon · Praticon Icons");
    expect(head.description).toContain("source, script");
    expect(head.url).toBe("https://praticon.github.io/praticon-glyphs/icons/file-code/");
    expect(head.image).toBe("https://praticon.github.io/praticon-glyphs/og/file-code.png");
  });

  it("escapes values in the rendered tags", () => {
    const html = renderHead({ title: 'a "b" <c>', description: "d & e", url: "https://x/", image: "https://x/i.png" });
    expect(html).toContain("<title>a &quot;b&quot; &lt;c&gt;</title>");
    expect(html).toContain('content="d &amp; e"');
  });
});
