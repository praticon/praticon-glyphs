import { expect, test, type Page } from "@playwright/test";
import { componentName } from "../src/snippets.ts";
import { expectClipboardEnd, focusedTile, trackErrors } from "./helpers.ts";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

let expectNoErrors: () => void;
test.beforeEach(({ page }) => {
  expectNoErrors = trackErrors(page);
});
test.afterEach(() => expectNoErrors());

const tileNames = (page: Page) => page.locator("a.tile").evaluateAll((tiles) => tiles.map((t) => (t as HTMLElement).dataset.name));

const columnCount = (page: Page) =>
  page.locator("a.tile").evaluateAll((tiles) => {
    const top = tiles[0].getBoundingClientRect().top;
    return tiles.filter((t) => Math.abs(t.getBoundingClientRect().top - top) < 1).length;
  });

/** True when the focused tile (or its own buttons) is on top at its centre, not covered by the sticky toolbar. */
const focusedTileIsVisible = (page: Page) =>
  page.evaluate(() => {
    const tile = document.activeElement as HTMLElement;
    const box = tile.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + 12);
    return !!hit && tile.closest(".tile-cell")!.contains(hit);
  });

test.describe("keyboard", () => {
  test("arrow keys, Home and End move between tiles", async ({ page }) => {
    await page.goto("");
    const names = await tileNames(page);
    const columns = await columnCount(page);
    expect(columns).toBeGreaterThan(1);

    await page.locator("a.tile").first().focus();
    expect(await focusedTile(page)).toBe(names[0]);
    await page.keyboard.press("ArrowRight");
    expect(await focusedTile(page)).toBe(names[1]);
    await page.keyboard.press("ArrowDown");
    expect(await focusedTile(page)).toBe(names[1 + columns]);
    await page.keyboard.press("End");
    expect(await focusedTile(page)).toBe(names.at(-1));
    await page.keyboard.press("Home");
    expect(await focusedTile(page)).toBe(names[0]);
  });

  test("the focused tile is never hidden under the sticky toolbar", async ({ page }) => {
    await page.goto("");
    // Move from the second tile, so the grid's own keyboard handling does the scrolling.
    await page.locator("a.tile").nth(1).focus();
    await page.keyboard.press("Home");
    expect(await focusedTileIsVisible(page)).toBe(true);

    await page.keyboard.press("End");
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("ArrowUp");
      expect(await focusedTileIsVisible(page), `after ArrowUp ${i + 1}`).toBe(true);
    }
  });

  test("/ focuses the search box", async ({ page }) => {
    await page.goto("");
    await page.keyboard.press("/");
    await expect(page.getByRole("searchbox")).toBeFocused();
  });

  test("C copies the focused tile's code", async ({ page }) => {
    await page.goto("");
    const names = await tileNames(page);
    await page.locator("a.tile").nth(1).focus();
    await page.keyboard.press("c");
    await expectClipboardEnd(page, `<${componentName(names[1]!)} />`);
  });
});

test.describe("icon pages", () => {
  test("Enter opens an icon, Escape closes it and Back reopens it", async ({ page }) => {
    await page.goto("");
    const tile = page.locator("a.tile").nth(1);
    const name = (await tile.getAttribute("data-name"))!;
    await tile.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator(".detail")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/praticon-glyphs/icons/${name}/$`));
    await expect(page).toHaveTitle(`${name} icon · Praticon Icons`);

    await page.keyboard.press("Escape");
    await expect(page.locator(".detail")).toHaveCount(0);
    await expect(page).toHaveURL(/\/praticon-glyphs\/$/);

    await page.goBack();
    await expect(page.locator(".detail")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/icons/${name}/$`));

    await page.getByRole("button", { name: "Close details" }).click();
    await expect(page.locator(".detail")).toHaveCount(0);
  });

  test("a direct link opens the icon's panel with its name as the heading", async ({ page }) => {
    await page.goto("icons/file-code/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("file-code");
    await expect(page.locator(".detail")).toBeVisible();
  });

  test("the drawing animation leaves solid strokes, so closed shapes keep clean corners", async ({ page }) => {
    await page.goto("icons/terminal/");
    const shapes = page.locator(".detail svg.draw > *");
    await expect
      .poll(() => shapes.evaluateAll((all) => all.map((shape) => getComputedStyle(shape).strokeDasharray)), { timeout: 5000 })
      .toEqual(Array(3).fill("none"));
  });

  test("an old #name link moves to the icon's page", async ({ page }) => {
    await page.goto("#terminal");
    await expect(page).toHaveURL(/\/icons\/terminal\/$/);
    await expect(page.locator(".detail")).toBeVisible();
  });

  test("the panel copies code for each format and downloads the SVG", async ({ page }) => {
    await page.goto("icons/terminal/");
    const panel = page.locator(".detail");
    await panel.getByRole("button", { name: "Copy React" }).click();
    await expectClipboardEnd(page, "<Terminal />");

    await panel.getByRole("tab", { name: "Vue" }).click();
    await panel.getByRole("button", { name: "Copy Vue" }).click();
    await expectClipboardEnd(page, "<Terminal />\n</template>");

    await panel.getByRole("tab", { name: "Svelte" }).click();
    await panel.getByRole("button", { name: "Copy Svelte" }).click();
    await expectClipboardEnd(page, '</script>\n\n<Terminal />');

    await panel.getByRole("tab", { name: "SVG" }).click();
    await panel.getByRole("button", { name: "Copy SVG" }).click();
    await expectClipboardEnd(page, "</svg>");

    const download = page.waitForEvent("download");
    await panel.getByRole("button", { name: "SVG", exact: true }).click();
    expect((await download).suggestedFilename()).toBe("terminal.svg");
  });

  test("the chosen format is remembered and used by the grid's copy buttons", async ({ page }) => {
    await page.goto("icons/terminal/");
    await page.locator(".detail").getByRole("tab", { name: "Vue" }).click();
    await page.reload();
    await expect(page.locator(".detail").getByRole("tab", { name: "Vue" })).toHaveAttribute("aria-selected", "true");

    const cell = page.locator(".tile-cell").first();
    const name = (await cell.locator("a.tile").getAttribute("data-name"))!;
    await cell.hover();
    await cell.locator(".tile-copy").click();
    await expectClipboardEnd(page, `<${componentName(name)} />\n</template>`);
  });

  test("unknown pages show a notice and every icon", async ({ page }) => {
    await page.goto("no-such-page/");
    await expect(page.getByRole("status").filter({ hasText: "does not exist" })).toBeVisible();
    await expect(page.locator("a.tile").first()).toBeVisible();
  });
});

test.describe("browsing", () => {
  test("search filters the grid and explains an empty result", async ({ page }) => {
    await page.goto("");
    const total = await page.locator("a.tile").count();
    await page.getByRole("searchbox").fill("arrow");
    await expect.poll(() => page.locator("a.tile").count()).toBeLessThan(total);
    for (const name of await tileNames(page)) expect(name).toContain("arrow");

    await page.getByRole("searchbox").fill("zzzz");
    await expect(page.locator("a.tile")).toHaveCount(0);
    await expect(page.getByText("No icons match")).toBeVisible();
  });

  test("hovering a tile shows its copy button, which copies JSX at the chosen size", async ({ page }) => {
    await page.goto("");
    const cell = page.locator(".tile-cell").first();
    const name = (await cell.locator("a.tile").getAttribute("data-name"))!;
    await cell.hover();
    await expect(cell.locator(".tile-copy")).toHaveCSS("opacity", "1");
    await cell.locator(".tile-copy").click();
    await expectClipboardEnd(page, `<${componentName(name)} />`);

    await page.locator("#icon-size").fill("32");
    await cell.hover();
    await cell.locator(".tile-copy").click();
    await expectClipboardEnd(page, `<${componentName(name)} size={32} />`);
  });

  test("saved icons, style and theme are remembered after a reload", async ({ page }) => {
    await page.goto("");
    const cell = page.locator(".tile-cell").nth(2);
    await cell.hover();
    await cell.locator(".tile-save").click();
    const savedCount = page.locator(".chip-saved .chip-count");
    await expect(savedCount).toHaveText("1");

    await page.locator("#icon-size").fill("32");
    await page.getByRole("button", { name: "Colour #2563eb" }).click();
    await page.locator(".theme-toggle").click();
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);

    await page.reload();
    await expect(savedCount).toHaveText("1");
    await expect(page.locator("#icon-size")).toHaveValue("32");
    await expect(page.getByRole("button", { name: "Colour #2563eb" })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);

    await page.locator(".chip-saved").click();
    await expect(page.locator("a.tile")).toHaveCount(1);
  });
});

test.describe("docs", () => {
  test("the header opens Getting started and code blocks copy", async ({ page }) => {
    await page.goto("");
    await page.locator(".site-nav").getByRole("link", { name: /Getting started|Docs/ }).click();
    await expect(page).toHaveURL(/\/docs\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Getting started");

    await page.getByRole("button", { name: "Copy code" }).first().click();
    await expectClipboardEnd(page, "npm i @praticon-glyphs/react");
  });
});

