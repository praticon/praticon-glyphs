import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App, currentRoute } from "./App.tsx";
import type { Route } from "./routes.ts";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";

const root = document.getElementById("root")!;

// Pre-rendered pages record the route they were built for. Hydrate with that
// route so the markup matches even if the host served a different file (some
// servers answer unknown paths with index.html); App then syncs to the URL.
const renderedRoute = root.dataset.route ? (JSON.parse(root.dataset.route) as Route) : undefined;

if (renderedRoute && root.firstElementChild) {
  hydrateRoot(
    root,
    <StrictMode>
      <App initialRoute={renderedRoute} />
    </StrictMode>,
  );
} else {
  createRoot(root).render(
    <StrictMode>
      <App initialRoute={currentRoute()} />
    </StrictMode>,
  );
}
