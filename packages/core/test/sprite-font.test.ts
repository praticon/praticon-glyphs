import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { icons } from "../src/index.js";

const coreDir = join(import.meta.dirname, "..");
const names = Object.keys(icons).sort();
const read = (file: string) => readFileSync(join(coreDir, file), "utf8");

describe("sprite.svg", () => {
  const sprite = read("sprite.svg");
  const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]);

  it("has one symbol per icon", () => {
    expect(ids).toEqual(names);
  });

  it("lets each <use> set the stroke width but keeps the outline style", () => {
    for (const symbol of sprite.match(/<symbol [^>]*>/g)!) {
      expect(symbol).toContain('fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"');
      expect(symbol).not.toContain("stroke-width");
    }
  });
});

describe("icon font", () => {
  const codepoints: Record<string, number> = JSON.parse(read("font/codepoints.json"));
  const committed: Record<string, string> = JSON.parse(readFileSync(join(coreDir, "..", "..", "icons", "codepoints.json"), "utf8"));
  const css = read("font/praticon.css");

  it("gives every icon a unique private-use codepoint", () => {
    expect(Object.keys(codepoints).sort()).toEqual(names);
    const values = Object.values(codepoints);
    expect(new Set(values).size).toBe(values.length);
    for (const code of values) expect(code >= 0xe000 && code <= 0xf8ff).toBe(true);
  });

  it("uses the committed codepoints, so icons keep their character across releases", () => {
    for (const [name, code] of Object.entries(codepoints)) expect(code.toString(16)).toBe(committed[name]);
  });

  it("has a class per icon pointing at its codepoint", () => {
    for (const [name, code] of Object.entries(codepoints)) {
      expect(css).toContain(`.praticon-${name}::before {\n  content: "\\${code.toString(16)}";\n}`);
    }
  });

  it("loads a WOFF2 font", () => {
    expect(css).toMatch(/src: url\("\.\/praticon\.woff2\?v=[\d.]+"\) format\("woff2"\);/);
    expect(readFileSync(join(coreDir, "font", "praticon.woff2")).subarray(0, 4).toString("latin1")).toBe("wOF2");
  });
});
