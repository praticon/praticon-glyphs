import { toSvg, type IconName } from "@praticon-glyphs/core";

export interface IconStyle {
  size: number;
  strokeWidth: number;
  /** A CSS colour, or undefined to inherit the text colour. */
  color?: string;
}

export const DEFAULT_STYLE: IconStyle = { size: 24, strokeWidth: 2 };

/** `arrow-left` → `ArrowLeft`, matching the component names in @praticon-glyphs/react. */
export const componentName = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase());

export type Format = "react" | "vue" | "svelte" | "svg";

export const FORMATS: ReadonlyArray<readonly [Format, string]> = [
  ["react", "React"],
  ["vue", "Vue"],
  ["svelte", "Svelte"],
  ["svg", "SVG"],
];

export const isFormat = (value: unknown): value is Format => FORMATS.some(([format]) => format === value);

/** The props that differ from the defaults, written in each framework's template syntax. */
function propList(style: IconStyle, syntax: "jsx" | "vue") {
  const bound = (prop: string, value: number) => (syntax === "vue" ? `:${prop}="${value}"` : `${prop}={${value}}`);
  const props = [
    style.size !== DEFAULT_STYLE.size && bound("size", style.size),
    style.strokeWidth !== DEFAULT_STYLE.strokeWidth && bound(syntax === "vue" ? "stroke-width" : "strokeWidth", style.strokeWidth),
    style.color && `color="${style.color}"`,
  ].filter(Boolean);
  return props.length ? ` ${props.join(" ")}` : "";
}

/** JSX for the React package, listing only the props that differ from the defaults. */
export function jsxSnippet(name: string, style: IconStyle): string {
  const component = componentName(name);
  return `import { ${component} } from "@praticon-glyphs/react";\n\n<${component}${propList(style, "jsx")} />`;
}

/** A Vue single-file component using the icon. */
export function vueSnippet(name: string, style: IconStyle): string {
  const component = componentName(name);
  return (
    `<script setup>\nimport { ${component} } from "@praticon-glyphs/vue";\n</script>\n\n` +
    `<template>\n  <${component}${propList(style, "vue")} />\n</template>`
  );
}

/** A Svelte component using the icon. */
export function svelteSnippet(name: string, style: IconStyle): string {
  const component = componentName(name);
  return `<script>\n  import { ${component} } from "@praticon-glyphs/svelte";\n</script>\n\n<${component}${propList(style, "jsx")} />`;
}

export function svgSnippet(name: IconName, style: IconStyle): string {
  return toSvg(name, { size: style.size, strokeWidth: style.strokeWidth, color: style.color ?? "currentColor" });
}

/** The code to copy for an icon in the visitor's chosen format. */
export function snippet(format: Format, name: string, style: IconStyle): string {
  if (format === "vue") return vueSnippet(name, style);
  if (format === "svelte") return svelteSnippet(name, style);
  if (format === "svg") return svgSnippet(name as IconName, style);
  return jsxSnippet(name, style);
}
