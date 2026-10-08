# @praticon-glyphs/vue

## 0.3.0

### Minor Changes

- f43f007: Add `@praticon-glyphs/elements`, which makes every icon a Web Component (`<praticon-arrow-left size="32">`) for any framework or plain HTML. Importing the package registers every tag; importing `icons/<name>` registers only that one.
  
  `@praticon-glyphs/core` now also ships an SVG sprite (`sprite.svg`, one `<symbol>` per icon) and an icon font (`font/praticon.css` and `font/praticon.woff2`). The font's strokes are converted to exact outlines, and each icon keeps its codepoint between releases.

## 0.2.0

### Minor Changes

- eee87d7: Grow the set from 50 to 200 icons, adding seven categories: Layout & CSS, Devices, Version control, APIs & data, Build & deploy, Testing, and Security & speed. Core UI, Code & editor and Browser & web get new icons too, such as `bell`, `calendar`, `user`, `folder-open`, `keyboard`, `history` and `wifi`.
- 63d667b: Add `@praticon-glyphs/vue` and `@praticon-glyphs/svelte`, with the same icons, props, defaults and accessibility behaviour as the React package. Vue icons are functional components that pass attributes and slot content through to the `<svg>`; Svelte icons are Svelte 5 components, with an `Icon` component for drawing your own.
