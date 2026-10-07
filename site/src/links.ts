export const REPO_URL = "https://github.com/praticon/praticon-glyphs";

/** A suggested icon name for a search: `File Lock!` → `file-lock`. */
const toIconName = (search: string) =>
  search
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

/** Opens the icon request form, with the title and name filled in from a search when there is one. */
export function iconRequestUrl(search = ""): string {
  const params = new URLSearchParams({ template: "icon-request.yml" });
  const name = toIconName(search);
  if (name) {
    params.set("title", `Icon request: ${name}`);
    params.set("icon-name", name);
  }
  return `${REPO_URL}/issues/new?${params}`;
}
