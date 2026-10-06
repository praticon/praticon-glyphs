<!--
  @component
  Renders a 24×24 stroke icon from its SVG children. The generated icons use it,
  and you can use it directly to draw your own icons with the same props:

  <Icon name="rocket" node={[["path", { d: "M12 15l-3-3a12 12 0 0 1 9-9" }]]} />
-->
<script lang="ts">
  import type { IconNode, IconProps } from "./types.js";

  let {
    name,
    node,
    size = 24,
    color = "currentColor",
    strokeWidth = 2,
    class: className,
    children,
    ...rest
  }: IconProps & { name: string; node: IconNode } = $props();

  // Decorative by default; becomes an image with an accessible name when labelled.
  const labelled = $derived(Boolean(rest["aria-label"] || rest["aria-labelledby"]));
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={["praticon", `praticon-${name}`, className]}
  role={labelled ? "img" : undefined}
  aria-hidden={labelled ? undefined : "true"}
  {...rest}
>
  {#each node as [tag, attrs], index (index)}
    <svelte:element this={tag} {...attrs} />
  {/each}
  {@render children?.()}
</svg>
