/** `arrow-left` → `ArrowLeft`. Matches the component names the build scripts generate. */
export const toPascalCase = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase());
