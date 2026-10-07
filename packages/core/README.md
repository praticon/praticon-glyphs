# @praticon-glyphs/core

[Praticon](https://github.com/praticon/praticon-glyphs) icons as optimised SVG files, an SVG sprite, an icon font, icon data and metadata, for any framework or none.

```sh
npm i @praticon-glyphs/core
```

```js
import { icons, metadata, toSvg } from "@praticon-glyphs/core";

toSvg("arrow-left");                                   // "<svg …>…</svg>"
toSvg("terminal", { size: 20, color: "#5b21b6", strokeWidth: 1.5, attrs: { class: "icon" } });
icons["arrow-left"];                                   // [["path", { d: "M20 12H4" }], …]
metadata.find((icon) => icon.name === "cookie");       // { category, tags, aliases, … }
```

Raw files: `@praticon-glyphs/core/svg/<name>.svg` and `@praticon-glyphs/core/metadata.json`.

**SVG sprite:** `@praticon-glyphs/core/sprite.svg`, one `<symbol>` per icon with the icon's name as its id. Serve it from your own origin:

```html
<svg width="24" height="24" stroke-width="2" aria-hidden="true"><use href="/sprite.svg#arrow-left" /></svg>
```

**Icon font:** `@praticon-glyphs/core/font/praticon.css` and `praticon.woff2`, with codepoints in `font/codepoints.json`. Each icon keeps its codepoint between releases:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@praticon-glyphs/core/font/praticon.css" />
<i class="praticon praticon-arrow-left" aria-hidden="true"></i>
```

For components, use [`@praticon-glyphs/react`](https://www.npmjs.com/package/@praticon-glyphs/react), [`vue`](https://www.npmjs.com/package/@praticon-glyphs/vue), [`svelte`](https://www.npmjs.com/package/@praticon-glyphs/svelte) or [`elements`](https://www.npmjs.com/package/@praticon-glyphs/elements) (Web Components).

MIT licensed.
