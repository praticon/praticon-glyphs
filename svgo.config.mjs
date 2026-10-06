/**
 * SVGO config for Praticon outline icons.
 * Keeps the 24×24 viewBox and size, keeps individual shapes (so components
 * stay readable), and strips everything editors add on export.
 */
/** @type {import("svgo").Config} */
export default {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          convertShapeToPath: false,
          mergePaths: false,
          // Dots are drawn as tiny `h.01` segments with round caps; turning
          // them into `z` would close the subpath and hide the dot.
          convertPathData: { convertToZ: false },
        },
      },
    },
    { name: "removeAttrs", params: { attrs: ["class", "data-.*", "id"] } },
    "sortAttrs",
  ],
};
