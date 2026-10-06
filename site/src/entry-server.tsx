import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { icons, metadata } from "@praticon-glyphs/core";
import { App } from "./App.tsx";
import { SITE_URL, type Route } from "./routes.ts";
import { headFor, renderHead } from "./seo.ts";

export { SITE_URL, icons, metadata };
export type { Route };

/** Renders one page to HTML for the pre-render step in scripts/prerender.ts. */
export function render(route: Route): { head: string; html: string } {
  const html = renderToString(
    <StrictMode>
      <App initialRoute={route} />
    </StrictMode>,
  );
  return { head: renderHead(headFor(route, metadata)), html };
}
