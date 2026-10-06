# @praticon-glyphs/vue

[Praticon](https://github.com/praticon/praticon-glyphs) icons as typed, tree-shakeable Vue 3 components.

```sh
npm i @praticon-glyphs/vue
```

```vue
<script setup>
import { ArrowLeft, Terminal } from "@praticon-glyphs/vue";
</script>

<template>
  <ArrowLeft />
  <ArrowLeft :size="32" :stroke-width="1.5" />
  <Terminal color="#5b21b6" aria-label="Open terminal" />
</template>
```

Props: `size` (default `24`), `color` (default `currentColor`), `strokeWidth` (default `2`), plus any SVG attribute. Icons are `aria-hidden` unless you pass `aria-label`/`aria-labelledby`, in which case they get `role="img"`. Content in the default slot, such as a `<title>`, renders inside the `<svg>`.

Deep imports work too: `import ArrowLeft from "@praticon-glyphs/vue/icons/arrow-left"`. Wrap your own 24×24 stroke icons in the same API with `createIcon(name, node)`.

Browse every icon at [praticon.github.io/praticon-glyphs](https://praticon.github.io/praticon-glyphs/). MIT licensed.
