import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { categories, metadata, type IconCategory, type IconMetadata, type IconName } from "@praticon-glyphs/core";
import * as Praticon from "@praticon-glyphs/react";
import corePackage from "@praticon-glyphs/core/package.json";
import { Docs } from "./Docs.tsx";
import { columnCount, nextIndex } from "./grid-nav.ts";
import { docsPath, iconPath, parseRoute, pathFor, type Route } from "./routes.ts";
import { searchIcons } from "./search.ts";
import { headFor } from "./seo.ts";
import { DEFAULT_STYLE, componentName, jsxSnippet, svgSnippet, type IconStyle } from "./snippets.ts";

const components = Praticon as unknown as Record<string, Praticon.PraticonIcon>;
const iconComponent = (name: string) => components[componentName(name)];

const CATEGORY_LABELS: Record<IconCategory, string> = {
  "core-ui": "Core UI",
  code: "Code & editor",
  browser: "Browser & web",
};

const REPO_URL = "https://github.com/praticon/praticon-glyphs";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

function downloadSvg(name: string, svg: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: `${name}.svg` });
  link.click();
  URL.revokeObjectURL(url);
}

export const BASE = import.meta.env.BASE_URL;
const ICON_NAMES = new Set(metadata.map((icon) => icon.name));

/** The route for the current browser location. Only call this in the browser. */
export const currentRoute = () => parseRoute(location.pathname, BASE, ICON_NAMES);

/** Plain left clicks are handled in the app; modified clicks open links as usual. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export function App({ initialRoute }: { initialRoute: Route }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory | undefined>();
  const [style, setStyle] = useState<IconStyle>(DEFAULT_STYLE);
  const [route, setRoute] = useState<Route>(initialRoute);
  const [toast, setToast] = useState<string | undefined>();
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = route.page === "browse" ? route.icon : undefined;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => searchIcons(metadata, deferredQuery, category), [deferredQuery, category]);
  const selectedIcon = metadata.find((icon) => icon.name === selected);

  const navigate = useCallback((next: Route) => {
    setRoute(next);
    history.pushState(null, "", pathFor(BASE, next));
    if (next.page === "docs") window.scrollTo(0, 0);
  }, []);
  const select = useCallback((name: string | undefined) => navigate({ page: "browse", icon: name }), [navigate]);

  /** onClick for in-app links: plain clicks navigate without a reload. */
  const linkTo = (next: Route) => (event: MouseEvent) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    navigate(next);
  };

  useEffect(() => {
    document.title = headFor(route, metadata).title;
  }, [route]);

  // The sticky toolbar's height changes with the viewport width and wrapping;
  // expose it so focused tiles can scroll clear of it (see .tile in styles.css).
  useEffect(() => {
    const toolbar = document.querySelector<HTMLElement>(".toolbar");
    if (!toolbar) return;
    const observer = new ResizeObserver(() =>
      document.documentElement.style.setProperty("--toolbar-height", `${toolbar.offsetHeight}px`),
    );
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, [route.page]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(undefined), 1800);
  }, []);

  /** Copies an icon's JSX with the current size, stroke and colour. */
  const copyJsx = useCallback(
    async (name: string) =>
      notify((await copyText(jsxSnippet(name, style))) ? `<${componentName(name)} /> copied` : "Copy failed, select the text instead"),
    [notify, style],
  );
  const copyJsxRef = useRef(copyJsx);
  copyJsxRef.current = copyJsx;

  /** Arrow keys move between tiles, Home/End jump to the ends, C copies the focused icon. */
  const onGridKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const tile = (event.target as HTMLElement).closest<HTMLAnchorElement>("a.tile");
    if (!tile || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "c" || event.key === "C") {
      event.preventDefault();
      event.stopPropagation();
      copyJsx(tile.dataset.name!);
      return;
    }
    const tiles = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a.tile"));
    const next = nextIndex(tiles.indexOf(tile), event.key, tiles.length, columnCount(tiles));
    if (next === undefined) return;
    event.preventDefault();
    tiles[next].focus();
  };

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === "Escape" && selectedRef.current) {
        select(undefined);
      } else if ((event.key === "c" || event.key === "C") && !typing && selectedRef.current) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        copyJsxRef.current(selectedRef.current);
      }
    };
    const onPopState = () => setRoute(currentRoute());
    onPopState();
    // Links from before icon pages existed point at #name; move them to the icon's page.
    const legacy = decodeURIComponent(location.hash.slice(1));
    if (ICON_NAMES.has(legacy)) {
      history.replaceState(null, "", iconPath(BASE, legacy));
      setRoute({ page: "browse", icon: legacy });
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPopState);
    };
  }, [select]);

  const iconStyle = { color: style.color };

  return (
    <div className="page">
      <header className="masthead">
        <div className="brand">
          <span className="logo" aria-hidden="true">
            <Praticon.Brackets size={28} strokeWidth={2.25} />
          </span>
          <div>
            {route.page === "docs" ? <p className="brand-name">Praticon</p> : <h1 className="brand-name">Praticon</h1>}
            <p className="tagline">Symbols, crafted. Grid-based SVG icons for web development.</p>
          </div>
        </div>
        <div className="masthead-meta">
          <nav className="site-nav" aria-label="Site">
            <a href={BASE} aria-current={route.page !== "docs" ? "page" : undefined} onClick={linkTo({ page: "browse" })}>
              Icons
            </a>
            <a href={docsPath(BASE)} aria-current={route.page === "docs" ? "page" : undefined} onClick={linkTo({ page: "docs" })}>
              Getting started
            </a>
          </nav>
          <span className="badge mono">v{corePackage.version}</span>
          <span className="badge">{metadata.length} icons</span>
          <span className="badge">MIT</span>
          <a className="text-link" href={REPO_URL}>
            GitHub
          </a>
        </div>
        <InstallCommand onCopy={notify} />
      </header>

      {route.page === "docs" ? (
        <Docs onCopy={async (text) => notify((await copyText(text)) ? "Code copied" : "Copy failed, select the text instead")} />
      ) : (
        <>
      <section className="toolbar" aria-label="Search and customise icons">
        <div className="search">
          <Praticon.Search size={18} aria-hidden="true" />
          <input
            ref={searchRef}
            id="icon-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${metadata.length} icons by name or tag`}
            aria-label="Search icons"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd aria-hidden="true">/</kbd>
        </div>

        <div className="chips" role="group" aria-label="Category">
          <button type="button" className="chip" aria-pressed={!category} onClick={() => setCategory(undefined)}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <StyleControls style={style} onChange={setStyle} />
      </section>

      <main className="layout">
        <div className="results">
          {route.page === "not-found" && (
            <p className="notice" role="status">
              That page does not exist, but every Praticon icon is below.{" "}
              <a className="text-link" href={BASE} onClick={linkTo({ page: "browse" })}>
                Go to the home page
              </a>
            </p>
          )}
          <div className="results-bar">
            <p className="count" aria-live="polite">
              {results.length === metadata.length ? `${results.length} icons` : `${results.length} of ${metadata.length} icons`}
            </p>
            <p className="shortcuts">
              Arrow keys move · <kbd>Enter</kbd> open · <kbd>C</kbd> copy JSX
            </p>
          </div>
          {results.length ? (
            <ul className="grid" style={iconStyle} onKeyDown={onGridKeyDown}>
              {results.map((icon) => {
                const Icon = iconComponent(icon.name);
                return (
                  <li key={icon.name} className="tile-cell">
                    <a
                      className="tile"
                      data-name={icon.name}
                      href={iconPath(BASE, icon.name)}
                      aria-current={icon.name === selected ? "page" : undefined}
                      onClick={(event) => {
                        if (!isPlainClick(event)) return;
                        event.preventDefault();
                        select(icon.name === selected ? undefined : icon.name);
                      }}
                    >
                      <Icon size={style.size} strokeWidth={style.strokeWidth} aria-hidden="true" />
                      <span className="tile-name mono">{icon.name}</span>
                    </a>
                    <button
                      type="button"
                      className="tile-copy"
                      tabIndex={-1}
                      aria-label={`Copy ${componentName(icon.name)} JSX`}
                      title="Copy JSX"
                      onClick={() => copyJsx(icon.name)}
                    >
                      <Praticon.Copy size={14} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty">
              <Praticon.Search size={32} aria-hidden="true" />
              <p>
                No icons match “{query}”. Try a broader word, or{" "}
                <a className="text-link" href={`${REPO_URL}/issues/new?title=${encodeURIComponent(`Icon request: ${query}`)}`}>
                  request this icon
                </a>
                .
              </p>
            </div>
          )}
        </div>

        {selectedIcon && (
          <IconDetail icon={selectedIcon} style={style} onClose={() => select(undefined)} onCopy={notify} />
        )}
      </main>
        </>
      )}

      <footer className="footer">
        <span>
          Praticon is MIT licensed. Icons are drawn on a 24 × 24 grid with a 2 px round stroke and use{" "}
          <code>currentColor</code>.
        </span>
        <a className="text-link" href={`${REPO_URL}#contributing-an-icon`}>
          Contribute an icon
        </a>
      </footer>

      <div className="toast" role="status" aria-live="polite" hidden={!toast}>
        {toast}
      </div>
    </div>
  );
}

function InstallCommand({ onCopy }: { onCopy: (message: string) => void }) {
  const command = "npm i @praticon-glyphs/react";
  return (
    <div className="install">
      <code className="mono">
        <span className="prompt" aria-hidden="true">
          $
        </span>{" "}
        {command}
      </code>
      <button
        type="button"
        className="icon-button"
        aria-label="Copy install command"
        onClick={async () => onCopy((await copyText(command)) ? "Install command copied" : "Copy failed, select the text instead")}
      >
        <Praticon.Copy size={18} />
      </button>
    </div>
  );
}

function StyleControls({ style, onChange }: { style: IconStyle; onChange: (style: IconStyle) => void }) {
  const changed = style.size !== DEFAULT_STYLE.size || style.strokeWidth !== DEFAULT_STYLE.strokeWidth || style.color;
  return (
    <div className="controls">
      <label className="control">
        <span>Size</span>
        <input
          id="icon-size"
          type="range"
          min={16}
          max={48}
          step={4}
          value={style.size}
          onChange={(event) => onChange({ ...style, size: Number(event.target.value) })}
        />
        <output className="mono">{style.size}px</output>
      </label>
      <label className="control">
        <span>Stroke</span>
        <input
          id="icon-stroke"
          type="range"
          min={1}
          max={3}
          step={0.25}
          value={style.strokeWidth}
          onChange={(event) => onChange({ ...style, strokeWidth: Number(event.target.value) })}
        />
        <output className="mono">{style.strokeWidth}</output>
      </label>
      <label className="control">
        <span>Colour</span>
        <input
          id="icon-color"
          type="color"
          className={style.color ? undefined : "unset"}
          value={style.color ?? "#5b21b6"}
          title="Pick a colour"
          onChange={(event) => onChange({ ...style, color: event.target.value })}
        />
        <output className="mono">{style.color ?? "text colour"}</output>
      </label>
      <button type="button" className="text-button" disabled={!changed} onClick={() => onChange(DEFAULT_STYLE)}>
        Reset
      </button>
    </div>
  );
}

function IconDetail({
  icon,
  style,
  onClose,
  onCopy,
}: {
  icon: IconMetadata;
  style: IconStyle;
  onClose: () => void;
  onCopy: (message: string) => void;
}) {
  const [tab, setTab] = useState<"react" | "svg">("react");
  const Icon = iconComponent(icon.name);
  const svg = svgSnippet(icon.name as IconName, style);
  const code = tab === "react" ? jsxSnippet(icon.name, style) : svg;
  const copy = async (text: string, what: string) =>
    onCopy((await copyText(text)) ? `${what} copied` : "Copy failed, select the text instead");

  return (
    <aside className="detail" aria-label={`${icon.name} details`}>
      <div className="detail-head">
        <h2 className="mono">{icon.name}</h2>
        <button type="button" className="icon-button" aria-label="Close details" onClick={onClose}>
          <Praticon.Close size={18} />
        </button>
      </div>

      <div className="preview" style={{ color: style.color }}>
        <svg className="preview-grid" viewBox="0 0 24 24" aria-hidden="true">
          {Array.from({ length: 23 }, (_, i) => (
            <g key={i}>
              <line x1={i + 1} y1={0} x2={i + 1} y2={24} />
              <line x1={0} y1={i + 1} x2={24} y2={i + 1} />
            </g>
          ))}
          <rect className="live-area" x={2} y={2} width={20} height={20} />
        </svg>
        <Icon className="preview-icon" size="100%" strokeWidth={style.strokeWidth} aria-label={icon.name} />
      </div>
      <div className="sizes" style={{ color: style.color }} aria-label="Actual sizes">
        {[16, 20, 24, 32].map((size) => (
          <figure key={size}>
            <Icon size={size} strokeWidth={style.strokeWidth} />
            <figcaption className="mono">{size}</figcaption>
          </figure>
        ))}
      </div>

      <dl className="facts">
        <div>
          <dt>Category</dt>
          <dd>{CATEGORY_LABELS[icon.category]}</dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd className="tags">
            {[...new Set([...icon.tags, ...icon.aliases])].map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>Since</dt>
          <dd className="mono">v{icon.since}</dd>
        </div>
      </dl>

      <div className="tabs" role="tablist" aria-label="Snippet format">
        <button type="button" role="tab" aria-selected={tab === "react"} onClick={() => setTab("react")}>
          React
        </button>
        <button type="button" role="tab" aria-selected={tab === "svg"} onClick={() => setTab("svg")}>
          SVG
        </button>
      </div>
      <pre className="code mono" tabIndex={0}>
        {code}
      </pre>
      <div className="actions">
        <button type="button" className="button primary" onClick={() => copy(code, tab === "react" ? "JSX" : "SVG")}>
          <Praticon.Copy size={16} /> Copy {tab === "react" ? "JSX" : "SVG"}
        </button>
        <button type="button" className="button" onClick={() => downloadSvg(icon.name, svg)}>
          <Praticon.Download size={16} /> Download SVG
        </button>
      </div>
    </aside>
  );
}
