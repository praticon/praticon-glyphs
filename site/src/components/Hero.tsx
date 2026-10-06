import { useEffect, useState, type MouseEvent } from "react";
import { categories, metadata, type IconName } from "@praticon-glyphs/core";
import { ArrowDownIcon, ArrowRightIcon, CopyIcon } from "@praticon-glyphs/react";
import { iconPath, docsPath, type Route } from "../routes.ts";
import { DrawnIcon, GridGuide } from "./DrawnIcon.tsx";

/** Icons the specimen cycles through: ones with enough detail to be worth watching being drawn. */
const FEATURED: IconName[] = ["terminal", "file-code", "settings", "regex", "cookie", "network", "brackets", "globe"];
const CYCLE_MS = 3200;

export function Hero({
  base,
  headingLevel,
  installCommand,
  onCopy,
  linkTo,
}: {
  base: string;
  headingLevel: "h1" | "p";
  installCommand: string;
  onCopy: (text: string, what: string) => void;
  linkTo: (route: Route) => (event: MouseEvent) => void;
}) {
  const Heading = headingLevel;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Open-source icons for web developers</p>
        <Heading id="hero-title" className="hero-title">
          Symbols, <span className="hero-title-accent">crafted.</span>
        </Heading>
        <p className="hero-lede">
          {metadata.length} icons for developer tools, docs and dashboards, each drawn by hand on a 24-unit grid. Use
          them as typed React, Vue or Svelte components, or as plain SVG.
        </p>
        <div className="hero-actions">
          <a className="button primary large" href="#icons">
            Browse icons
            <ArrowDownIcon size={18} aria-hidden="true" />
          </a>
          <a className="button large" href={docsPath(base)} onClick={linkTo({ page: "docs" })}>
            Get started
          </a>
        </div>
        <div className="install">
          <code className="mono">
            <span className="prompt" aria-hidden="true">
              $
            </span>{" "}
            {installCommand}
          </code>
          <button
            type="button"
            className="icon-button"
            aria-label="Copy install command"
            onClick={() => onCopy(installCommand, "Install command")}
          >
            <CopyIcon size={16} />
          </button>
        </div>
        <dl className="hero-stats">
          <div>
            <dt>Icons</dt>
            <dd className="mono">{metadata.length}</dd>
          </div>
          <div>
            <dt>Categories</dt>
            <dd className="mono">{categories.length}</dd>
          </div>
          <div>
            <dt>Grid</dt>
            <dd className="mono">24 × 24</dd>
          </div>
          <div>
            <dt>Licence</dt>
            <dd className="mono">MIT</dd>
          </div>
        </dl>
      </div>

      <Specimen base={base} linkTo={linkTo} />
    </section>
  );
}

function Specimen({ base, linkTo }: { base: string; linkTo: (route: Route) => (event: MouseEvent) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const name = FEATURED[index];

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % FEATURED.length), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused]);

  const position = String(index + 1).padStart(2, "0");
  return (
    <figure
      className="specimen"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="specimen-head mono">
        <span>Specimen</span>
        <span aria-hidden="true">
          {position} / {String(FEATURED.length).padStart(2, "0")}
        </span>
      </div>
      <a
        className="specimen-canvas"
        href={iconPath(base, name)}
        onClick={linkTo({ page: "browse", icon: name })}
        aria-label={`Open the ${name} icon`}
      >
        <span className="axis axis-x mono" aria-hidden="true">
          <span>0</span>
          <span>12</span>
          <span>24</span>
        </span>
        <span className="axis axis-y mono" aria-hidden="true">
          <span>0</span>
          <span>12</span>
          <span>24</span>
        </span>
        <GridGuide className="specimen-grid" />
        <DrawnIcon key={name} name={name} className="specimen-icon draw" />
      </a>
      <figcaption className="specimen-foot">
        <span className="specimen-name mono">{name}</span>
        <span className="specimen-spec mono">stroke 2 · round caps · round joins</span>
        <button
          type="button"
          className="icon-button"
          aria-label="Show the next icon"
          onClick={() => setIndex((i) => (i + 1) % FEATURED.length)}
        >
          <ArrowRightIcon size={16} />
        </button>
      </figcaption>
      <div className="specimen-progress" aria-hidden="true">
        <span key={`${name}-${paused}`} className={paused ? "paused" : undefined} />
      </div>
    </figure>
  );
}
