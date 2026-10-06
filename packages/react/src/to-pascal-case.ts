/** `arrow-left` → `ArrowLeft`. Shared with scripts/build-react.ts, which names the components. */
export const toPascalCase = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase());
