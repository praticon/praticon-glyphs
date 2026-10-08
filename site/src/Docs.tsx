import { useState, type ReactNode } from "react";
import { CheckIcon, CopyIcon } from "@praticon-glyphs/react";

const SECTIONS = [
  ["install", "Install"],
  ["react", "Use in React"],
  ["vue", "Use in Vue"],
  ["svelte", "Use in Svelte"],
  ["web-components", "Web Components"],
  ["props", "Props"],
  ["imports", "Importing"],
  ["accessibility", "Accessibility"],
  ["styling", "Styling"],
  ["without-framework", "Without a framework"],
  ["sprite", "SVG sprite"],
  ["font", "Icon font"],
  ["typescript", "TypeScript"],
  ["custom-icons", "Your own icons"],
] as const;

function CodeBlock({ code, onCopy }: { code: string; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code-block">
      {/* Focusable so keyboard users can scroll long lines. */}
      <pre className="code mono" tabIndex={0}>
        {code}
      </pre>
      <button
        type="button"
        className="icon-button code-copy"
        aria-label="Copy code"
        onClick={() => {
          onCopy(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      </button>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="doc-section" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>
        <a href={`#${id}`}>{title}</a>
      </h2>
      {children}
    </section>
  );
}

export function Docs({ onCopy }: { onCopy: (text: string) => void }) {
  const code = (text: string) => <CodeBlock code={text} onCopy={onCopy} />;
  return (
    <main id="main" className="docs">
      <nav className="doc-toc" aria-label="On this page">
        <p className="toc-title">On this page</p>
        <ol>
          {SECTIONS.map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`}>{title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="doc-body">
        <h1>Getting started</h1>
        <p className="lede">
          Praticon icons are drawn on a 24 × 24 grid with a 2 px round stroke and inherit your text colour. Use them as
          typed React, Vue or Svelte components, as Web Components, or as plain SVG, a sprite or an icon font anywhere
          else.
        </p>

        <Section id="install" title="Install">
          <p>Install the package for your framework:</p>
          {code("npm i @praticon-glyphs/react")}
          {code("npm i @praticon-glyphs/vue")}
          {code("npm i @praticon-glyphs/svelte")}
          <p>For any other framework, or plain HTML, the Web Components package works everywhere:</p>
          {code("npm i @praticon-glyphs/elements")}
          <p>
            For server templates and static sites, the core package ships the SVG files, an SVG sprite, an icon font, the
            icon data and a <code>toSvg()</code> helper:
          </p>
          {code("npm i @praticon-glyphs/core")}
          <p>
            They all work with pnpm and Yarn too. The framework packages need React 18, Vue 3.3 or Svelte 5 or later.
          </p>
        </Section>

        <Section id="react" title="Use in React">
          <p>Import icons by name. Each one renders an inline SVG that is 24 px, uses the current text colour and has a 2 px stroke.</p>
          {code(`import { ArrowLeft, Terminal } from "@praticon-glyphs/react";

export function Toolbar() {
  return (
    <>
      <button aria-label="Back">
        <ArrowLeft />
      </button>
      <Terminal size={32} strokeWidth={1.5} color="#5b21b6" />
    </>
  );
}`)}
        </Section>

        <Section id="vue" title="Use in Vue">
          <p>
            The Vue package has the same icons and props. Bind numbers with <code>:</code>, and write{" "}
            <code>strokeWidth</code> as <code>stroke-width</code> in templates if you prefer:
          </p>
          {code(`<script setup>
import { ArrowLeft, Terminal } from "@praticon-glyphs/vue";
</script>

<template>
  <button aria-label="Back">
    <ArrowLeft />
  </button>
  <Terminal :size="32" :stroke-width="1.5" color="#5b21b6" />
</template>`)}
          <p>
            Other attributes and the default slot pass through to the <code>&lt;svg&gt;</code>. Wrap your own icons with{" "}
            <code>createIcon()</code>, exactly as in React.
          </p>
        </Section>

        <Section id="svelte" title="Use in Svelte">
          <p>The Svelte package needs Svelte 5. Each icon is its own component file, so only the icons you import are bundled:</p>
          {code(`<script>
  import { ArrowLeft, Terminal } from "@praticon-glyphs/svelte";
</script>

<button aria-label="Back">
  <ArrowLeft />
</button>
<Terminal size={32} strokeWidth={1.5} color="#5b21b6" />`)}
          <p>
            Children such as a <code>&lt;title&gt;</code> render inside the <code>&lt;svg&gt;</code>. To draw your own
            icons with the same props, use the <code>Icon</code> component:
          </p>
          {code(`<script>
  import { Icon } from "@praticon-glyphs/svelte";
</script>

<Icon name="rocket" node={[["path", { d: "M12 15l-3-3a12 12 0 0 1 9-9" }]]} />`)}
        </Section>

        <Section id="web-components" title="Web Components">
          <p>
            Every icon is also a custom element named <code>praticon-&lt;name&gt;</code>, which works in Angular, Solid,
            Lit, server-rendered pages or plain HTML. Importing the package registers all of them:
          </p>
          {code(`<script type="module">
  import "@praticon-glyphs/elements";
</script>

<button aria-label="Back">
  <praticon-arrow-left></praticon-arrow-left>
</button>
<praticon-terminal size="32" stroke-width="1.5" color="#5b21b6"></praticon-terminal>`)}
          <p>Without a build step, load it from a CDN:</p>
          {code(`<script type="module" src="https://cdn.jsdelivr.net/npm/@praticon-glyphs/elements/+esm"></script>`)}
          <p>
            To bundle only the icons you use, import each one from its own module instead. Importing it registers its
            tag:
          </p>
          {code(`import "@praticon-glyphs/elements/icons/arrow-left";`)}
          <p>
            The attributes are <code>size</code>, <code>color</code> and <code>stroke-width</code>, with the same
            defaults as the props below, and the elements have matching <code>size</code>, <code>color</code> and{" "}
            <code>strokeWidth</code> properties. The SVG is drawn in a shadow root; style it from outside with{" "}
            <code>::part(svg)</code>. Wrap your own icons with <code>defineIcon(name, node)</code>.
          </p>
        </Section>

        <Section id="props" title="Props">
          {/* Focusable so keyboard users can scroll the table on narrow screens. */}
          <div className="table-wrap" role="region" aria-label="Props" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>size</code></td>
                  <td><code>number | string</code></td>
                  <td><code>24</code></td>
                  <td>Width and height, in px or any CSS length.</td>
                </tr>
                <tr>
                  <td><code>color</code></td>
                  <td><code>string</code></td>
                  <td><code>"currentColor"</code></td>
                  <td>Stroke colour.</td>
                </tr>
                <tr>
                  <td><code>strokeWidth</code></td>
                  <td><code>number | string</code></td>
                  <td><code>2</code></td>
                  <td>Stroke width in grid units, so it scales with the icon.</td>
                </tr>
                <tr>
                  <td>any SVG prop</td>
                  <td></td>
                  <td></td>
                  <td>
                    Passed to the <code>&lt;svg&gt;</code>, including <code>className</code> (<code>class</code> in Vue and
                    Svelte), <code>style</code>, event handlers and, in React, <code>ref</code>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="imports" title="Importing">
          <p>
            Named imports are tree-shaken, so your bundle only contains the icons you use. Every icon also has an{" "}
            <code>…Icon</code> alias for when a name clashes with one of your own components:
          </p>
          {code(`import { Copy, CopyIcon } from "@praticon-glyphs/react"; // the same component`)}
          <p>Each icon can also be imported from its own module:</p>
          {code(`import ArrowLeft from "@praticon-glyphs/react/icons/arrow-left";`)}
        </Section>

        <Section id="accessibility" title="Accessibility">
          <p>
            Icons are decorative by default and get <code>aria-hidden="true"</code>, which is right when they sit next to
            text that already says what they mean. When an icon stands alone, give it a label and it becomes{" "}
            <code>role="img"</code> with that accessible name:
          </p>
          {code(`<Terminal aria-label="Open terminal" />

// or with a visible-to-assistive-tech title
<Terminal aria-labelledby="terminal-title">
  <title id="terminal-title">Open terminal</title>
</Terminal>`)}
        </Section>

        <Section id="styling" title="Styling">
          <p>
            Icons use <code>currentColor</code>, so they follow the colour of the text around them. Every icon has the
            classes <code>praticon</code> and <code>praticon-&lt;name&gt;</code>, and your own <code>className</code> is
            added after them:
          </p>
          {code(`.praticon {
  vertical-align: -0.125em;
}

.nav-link:hover .praticon {
  color: #5b21b6;
}`)}
        </Section>

        <Section id="without-framework" title="Without a framework">
          <p>
            <code>toSvg()</code> returns SVG markup as a string, for plain HTML, server templates or any framework. It
            takes the same options as the component props, plus extra attributes:
          </p>
          {code(`import { toSvg } from "@praticon-glyphs/core";

document.querySelector("#back").innerHTML = toSvg("arrow-left", {
  size: 20,
  strokeWidth: 1.5,
  attrs: { class: "icon", "aria-label": "Back" },
});`)}
          <p>
            Like the components, the output is decorative unless you pass an <code>aria-label</code> or{" "}
            <code>aria-labelledby</code>. Unknown icon names and invalid attribute names throw an error.
          </p>
          <p>
            The optimised SVG files are in the package at <code>@praticon-glyphs/core/svg/&lt;name&gt;.svg</code>, and
            any npm CDN can serve them. Note that an SVG loaded with <code>&lt;img&gt;</code> cannot inherit your text
            colour:
          </p>
          {code(`<img src="https://cdn.jsdelivr.net/npm/@praticon-glyphs/core/svg/arrow-left.svg" alt="Back" width="24" height="24" />`)}
          <p>
            The package also exports <code>icons</code> (the shapes of every icon), <code>metadata</code> (names, tags,
            aliases and categories) and <code>categories</code>.
          </p>
        </Section>

        <Section id="sprite" title="SVG sprite">
          <p>
            <code>@praticon-glyphs/core/sprite.svg</code> holds every icon as a <code>&lt;symbol&gt;</code> named after
            the icon. Serve the file from your own site, then point a <code>&lt;use&gt;</code> at an icon. The browser
            downloads the sprite once and caches it:
          </p>
          {code(`<svg width="24" height="24" stroke-width="2" aria-hidden="true">
  <use href="/sprite.svg#arrow-left" />
</svg>`)}
          <p>
            Set the size and stroke width on the outer <code>&lt;svg&gt;</code>; the icon follows the text colour.
            Browsers only load sprites from the same origin as the page, so copy the file into your public folder rather
            than linking to a CDN.
          </p>
        </Section>

        <Section id="font" title="Icon font">
          <p>
            For places that only take text or CSS, such as CMS templates or older stacks, the icon font draws every icon
            as a character. Load its stylesheet, then use the <code>praticon</code> class with the icon's class:
          </p>
          {code(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@praticon-glyphs/core/font/praticon.css" />

<i class="praticon praticon-arrow-left" aria-hidden="true"></i>`)}
          <p>
            Icons are sized with <code>font-size</code> and coloured with <code>color</code>, and sit on the text baseline.
            A font cannot change its stroke width, so it is always the standard one: 2 px at 24 px, scaling with the
            size. Each icon keeps its
            character between releases; <code>font/codepoints.json</code> lists them.
          </p>
        </Section>

        <Section id="typescript" title="TypeScript">
          <p>
            Every package ships its own types. <code>IconName</code> is a union of every icon name, so typos are caught at
            compile time:
          </p>
          {code(`import { toSvg, type IconName } from "@praticon-glyphs/core";
import type { IconProps } from "@praticon-glyphs/react";

const name: IconName = "file-code";
toSvg("file-cdoe"); // Type error: not an icon name`)}
        </Section>

        <Section id="custom-icons" title="Your own icons">
          <p>
            <code>createIcon()</code> wraps your own 24 × 24 stroke icons in the same API, with the same props,
            accessibility defaults and classes:
          </p>
          {code(`import { createIcon } from "@praticon-glyphs/react";

export const Rocket = createIcon("rocket", [
  ["path", { d: "M12 15l-3-3a12 12 0 0 1 9-9 12 12 0 0 1-9 9" }],
  ["path", { d: "M9 12H4l3-5h5" }],
]);`)}
        </Section>
      </article>
    </main>
  );
}
