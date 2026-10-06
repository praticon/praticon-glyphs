# @praticon-glyphs/react

[Praticon](https://github.com/praticon/praticon-glyphs) icons as typed, tree-shakeable React components.

```sh
npm i @praticon-glyphs/react
```

```tsx
import { ArrowLeft, Terminal } from "@praticon-glyphs/react";

<ArrowLeft />
<ArrowLeft size={32} strokeWidth={1.5} />
<Terminal color="#5b21b6" aria-label="Open terminal" />
```

Props: `size` (default `24`), `color` (default `currentColor`), `strokeWidth` (default `2`), plus any SVG prop. Icons are `aria-hidden` unless you pass `aria-label`/`aria-labelledby`, in which case they get `role="img"`. Refs are forwarded to the `<svg>`.

Deep imports work too: `import ArrowLeft from "@praticon-glyphs/react/icons/arrow-left"`.

MIT licensed.
