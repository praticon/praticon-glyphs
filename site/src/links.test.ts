import { describe, expect, it } from "vitest";
import { iconRequestUrl, REPO_URL } from "./links.ts";

const params = (url: string) => Object.fromEntries(new URL(url).searchParams);

describe("iconRequestUrl", () => {
  it("opens the icon request form", () => {
    expect(iconRequestUrl()).toBe(`${REPO_URL}/issues/new?template=icon-request.yml`);
    expect(iconRequestUrl("  ?! ")).toBe(`${REPO_URL}/issues/new?template=icon-request.yml`);
  });

  it("fills in the title and a kebab-case name from the search", () => {
    expect(params(iconRequestUrl("File Lock!"))).toEqual({
      template: "icon-request.yml",
      title: "Icon request: file-lock",
      "icon-name": "file-lock",
    });
  });

  it("caps long searches", () => {
    expect(params(iconRequestUrl("a".repeat(100)))["icon-name"]).toHaveLength(40);
  });
});
