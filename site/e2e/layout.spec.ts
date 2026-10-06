import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers.ts";

const PAGES = ["", "icons/terminal/", "docs/", "no-such-page/"];

for (const path of PAGES) {
  test(`/${path} renders without errors, overflow or extra headings`, async ({ page }) => {
    const expectNoErrors = trackErrors(page);
    await page.goto(path);
    await expect(page.locator("#main")).toBeVisible();

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "horizontal scroll in px").toBeLessThanOrEqual(0);
    expectNoErrors();
  });
}

test("the theme is applied before the page paints", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("praticon:theme", "dark"));
  // Block the app's scripts, so only the inline script in index.html can set the theme.
  await page.route("**/assets/*.js", (route) => route.abort());
  await page.goto("");
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
});
