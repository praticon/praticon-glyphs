import type { MouseEvent } from "react";
import { BracketsIcon } from "@praticon-glyphs/react";
import { iconRequestUrl, REPO_URL } from "../links.ts";
import { docsPath, type Route } from "../routes.ts";

export function SiteFooter({ base, linkTo }: { base: string; linkTo: (route: Route) => (event: MouseEvent) => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="wordmark-mark" aria-hidden="true">
            <BracketsIcon size={18} strokeWidth={2.5} />
          </span>
          <p>
            <strong>Praticon.</strong> Symbols, crafted. Drawn on a 24 × 24 grid with a 2 px round stroke, and MIT licensed.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <div>
            <p className="footer-heading">Icons</p>
            <a href={base} onClick={linkTo({ page: "browse" })}>
              Browse all
            </a>
            <a href={docsPath(base)} onClick={linkTo({ page: "docs" })}>
              Getting started
            </a>
          </div>
          <div>
            <p className="footer-heading">Packages</p>
            <a href="https://www.npmjs.com/package/@praticon-glyphs/react">@praticon-glyphs/react</a>
            <a href="https://www.npmjs.com/package/@praticon-glyphs/vue">@praticon-glyphs/vue</a>
            <a href="https://www.npmjs.com/package/@praticon-glyphs/svelte">@praticon-glyphs/svelte</a>
            <a href="https://www.npmjs.com/package/@praticon-glyphs/core">@praticon-glyphs/core</a>
          </div>
          <div>
            <p className="footer-heading">Project</p>
            <a href={REPO_URL}>GitHub</a>
            <a href={`${REPO_URL}/releases`}>Releases</a>
            <a href={iconRequestUrl()}>Request an icon</a>
            <a href={`${REPO_URL}#contributing-an-icon`}>Contribute an icon</a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
