# @praticon-glyphs/core

[Praticon](https://github.com/praticon/praticon-glyphs) icons as optimised SVG files, icon data and metadata, for any framework or none.

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

For React, use [`@praticon-glyphs/react`](https://www.npmjs.com/package/@praticon-glyphs/react).

MIT licensed.
