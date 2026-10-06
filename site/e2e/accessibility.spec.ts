import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  ["home", ""],
  ["icon page", "icons/terminal/"],
  ["docs", "docs/"],
  ["not found", "no-such-page/"],
] as const;

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

    for (const [label, path] of PAGES) {
      test(`${label} has no detectable accessibility problems`, async ({ page }) => {
        await page.goto(path);
        // Let entrance animations finish so colours are measured at rest.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expect(page.locator("#main")).toBeVisible();

        const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const summary = violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`);
        expect(summary).toEqual([]);
      });
    }
  });
}
