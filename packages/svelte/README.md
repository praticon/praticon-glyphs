# @praticon-glyphs/svelte

[Praticon](https://github.com/praticon/praticon-glyphs) icons as typed Svelte 5 components.

```sh
npm i @praticon-glyphs/svelte
```

```svelte
<script>
  import { ArrowLeft, Terminal } from "@praticon-glyphs/svelte";
</script>

<ArrowLeft />
<ArrowLeft size={32} strokeWidth={1.5} />
<Terminal color="#5b21b6" aria-label="Open terminal" />
```

Props: `size` (default `24`), `color` (default `currentColor`), `strokeWidth` (default `2`), plus any SVG attribute. Icons are `aria-hidden` unless you pass `aria-label`/`aria-labelledby`, in which case they get `role="img"`. Children, such as a `<title>`, render inside the `<svg>`.

Each icon is its own module, so bundlers include only the icons you import. Deep imports work too: `import ArrowLeft from "@praticon-glyphs/svelte/icons/arrow-left"`. To draw your own 24×24 stroke icons with the same props, use the `Icon` component:

```svelte
<script>
  import { Icon } from "@praticon-glyphs/svelte";
</script>

<Icon name="rocket" node={[["path", { d: "M12 15l-3-3a12 12 0 0 1 9-9" }]]} />
```

Browse every icon at [praticon.github.io/praticon-glyphs](https://praticon.github.io/praticon-glyphs/). MIT licensed.
