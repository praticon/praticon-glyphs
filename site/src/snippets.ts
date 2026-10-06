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

/** JSX for the React package, listing only the props that differ from the defaults. */
export function jsxSnippet(name: string, style: IconStyle): string {
  const props = [
    style.size !== DEFAULT_STYLE.size && `size={${style.size}}`,
    style.strokeWidth !== DEFAULT_STYLE.strokeWidth && `strokeWidth={${style.strokeWidth}}`,
    style.color && `color="${style.color}"`,
  ].filter(Boolean);
  const component = componentName(name);
  return `import { ${component} } from "@praticon-glyphs/react";\n\n<${component}${props.length ? ` ${props.join(" ")}` : ""} />`;
}

export function svgSnippet(name: IconName, style: IconStyle): string {
  return toSvg(name, { size: style.size, strokeWidth: style.strokeWidth, color: style.color ?? "currentColor" });
}
