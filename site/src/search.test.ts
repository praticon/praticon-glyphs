import { describe, expect, it } from "vitest";
import type { IconMetadata } from "@praticon-glyphs/core";
import { searchIcons } from "./search.ts";

const icon = (name: string, tags: string[], aliases: string[] = [], category = "core-ui"): IconMetadata =>
  ({ name, tags, aliases, category, tier: "free", since: "0.1.0" }) as IconMetadata;

const icons = [
  icon("arrow-left", ["back", "previous"]),
  icon("arrow-right", ["forward", "next"]),
  icon("file-code", ["source", "script"], [], "code"),
  icon("file", ["document", "page"], ["document"]),
  icon("terminal", ["shell", "console", "cli"], [], "code"),
];
const names = (query: string, category?: IconMetadata["category"]) =>
  searchIcons(icons, query, category).map((i) => i.name);

describe("searchIcons", () => {
  it("returns every icon, sorted by name, for an empty query", () => {
    expect(names("")).toEqual(["arrow-left", "arrow-right", "file", "file-code", "terminal"]);
  });

  it("ranks an exact name before prefixes and tag matches", () => {
    expect(names("file")).toEqual(["file", "file-code"]);
  });

  it("matches any part of a hyphenated name", () => {
    expect(names("code")).toEqual(["file-code"]);
    expect(names("left")).toEqual(["arrow-left"]);
  });

  it("matches tags and aliases, ignoring case", () => {
    expect(names("Back")).toEqual(["arrow-left"]);
    expect(names("doc")).toEqual(["file"]);
    expect(names("cli")).toEqual(["terminal"]);
  });

  it("requires every word to match", () => {
    expect(names("arrow next")).toEqual(["arrow-right"]);
    expect(names("arrow shell")).toEqual([]);
  });

  it("filters by category", () => {
    expect(names("", "code")).toEqual(["file-code", "terminal"]);
    expect(names("file", "code")).toEqual(["file-code"]);
  });
});
