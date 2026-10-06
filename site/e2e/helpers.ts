import { expect, type Page } from "@playwright/test";

/** Fails the test if the page logs an error or throws, including hydration mismatches. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  return () => expect(errors, "console errors").toEqual([]);
}

export const clipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

/** Waits for the clipboard to end with the given text. */
export const expectClipboardEnd = (page: Page, text: string) =>
  expect.poll(() => clipboard(page)).toMatch(new RegExp(`${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));

export const focusedTile = (page: Page) => page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.name);
