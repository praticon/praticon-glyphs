# Praticon

**Symbols, crafted.** A grid-based SVG icon library for web development.

- 200 icons across 10 categories: Core UI, Code & editor, Browser & web, Layout & CSS, Devices, Version control, APIs & data, Build & deploy, Testing, and Security & speed
- Drawn on a 24×24 grid with a 2px round stroke, legible at 16px
- `currentColor` everywhere, so icons inherit your text colour
- Typed, tree-shakeable components for React, Vue and Svelte: you ship only the icons you import

Browse and copy the icons at **[praticon.github.io/praticon-glyphs](https://praticon.github.io/praticon-glyphs/)**.

## Install

```sh
npm i @praticon-glyphs/react    # React 18+
npm i @praticon-glyphs/vue      # Vue 3.3+
npm i @praticon-glyphs/svelte   # Svelte 5+
npm i @praticon-glyphs/elements # Web Components, for any other framework or plain HTML
npm i @praticon-glyphs/core     # SVG files, sprite, icon font and toSvg()
```

## Usage

```tsx
import { ArrowLeft, Terminal } from "@praticon-glyphs/react";

<ArrowLeft />                                    // 24px, currentColor, stroke 2
<ArrowLeft size={32} strokeWidth={1.5} />
<Terminal color="#5b21b6" aria-label="Open terminal" />
```

| Prop | Type | Default |
|---|---|---|
| `size` | `number \| string` | `24` |
| `color` | `string` | `"currentColor"` |
| `strokeWidth` | `number \| string` | `2` |
| …any SVG prop | | |

- Icons are decorative by default (`aria-hidden="true"`). Pass `aria-label` or `aria-labelledby` and the icon gets `role="img"`.
- Refs are forwarded to the `<svg>` element.
- Every icon also has an `…Icon` alias (`ArrowLeftIcon`) for when a name clashes with your own components.
- Each icon gets the classes `praticon praticon-<name>` for styling.

### Vue

```vue
<script setup>
import { ArrowLeft, Terminal } from "@praticon-glyphs/vue";
</script>

<template>
  <ArrowLeft />
  <Terminal :size="32" :stroke-width="1.5" color="#5b21b6" aria-label="Open terminal" />
</template>
```

The props, defaults and accessibility rules are the same as in React. Put a `<title>` in the default slot to give an icon an accessible name, and use `createIcon()` to wrap your own icons.

### Svelte

```svelte
<script>
  import { ArrowLeft, Terminal } from "@praticon-glyphs/svelte";
</script>

<ArrowLeft />
<Terminal size={32} strokeWidth={1.5} color="#5b21b6" aria-label="Open terminal" />
```

The package needs Svelte 5. Children such as a `<title>` render inside the `<svg>`, and the `Icon` component draws your own icons with the same props.

### Web Components

```html
<script type="module">
  import "@praticon-glyphs/elements"; // registers <praticon-…> for every icon
</script>

<praticon-arrow-left></praticon-arrow-left>
<praticon-terminal size="32" stroke-width="1.5" color="#5b21b6" aria-label="Open terminal"></praticon-terminal>
```

Import `@praticon-glyphs/elements/icons/<name>` instead to register, and bundle, only the icons you use. Without a build step, load `https://cdn.jsdelivr.net/npm/@praticon-glyphs/elements/+esm`.

### Without a framework

`@praticon-glyphs/core` ships the optimised SVG files, the icon data and metadata:

```js
import { toSvg, metadata } from "@praticon-glyphs/core";

document.querySelector("#back").innerHTML = toSvg("arrow-left", { size: 20 });
```

As with the components, `toSvg` output is decorative (`aria-hidden="true"`) unless you pass `attrs: { "aria-label": "…" }`, which makes it `role="img"`. Unknown icon names and invalid attribute names throw.

The raw files are at `@praticon-glyphs/core/svg/<name>.svg`.

**SVG sprite.** `@praticon-glyphs/core/sprite.svg` has a `<symbol>` per icon. Serve it from your own origin and set the size and stroke on the outer `<svg>`:

```html
<svg width="24" height="24" stroke-width="2" aria-hidden="true"><use href="/sprite.svg#arrow-left" /></svg>
```

**Icon font.** `@praticon-glyphs/core/font/praticon.css` loads a WOFF2 font with a class per icon. Size it with `font-size` and colour it with `color`; the stroke is fixed at the standard width:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@praticon-glyphs/core/font/praticon.css" />
<i class="praticon praticon-arrow-left" aria-hidden="true"></i>
```

## Packages

| Package | Description |
|---|---|
| [`@praticon-glyphs/react`](packages/react) | React components |
| [`@praticon-glyphs/vue`](packages/vue) | Vue 3 components |
| [`@praticon-glyphs/svelte`](packages/svelte) | Svelte 5 components |
| [`@praticon-glyphs/elements`](packages/elements) | Web Components |
| [`@praticon-glyphs/core`](packages/core) | SVG files, SVG sprite, icon font, icon data, metadata, `toSvg()` |

## Contributing an icon

1. Draw it on [`templates/grid-24.svg`](templates/grid-24.svg) and follow the design spec in [PLAN.md §4](PLAN.md#4-design-specification).
2. Save it as `icons/outline/<name>.svg` (kebab-case, noun first) with the standard root:
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
   ```
   Children may only be `path`, `circle`, `ellipse`, `rect`, `line`, `polyline` or `polygon`, with geometry attributes only.
3. Add an entry to `icons/metadata.json`.
4. Run `pnpm build && pnpm test`. The linter checks the spec, and new snapshots show the generated component.
5. Run `pnpm audit:icons <name>` and make sure the icon is not a near copy of another library's (score below 0.8 unless it is a universal shape like a chevron).

### Development

Requires Node 24 or later, the version `.nvmrc` pins and CI uses. Run `nvm use` (or fnm or Volta) to switch to it.

```sh
pnpm install
pnpm lint:icons   # check icons against the design spec
pnpm audit:icons  # compare icons with Lucide, Tabler, Feather, Heroicons and each other
pnpm build        # lint → optimise (SVGO) → generate React, Vue and Svelte → compile
pnpm test         # Vitest
pnpm typecheck
pnpm --filter @praticon-glyphs/site dev   # run the icon browser locally
pnpm test:e2e     # Playwright: test the built site in Chromium, including axe accessibility checks
```

The browser tests run against the production build, so run `pnpm build` first. The first time, install Chromium with `pnpm --filter @praticon-glyphs/site exec playwright install chromium`.

## License

[MIT](LICENSE) for the free icons and all code. Brand and framework logos are intentionally not included.
