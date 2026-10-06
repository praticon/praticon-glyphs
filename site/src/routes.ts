/** Public URL of the deployed site, used for canonical links and social previews. */
export const SITE_URL = "https://praticon.github.io/praticon-glyphs/";

export type Route = { page: "browse"; icon?: string } | { page: "not-found" };

/** URL path of an icon's page, relative to the site's base path. */
export const iconPath = (base: string, name: string) => `${base}icons/${name}/`;

/**
 * Maps a pathname to a page. `base` is Vite's BASE_URL (e.g. "/praticon-glyphs/");
 * unknown icons and paths outside the site resolve to "not-found".
 */
export function parseRoute(pathname: string, base: string, iconNames: ReadonlySet<string>): Route {
  if (!pathname.startsWith(base) && `${pathname}/` !== base) return { page: "not-found" };
  const rest = pathname.slice(base.length).replace(/\/+$/, "");
  if (rest === "" || rest === "index.html") return { page: "browse" };
  const match = rest.match(/^icons\/([a-z0-9-]+)$/);
  if (match && iconNames.has(match[1])) return { page: "browse", icon: match[1] };
  return { page: "not-found" };
}
