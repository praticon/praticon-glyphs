/**
 * Runs after `vite build` and the SSR build. Writes a pre-rendered HTML page
 * for the home page and every icon, a 404 page, social preview images and a
 * sitemap into dist/.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import resvg from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const server = await import(pathToFileURL(join(root, "dist-server", "entry-server.js")).href);
const { render, metadata, icons, SITE_URL } = server;

const template = readFileSync(join(dist, "index.html"), "utf8");
if (!template.includes("<!--app-->") || !template.includes("<!--/head-->")) {
  throw new Error("dist/index.html is missing the <!--head--> or <!--app--> placeholders");
}

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function writePage(file, route) {
  const { head, html } = render(route);
  const page = template
    .replace(/<!--head-->[\s\S]*?<!--\/head-->/, head)
    .replace('<div id="root"><!--app--></div>', `<div id="root" data-route="${escape(JSON.stringify(route))}">${html}</div>`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
}

writePage(join(dist, "index.html"), { page: "browse" });
writePage(join(dist, "404.html"), { page: "not-found" });
for (const { name } of metadata) writePage(join(dist, "icons", name, "index.html"), { page: "browse", icon: name });

// Social preview images (1200 × 630)
const ACCENT = "#5b21b6";
const INK = "#17151f";
const MUTED = "#615d72";
const MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace";
const SANS = "'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";
const shapes = (name) =>
  icons[name].map(([tag, attrs]) => `<${tag}${Object.entries(attrs).map(([k, v]) => ` ${k}="${escape(v)}"`).join("")}/>`).join("");
const iconSvg = (name, x, y, size, color = ACCENT) =>
  `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes(name)}</svg>`;

function gridLines(x, y, size) {
  let lines = "";
  for (let i = 1; i < 24; i++) {
    const p = (i / 24) * size;
    lines += `<line x1="${x + p}" y1="${y}" x2="${x + p}" y2="${y + size}"/><line x1="${x}" y1="${y + p}" x2="${x + size}" y2="${y + p}"/>`;
  }
  return `<g stroke="#e9e7f1" stroke-width="1">${lines}</g>`;
}

function iconCard(icon) {
  const words = [...new Set([...icon.tags, ...icon.aliases])].slice(0, 4).join(" · ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6f6f9"/>
  <rect x="80" y="95" width="440" height="440" rx="36" fill="#ffffff" stroke="#e2e0ea" stroke-width="2"/>
  ${gridLines(120, 135, 360)}
  ${iconSvg(icon.name, 120, 135, 360)}
  <text x="590" y="250" font-family="${SANS}" font-size="30" font-weight="700" fill="${ACCENT}">Praticon</text>
  <text x="590" y="330" font-family="${MONO}" font-size="${icon.name.length > 12 ? 52 : 64}" font-weight="700" fill="${INK}">${escape(icon.name)}</text>
  <text x="590" y="385" font-family="${SANS}" font-size="28" fill="${MUTED}">${escape(words)}</text>
  <text x="590" y="470" font-family="${MONO}" font-size="24" fill="${MUTED}">npm i @praticon-glyphs/react</text>
</svg>`;
}

function homeCard() {
  const names = metadata.map((i) => i.name).filter((n) => !n.startsWith("chevron") && !n.startsWith("arrow")).slice(0, 15);
  const tiles = names
    .map((name, i) => {
      const x = 640 + (i % 5) * 100;
      const y = 165 + Math.floor(i / 5) * 100;
      return `<rect x="${x}" y="${y}" width="84" height="84" rx="16" fill="#ffffff" stroke="#e2e0ea" stroke-width="2"/>${iconSvg(name, x + 18, y + 18, 48, i % 4 === 0 ? ACCENT : INK)}`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6f6f9"/>
  <rect x="80" y="165" width="96" height="96" rx="24" fill="${ACCENT}"/>
  ${iconSvg("brackets", 104, 189, 48, "#ffffff")}
  <text x="80" y="345" font-family="${SANS}" font-size="72" font-weight="700" fill="${INK}">Praticon</text>
  <text x="80" y="400" font-family="${SANS}" font-size="30" fill="${MUTED}">Symbols, crafted.</text>
  <text x="80" y="445" font-family="${SANS}" font-size="26" fill="${MUTED}">${metadata.length} grid-based SVG icons</text>
  <text x="80" y="480" font-family="${SANS}" font-size="26" fill="${MUTED}">for web development</text>
  ${tiles}
</svg>`;
}

const png = (svg) => new resvg.Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng();
mkdirSync(join(dist, "og"), { recursive: true });
writeFileSync(join(dist, "og", "praticon.png"), png(homeCard()));
for (const icon of metadata) writeFileSync(join(dist, "og", `${icon.name}.png`), png(iconCard(icon)));

// Sitemap. robots.txt is only read at the domain root (praticon.github.io), which
// this project site does not control, so submit the sitemap in Search Console instead.
const urls = [SITE_URL, ...metadata.map(({ name }) => `${SITE_URL}icons/${name}/`)];
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`,
);

console.log(`✔ pre-rendered ${metadata.length + 2} pages and ${metadata.length + 1} preview images`);
