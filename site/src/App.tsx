import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { metadata, type IconMetadata } from "@praticon-glyphs/core";
import { CheckIcon, FolderIcon, SearchIcon } from "@praticon-glyphs/react";
import corePackage from "@praticon-glyphs/core/package.json";
import { copyText, downloadSvg, isPlainClick } from "./browser.ts";
import { Docs } from "./Docs.tsx";
import { Hero } from "./components/Hero.tsx";
import { IconDetail } from "./components/IconDetail.tsx";
import { IconGrid } from "./components/IconGrid.tsx";
import { SiteFooter } from "./components/SiteFooter.tsx";
import { SiteHeader } from "./components/SiteHeader.tsx";
import { Toolbar, type Filter } from "./components/Toolbar.tsx";
import { usePersistentState } from "./persist.ts";
import { iconPath, parseRoute, pathFor, type Route } from "./routes.ts";
import { searchIcons } from "./search.ts";
import { headFor } from "./seo.ts";
import { DEFAULT_STYLE, FORMATS, componentName, isFormat, snippet, type IconStyle } from "./snippets.ts";

export const BASE = import.meta.env.BASE_URL;
const ICON_NAMES = new Set(metadata.map((icon) => icon.name));
const REPO_URL = "https://github.com/praticon/praticon-glyphs";
const INSTALL_COMMAND = "npm i @praticon-glyphs/react";

/** The route for the current browser location. Only call this in the browser. */
export const currentRoute = () => parseRoute(location.pathname, BASE, ICON_NAMES);

const isStyle = (value: unknown): value is IconStyle => {
  const v = value as Partial<IconStyle> | null;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.size === "number" &&
    typeof v.strokeWidth === "number" &&
    (v.color === undefined || /^#[0-9a-f]{6}$/i.test(v.color))
  );
};
const isNameList = (value: unknown): value is string[] => Array.isArray(value) && value.every((v) => typeof v === "string");

export function App({ initialRoute }: { initialRoute: Route }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [style, setStyle] = usePersistentState("style", DEFAULT_STYLE, isStyle);
  const [savedList, setSavedList] = usePersistentState<string[]>("saved", [], isNameList);
  const [format, setFormat] = usePersistentState("format", "react", isFormat);
  const [route, setRoute] = useState<Route>(initialRoute);
  const [toast, setToast] = useState<{ id: number; message: string }>();
  const searchRef = useRef<HTMLInputElement>(null);

  const saved = useMemo(() => new Set(savedList.filter((name) => ICON_NAMES.has(name))), [savedList]);
  const selected = route.page === "browse" ? route.icon : undefined;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const deferredQuery = useDeferredValue(query);
  const results = useMemo<IconMetadata[]>(() => {
    if (filter === "saved") return searchIcons(metadata, deferredQuery).filter((icon) => saved.has(icon.name));
    return searchIcons(metadata, deferredQuery, filter === "all" ? undefined : filter);
  }, [deferredQuery, filter, saved]);
  const selectedIcon = metadata.find((icon) => icon.name === selected);

  const notify = useCallback((message: string) => setToast({ id: Date.now(), message }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(undefined), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const copy = useCallback(
    async (text: string, what: string) => notify((await copyText(text)) ? `${what} copied` : "Copy failed, select the text instead"),
    [notify],
  );
  const copyCode = useCallback(
    (name: string) => copy(snippet(format, name, style), format === "svg" ? `${name}.svg markup` : `<${componentName(name)} />`),
    [copy, format, style],
  );
  const copyCodeRef = useRef(copyCode);
  copyCodeRef.current = copyCode;

  const toggleSaved = useCallback(
    (name: string) => {
      const wasSaved = saved.has(name);
      setSavedList((list) => (wasSaved ? list.filter((n) => n !== name) : [...list, name]));
      notify(wasSaved ? `Removed ${name} from saved` : `Saved ${name}`);
    },
    [saved, setSavedList, notify],
  );

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
    if (next.page === "browse" && next.icon) document.getElementById("icons")?.scrollIntoView({ behavior: "smooth" });
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if ((event.key === "/" || (event.key === "k" && (event.metaKey || event.ctrlKey))) && !typing && searchRef.current) {
        event.preventDefault();
        searchRef.current.focus();
        searchRef.current.scrollIntoView({ block: "nearest" });
      } else if (event.key === "Escape" && selectedRef.current) {
        select(undefined);
      } else if ((event.key === "c" || event.key === "C") && !typing && selectedRef.current) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        copyCodeRef.current(selectedRef.current);
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
    // Arriving on an icon's page (from search or a shared link): show the icon, not the hero.
    const arrived = currentRoute();
    if ((arrived.page === "browse" && arrived.icon) || ICON_NAMES.has(legacy)) {
      document.getElementById("icons")?.scrollIntoView();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPopState);
    };
  }, [select]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader base={BASE} route={route} version={corePackage.version} linkTo={linkTo} />

      {route.page === "docs" ? (
        <Docs onCopy={(text) => copy(text, "Code")} />
      ) : (
        <>
          <Hero
            base={BASE}
            headingLevel={selectedIcon ? "p" : "h1"}
            installCommand={INSTALL_COMMAND}
            onCopy={copy}
            linkTo={linkTo}
          />

          <div id="icons" className="browser">
            <Toolbar
              query={query}
              onQuery={setQuery}
              filter={filter}
              onFilter={setFilter}
              savedCount={saved.size}
              style={style}
              onStyle={setStyle}
              searchRef={searchRef}
            />

            <main id="main" className="layout">
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
                    {results.length === metadata.length
                      ? `${results.length} icons`
                      : `${results.length} of ${metadata.length} icons`}
                  </p>
                  <p className="shortcuts">
                    Arrow keys move · <kbd>Enter</kbd> open · <kbd>C</kbd> copy {FORMATS.find(([f]) => f === format)![1]} · <kbd>/</kbd> search
                  </p>
                </div>

                {results.length ? (
                  <IconGrid
                    base={BASE}
                    icons={results}
                    selected={selected}
                    saved={saved}
                    style={style}
                    onSelect={select}
                    format={format}
                    onCopyCode={copyCode}
                    onToggleSaved={toggleSaved}
                  />
                ) : filter === "saved" && !query ? (
                  <div className="empty">
                    <FolderIcon size={32} aria-hidden="true" />
                    <p>
                      <strong>No saved icons yet.</strong> Star icons you use often and they will wait for you here on
                      your next visit.
                    </p>
                  </div>
                ) : (
                  <div className="empty">
                    <SearchIcon size={32} aria-hidden="true" />
                    <p>
                      <strong>No icons match “{query}”.</strong> Try a broader word, or{" "}
                      <a className="text-link" href={`${REPO_URL}/issues/new?title=${encodeURIComponent(`Icon request: ${query}`)}`}>
                        request this icon
                      </a>
                      .
                    </p>
                  </div>
                )}
              </div>

              {selectedIcon && (
                <IconDetail
                  icon={selectedIcon}
                  style={style}
                  format={format}
                  onFormat={setFormat}
                  isSaved={saved.has(selectedIcon.name)}
                  headingLevel="h1"
                  onClose={() => select(undefined)}
                  onCopy={copy}
                  onDownload={downloadSvg}
                  onToggleSaved={toggleSaved}
                />
              )}
            </main>
          </div>
        </>
      )}

      <SiteFooter base={BASE} linkTo={linkTo} />

      <div className="toast" role="status" aria-live="polite" hidden={!toast}>
        {toast && (
          <span key={toast.id} className="toast-message">
            <CheckIcon size={16} aria-hidden="true" />
            {toast.message}
          </span>
        )}
      </div>
    </div>
  );
}
