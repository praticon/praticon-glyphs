import type { IconMetadata } from "@praticon-glyphs/core";
import { SITE_URL, type Route } from "./routes.ts";

export interface Head {
  title: string;
  description: string;
  /** Absolute URL of the page. */
  url: string;
  /** Absolute URL of the 1200 × 630 social preview image. */
  image: string;
}

const SITE_TITLE = "Praticon Icons";

export function headFor(route: Route, metadata: readonly IconMetadata[]): Head {
  const icon = route.page === "browse" && route.icon ? metadata.find((i) => i.name === route.icon) : undefined;
  if (icon) {
    const words = [...new Set([...icon.tags, ...icon.aliases])].slice(0, 5).join(", ");
    return {
      title: `${icon.name} icon · ${SITE_TITLE}`,
      description: `The ${icon.name} icon from Praticon (${words}). Copy it as a React component or SVG, or download the SVG. MIT licensed.`,
      url: `${SITE_URL}icons/${icon.name}/`,
      image: `${SITE_URL}og/${icon.name}.png`,
    };
  }
  if (route.page === "docs") {
    return {
      title: `Getting started · ${SITE_TITLE}`,
      description:
        "Install Praticon and use its icons as React components or plain SVG: props, imports, accessibility, styling, TypeScript and custom icons.",
      url: `${SITE_URL}docs/`,
      image: `${SITE_URL}og/praticon.png`,
    };
  }
  return {
    title: route.page === "not-found" ? `Page not found · ${SITE_TITLE}` : SITE_TITLE,
    description: `Search and copy ${metadata.length} crafted, grid-based SVG icons for web development, as React components or plain SVG. MIT licensed.`,
    url: SITE_URL,
    image: `${SITE_URL}og/praticon.png`,
  };
}

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The <head> tags that differ between pages. */
export function renderHead(head: Head): string {
  const t = escape(head.title);
  const d = escape(head.description);
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${escape(head.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Praticon" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${escape(head.url)}" />`,
    `<meta property="og:image" content="${escape(head.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");
}
