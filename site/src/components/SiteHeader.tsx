import type { MouseEvent } from "react";
import { BracketsIcon, ExternalLinkIcon } from "@praticon-glyphs/react";
import { docsPath, type Route } from "../routes.ts";
import { Moon, Sun } from "../ui-icons.ts";

const THEME_KEY = "praticon:theme";

/** Flips between light and dark, starting from whatever is showing now (including the system setting). */
function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // The theme still changes for this visit.
  }
}

export function SiteHeader({
  base,
  route,
  version,
  linkTo,
}: {
  base: string;
  route: Route;
  version: string;
  linkTo: (route: Route) => (event: MouseEvent) => void;
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="wordmark" href={base} onClick={linkTo({ page: "browse" })} aria-label="Praticon home">
          <span className="wordmark-mark" aria-hidden="true">
            <BracketsIcon size={18} strokeWidth={2.5} />
          </span>
          <span className="wordmark-name">Praticon</span>
          <span className="wordmark-version mono">v{version}</span>
        </a>

        <nav className="site-nav" aria-label="Site">
          <a href={base} aria-current={route.page !== "docs" ? "page" : undefined} onClick={linkTo({ page: "browse" })}>
            Icons
          </a>
          <a href={docsPath(base)} aria-current={route.page === "docs" ? "page" : undefined} onClick={linkTo({ page: "docs" })}>
            <span className="label-long">Getting started</span>
            <span className="label-short">Docs</span>
          </a>
          <a href="https://github.com/praticon/praticon-glyphs" className="nav-external">
            GitHub
            <ExternalLinkIcon size={14} aria-hidden="true" />
          </a>
        </nav>

        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Switch between light and dark theme">
          <Sun size={18} className="theme-icon-sun" aria-hidden="true" />
          <Moon size={18} className="theme-icon-moon" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
