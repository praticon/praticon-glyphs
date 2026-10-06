# Praticon — Project Plan

> A crafted, grid-based SVG icon library with a free open-source tier and a proprietary Pro tier.

_Created: 2026-10-05_

---

## 1. Goals

1. Build a consistent, high-quality SVG icon set drawn on a strict grid.
2. Ship it as packages developers can install with one command (`npm i @praticon-glyphs/react`).
3. Provide a searchable icon browser website.
4. Run an **open-core** model: free icons attract users, Pro icons generate revenue.
5. Learn the full UI-tooling pipeline: SVG design, optimisation, code generation, publishing, docs, CI.

### Non-goals (for v1)
- Animated icons, icon fonts, Figma plugin. These are planned for later phases.
- A full e-commerce or licensing backend (use Gumroad or Lemon Squeezy at first).

---

## 2. Identity

| Item | Decision | Status |
|---|---|---|
| Name | **Praticon** | ✅ Decided |
| npm org | [`praticon-glyphs`](https://www.npmjs.com/org/praticon-glyphs) (owner `kronos456`) | ✅ Created 2026-10-06 |
| npm packages | `@praticon-glyphs/core`, `@praticon-glyphs/react`, `@praticon-glyphs/vue`, `@praticon-glyphs/svelte` | ✅ Scope owned |
| GitHub repo | [`praticon/praticon-glyphs`](https://github.com/praticon/praticon-glyphs) (public) | ✅ Created |
| GitHub org | [`praticon`](https://github.com/praticon) | ✅ Created 2026-10-05 |
| Website (free, now) | `praticon.github.io/praticon-glyphs` | ⬜ Set up |
| Domain (paid, later) | `praticon.dev` (~$12/yr) | ⬜ Buy when selling |
| Tagline | "Symbols, crafted." | Draft |
| Trademark | Search IP India and USPTO for "Praticon" | ⬜ Check |

---

## 3. Icon Set Direction

**Focus: web development.** The icons are for developer tools, docs sites, dashboards, IDEs and dev-focused products. Other domains may come later.

### Categories
| Category | Example icons |
|---|---|
| **Core UI** (needed in every set) | `arrow-left`, `chevron-down`, `menu`, `close`, `search`, `settings`, `plus`, `check`, `copy`, `external-link` |
| **Code & editor** | `code`, `brackets`, `terminal`, `file-code`, `function`, `variable`, `snippet`, `regex`, `comment`, `format` |
| **Browser & web** | `browser`, `tab`, `link`, `globe`, `cookie`, `cache`, `devtools`, `inspect`, `console`, `network` |
| **Layout & CSS** | `layout-grid`, `flex-row`, `flex-column`, `align-center`, `padding`, `margin`, `layers`, `breakpoint`, `typography`, `color-picker` |
| **Responsive** | `desktop`, `laptop`, `tablet`, `mobile`, `viewport`, `rotate-device` |
| **Version control** | `git-branch`, `git-commit`, `git-merge`, `pull-request`, `fork`, `diff`, `tag`, `conflict` |
| **APIs & data** | `api`, `endpoint`, `webhook`, `json`, `database`, `query`, `request`, `response`, `websocket`, `schema` |
| **Build & deploy** | `package`, `dependency`, `build`, `bundle`, `deploy`, `pipeline`, `server`, `cloud`, `container`, `env-variable` |
| **Testing & debugging** | `bug`, `debug`, `breakpoint-dot`, `test`, `test-pass`, `test-fail`, `coverage`, `log` |
| **Performance & security** | `gauge`, `speed`, `lock`, `key`, `shield`, `token`, `accessibility`, `seo` |

### Free vs Pro split
- **Free (~200):** Core UI plus the most common icons from every category above.
- **Pro:** Complete coverage of every category, the filled and duotone variants, and later animated states (e.g. `build` → spinning, `test-pass` → checkmark draw).

### Brand logos: excluded
No framework, language or company logos (React, Vue, GitHub, AWS, …). They are trademarks and can't be sold under our license. Concepts are drawn generically instead (`framework`, `repository`, `cloud`).

### Styles (variants)
| Variant | v1 | Later |
|---|---|---|
| Outline (stroke) | ✅ | |
| Filled | | ✅ Pro |
| Duotone | | ✅ Pro |
| Animated | | ✅ Pro |

---

## 4. Design Specification

| Rule | Value |
|---|---|
| Canvas | 24 × 24 px |
| Live area | 20 × 20 px (2 px padding) |
| Stroke width | 2 px (adjustable via prop) |
| Stroke caps / joins | Round / Round |
| Corner radius | 2 px (outer), 1 px (inner details) |
| Colour | `currentColor` only, never hard-coded |
| Fills | None in outline variant |
| Min. legible size | Must read clearly at 16 px |
| Naming | `kebab-case`, noun-first: `arrow-left`, `file-code`, `git-branch` |

Every icon also gets an entry in `metadata.json`:
```json
{
  "name": "arrow-left",
  "category": "core-ui",
  "tags": ["back", "previous", "direction"],
  "aliases": ["chevron-back"],
  "tier": "free",
  "since": "0.1.0"
}
```

---

## 5. Licensing (Open-Core)

| Part | License | Distribution |
|---|---|---|
| **Praticon Free** (~200 icons) | MIT | Public GitHub repo + public npm |
| **Praticon Pro** (full set + variants) | Praticon Pro License (custom EULA) | Private repo + GitHub Packages as `@praticon/pro-react` (the scope comes from the GitHub org) |
| Code and tooling | MIT | Public |

> **Repo note:** `praticon/praticon-glyphs` is public, so it is the home of the free set. Pro SVGs must never be committed here; they go in a separate private repo (e.g. `praticon/praticon-pro`).

### Pro tiers
| Tier | Seats | Use |
|---|---|---|
| Personal | 1 | Unlimited end products |
| Team | Up to N | Unlimited end products |
| Enterprise | Unlimited | Extended rights (redistributable products) |

### Key EULA terms
- ✅ Use in unlimited end products, and modify the icons for those products.
- ❌ No resale or redistribution as an icon set, no use in logos or trademarks, no sharing of license keys.
- Perpetual license to purchased versions, plus 1 year of updates.
- Governing law: India.
- ⚠️ A lawyer must review the EULA before the first sale.

---

## 6. Tech Stack

| Concern | Choice |
|---|---|
| Monorepo | pnpm workspaces |
| Language | TypeScript |
| SVG optimisation | SVGO |
| Code generation | Custom Node build script (SVG → components) |
| Frameworks (v1) | React |
| Frameworks (later) | Vue, Svelte, Web Components |
| Docs / browser site | Vite + React (or Astro) |
| Testing | Vitest (snapshots of generated components) |
| Versioning / release | Changesets |
| CI / CD | GitHub Actions |
| Hosting | GitHub Pages / js.org (free) |
| Sales (Pro) | Gumroad or Lemon Squeezy |
| Private registry (Pro) | GitHub Packages |

---

## 7. Repository Structure

```
praticon-glyphs/
├── icons/                     # Source of truth: hand-drawn SVGs
│   ├── outline/
│   └── metadata.json
├── packages/
│   ├── core/                  # Core: optimised SVGs + metadata (npm: @praticon-glyphs/core)
│   ├── react/                 # @praticon-glyphs/react (generated)
│   ├── vue/                   # @praticon-glyphs/vue (later)
│   └── svelte/                # @praticon-glyphs/svelte (later)
├── scripts/
│   ├── lint-icons.ts          # Enforce grid, stroke, currentColor, no fills
│   ├── optimize.ts            # SVGO pass
│   └── build-react.ts         # SVG → typed React components
├── site/                      # Icon browser (search, customise, copy)
├── templates/
│   └── grid-24.svg            # Design template for Figma / Illustrator / Inkscape
├── .github/workflows/         # lint → build → test → release
├── LICENSE                    # MIT (free icons + code)
├── LICENSE-PRO.md             # Praticon Pro EULA (private distribution only)
└── README.md
```

---

## 8. Component API (React)

```tsx
import { ArrowLeft, GitBranch } from "@praticon-glyphs/react";

<ArrowLeft />                                   // 24px, currentColor, stroke 2
<ArrowLeft size={32} strokeWidth={1.5} />
<GitBranch color="#5b21b6" aria-label="Current branch" />
```

Requirements:
- Tree-shakeable: one ES module per icon, and `sideEffects: false`.
- Typed props: `size`, `color`, `strokeWidth`, plus all `SVGProps`.
- Accessible: `aria-hidden="true"` by default, and `role="img"` when an `aria-label` is passed.
- `forwardRef` support.

---

## 9. Roadmap

### Phase 0: Setup (Week 1)
- [x] Create the GitHub repo: `praticon/praticon-glyphs` (public)
- [x] Create the GitHub org: `praticon`
- [x] npm account: `kronos456`
- [x] npm org: `praticon-glyphs`
- [ ] Enable 2FA on npm (required to publish)
- [x] Choose the focus: web development (Section 3)
- [x] Create the monorepo skeleton, the 24px grid template and the SVGO config
- [x] Add the MIT LICENSE and a README

### Phase 1: First 50 icons + pipeline (Weeks 2–4)
- [x] Design 50 icons following the spec: Core UI + Code & editor + Browser & web
- [x] `lint-icons` script that checks the design rules automatically
- [x] `build-react` generator with tests
- [ ] Publish `@praticon-glyphs/core@0.1.0` and `@praticon-glyphs/react@0.1.0` (each `package.json` needs `"publishConfig": { "access": "public" }`) (packages ready; blocked on npm 2FA)

### Phase 2: Icon browser site (Weeks 5–6)
- [ ] Search by name, tag and alias
- [ ] Live controls for size, stroke and colour
- [ ] Copy as SVG or JSX, and download the SVG
- [ ] Deploy to `praticon.github.io/praticon-glyphs`

### Phase 3: Grow to 200 free icons (Weeks 7–12)
- [ ] Cover all web-dev categories with the most common icons
- [ ] Gather feedback from developers on missing icons
- [ ] Add Vue and Svelte packages
- [ ] GitHub Actions: lint, build, test (CI ✅ done), release with Changesets (todo)
- [ ] Launch the free set on Product Hunt, Reddit, X and Dev.to

### Phase 4: Praticon Pro (Months 4–6)
- [ ] Filled and duotone variants
- [ ] Complete coverage of every web-dev category
- [ ] Draft LICENSE-PRO.md and have a lawyer review it
- [ ] Private repo and private registry with license-key access
- [ ] Gumroad or Lemon Squeezy storefront
- [ ] Buy `praticon.dev`
- [ ] Register copyright with the Indian Copyright Office (optional, recommended)

### Phase 5: Extras (Month 6+)
- [ ] Figma plugin / Figma Community file
- [ ] Animated icons (Pro)
- [ ] CLI: `npx @praticon-glyphs/cli add arrow-left`
- [ ] Web Components package
- [ ] Icon font and SVG sprite outputs

---

## 10. Success Metrics

| Milestone | Target |
|---|---|
| v0.1 published | 50 icons, React package live |
| Free launch | 200 icons, site live, 100 GitHub stars |
| Pro launch | First paying customer |
| 6 months | 500+ icons, 1k weekly npm downloads |

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Inconsistent icon quality as the set grows | Strict spec + automated `lint-icons` in CI |
| Name or trademark conflict | Run the trademark search in Phase 0 |
| Pro icons leaked publicly | Keep Pro SVGs out of public repos; embed an identifier in SVG metadata |
| Scope creep (too many frameworks or variants) | Ship React + outline first, add more only after launch |
| AI-generated icons with unclear copyright | Use AI only for rough concepts; every shipped icon is drawn by hand on the grid |

---

## 12. Open Decisions

- [ ] Docs site: Vite + React or Astro?
- [ ] Pro pricing per tier
- [ ] Number of seats in the Team tier
- [ ] Design tool: Figma, Illustrator or Inkscape
