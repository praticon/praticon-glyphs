# @praticon-glyphs/elements

## 0.3.0

### Minor Changes

- f43f007: Add `@praticon-glyphs/elements`, which makes every icon a Web Component (`<praticon-arrow-left size="32">`) for any framework or plain HTML. Importing the package registers every tag; importing `icons/<name>` registers only that one.
  
  `@praticon-glyphs/core` now also ships an SVG sprite (`sprite.svg`, one `<symbol>` per icon) and an icon font (`font/praticon.css` and `font/praticon.woff2`). The font's strokes are converted to exact outlines, and each icon keeps its codepoint between releases.
