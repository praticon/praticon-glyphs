import { createElement, type CSSProperties } from "react";
import { icons, type IconName } from "@praticon-glyphs/core";

/**
 * Renders an icon from its raw shapes with pathLength="1" on every element, so
 * CSS can animate the strokes being drawn (see .draw in styles.css). Remount it
 * with a new key to replay the animation.
 */
export function DrawnIcon({
  name,
  strokeWidth = 2,
  className,
  label,
}: {
  name: IconName;
  strokeWidth?: number;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {icons[name].map(([tag, attrs], index) =>
        createElement(tag, { ...attrs, key: index, pathLength: 1, style: { "--i": index } as CSSProperties }),
      )}
    </svg>
  );
}

/** The 24-unit drawing grid with the 20-unit live area, as a background layer. */
export function GridGuide({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {Array.from({ length: 23 }, (_, i) => (
        <g key={i} className={(i + 1) % 6 === 0 ? "major" : undefined}>
          <line x1={i + 1} y1={0} x2={i + 1} y2={24} />
          <line x1={0} y1={i + 1} x2={24} y2={i + 1} />
        </g>
      ))}
      <rect className="live-area" x={2} y={2} width={20} height={20} />
    </svg>
  );
}
