import { createIcon } from "@praticon-glyphs/react";

// Interface-only icons for the site, built with the same createIcon() API that
// Praticon exposes. They are not part of the published icon set.

export const Star = createIcon("ui-star", [
  ["path", { d: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" }],
]);

export const Sun = createIcon("ui-sun", [
  ["circle", { cx: "12", cy: "12", r: "4" }],
  ["path", { d: "M12 2.5v2" }],
  ["path", { d: "M12 19.5v2" }],
  ["path", { d: "M2.5 12h2" }],
  ["path", { d: "M19.5 12h2" }],
  ["path", { d: "M5.3 5.3l1.4 1.4" }],
  ["path", { d: "M17.3 17.3l1.4 1.4" }],
  ["path", { d: "M5.3 18.7l1.4-1.4" }],
  ["path", { d: "M17.3 6.7l1.4-1.4" }],
]);

export const Moon = createIcon("ui-moon", [["path", { d: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" }]]);
