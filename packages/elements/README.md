# @praticon-glyphs/elements

[Praticon](https://github.com/praticon/praticon-glyphs) icons as Web Components, for Angular, Solid, Lit, server-rendered pages, plain HTML or any other framework.

```sh
npm i @praticon-glyphs/elements
```

```html
<script type="module">
  import "@praticon-glyphs/elements"; // registers <praticon-…> for every icon
</script>

<praticon-arrow-left></praticon-arrow-left>
<praticon-terminal size="32" stroke-width="1.5" color="#5b21b6" aria-label="Open terminal"></praticon-terminal>
```

Without a build step, use a CDN: `<script type="module" src="https://cdn.jsdelivr.net/npm/@praticon-glyphs/elements/+esm"></script>`.

To bundle only the icons you use, import each from its own module, which registers just that tag: `import "@praticon-glyphs/elements/icons/arrow-left"`.

Attributes: `size` (default `24`, a number of px or any CSS length), `color` (default `currentColor`) and `stroke-width` (default `2`), mirrored by the `size`, `color` and `strokeWidth` properties. Icons are hidden from assistive technology unless you add `aria-label` or `aria-labelledby`, which gives them `role="img"`.

The SVG is drawn in a shadow root and exposed as `::part(svg)`. TypeScript knows every tag, so `document.querySelector("praticon-arrow-left")` is typed. Wrap your own 24×24 stroke icons with `defineIcon(name, node)`. The modules are safe to import during server rendering; tags are registered in the browser only.

Browse every icon at [praticon.github.io/praticon-glyphs](https://praticon.github.io/praticon-glyphs/). MIT licensed.
