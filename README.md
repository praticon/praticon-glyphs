# Praticon

**Symbols, crafted.** A grid-based SVG icon library for web development.

- 50 icons today (Core UI, Code & editor, Browser & web), growing to ~200 free icons
- Drawn on a 24×24 grid with a 2px round stroke, legible at 16px
- `currentColor` everywhere, so icons inherit your text colour
- Typed, tree-shakeable React components: you ship only the icons you import

Browse and copy the icons at **[praticon.github.io/praticon-glyphs](https://praticon.github.io/praticon-glyphs/)**.

## Install

```sh
npm i @praticon-glyphs/react
# or: pnpm add @praticon-glyphs/react
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

### Without React

`@praticon-glyphs/core` ships the optimised SVG files, the icon data and metadata:

```js
import { toSvg, metadata } from "@praticon-glyphs/core";

document.querySelector("#back").innerHTML = toSvg("arrow-left", { size: 20 });
```

As with the React components, `toSvg` output is decorative (`aria-hidden="true"`) unless you pass `attrs: { "aria-label": "…" }`, which makes it `role="img"`. Unknown icon names and invalid attribute names throw.

The raw files are at `@praticon-glyphs/core/svg/<name>.svg`.

## Packages

| Package | Description |
|---|---|
| [`@praticon-glyphs/react`](packages/react) | React components |
| [`@praticon-glyphs/core`](packages/core) | SVG files, icon data, metadata, `toSvg()` |

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

```sh
pnpm install
pnpm lint:icons   # check icons against the design spec
pnpm audit:icons  # compare icons with Lucide, Tabler, Feather, Heroicons and each other
pnpm build        # lint → optimise (SVGO) → generate React → compile
pnpm test         # Vitest
pnpm typecheck
pnpm --filter @praticon-glyphs/site dev   # run the icon browser locally
```

## License

[MIT](LICENSE) for the free icons and all code. Brand and framework logos are intentionally not included.
