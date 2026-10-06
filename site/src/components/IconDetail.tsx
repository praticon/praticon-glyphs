import { useState } from "react";
import type { IconMetadata, IconName } from "@praticon-glyphs/core";
import * as Praticon from "@praticon-glyphs/react";
import { SITE_URL } from "../routes.ts";
import { jsxSnippet, svgSnippet, type IconStyle } from "../snippets.ts";
import { Star } from "../ui-icons.ts";
import { DrawnIcon, GridGuide } from "./DrawnIcon.tsx";
import { iconComponent } from "./IconGrid.tsx";
import { CATEGORY_LABELS } from "./Toolbar.tsx";

export function IconDetail({
  icon,
  style,
  isSaved,
  headingLevel,
  onClose,
  onCopy,
  onDownload,
  onToggleSaved,
}: {
  icon: IconMetadata;
  style: IconStyle;
  isSaved: boolean;
  headingLevel: "h1" | "h2";
  onClose: () => void;
  onCopy: (text: string, what: string) => void;
  onDownload: (name: string, svg: string) => void;
  onToggleSaved: (name: string) => void;
}) {
  const [tab, setTab] = useState<"react" | "svg">("react");
  const Icon = iconComponent(icon.name);
  const Heading = headingLevel;
  const svg = svgSnippet(icon.name as IconName, style);
  const code = tab === "react" ? jsxSnippet(icon.name, style) : svg;
  const words = [...new Set([...icon.tags, ...icon.aliases])];

  return (
    <aside className="detail" aria-label={`${icon.name} details`}>
      <div className="detail-head">
        <div>
          <p className="eyebrow">{CATEGORY_LABELS[icon.category]}</p>
          <Heading className="detail-title mono">{icon.name}</Heading>
        </div>
        <button type="button" className="icon-button" aria-label="Close details" onClick={onClose}>
          <Praticon.Close size={18} />
        </button>
      </div>

      <div className="preview" style={{ color: style.color }}>
        <GridGuide className="preview-grid" />
        <DrawnIcon
          key={icon.name}
          name={icon.name as IconName}
          strokeWidth={style.strokeWidth}
          className="preview-icon draw"
          label={icon.name}
        />
      </div>

      <div className="sizes" style={{ color: style.color }} aria-label="Actual sizes">
        {[16, 20, 24, 32, 48].map((size) => (
          <figure key={size}>
            <Icon size={size} strokeWidth={style.strokeWidth} aria-hidden="true" />
            <figcaption className="mono">{size}</figcaption>
          </figure>
        ))}
      </div>

      <div className="tags" aria-label="Tags">
        {words.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
        <span className="tag tag-since mono">since v{icon.since}</span>
      </div>

      <div>
        <div className="tabs" role="tablist" aria-label="Snippet format">
          <button type="button" role="tab" aria-selected={tab === "react"} onClick={() => setTab("react")}>
            React
          </button>
          <button type="button" role="tab" aria-selected={tab === "svg"} onClick={() => setTab("svg")}>
            SVG
          </button>
        </div>
        <pre className="code mono" tabIndex={0}>
          {code}
        </pre>
      </div>

      <div className="actions">
        <button type="button" className="button primary" onClick={() => onCopy(code, tab === "react" ? "JSX" : "SVG")}>
          <Praticon.Copy size={16} aria-hidden="true" /> Copy {tab === "react" ? "JSX" : "SVG"}
        </button>
        <button type="button" className="button" onClick={() => onDownload(icon.name, svg)}>
          <Praticon.Download size={16} aria-hidden="true" /> SVG
        </button>
        <button type="button" className="button" aria-pressed={isSaved} onClick={() => onToggleSaved(icon.name)}>
          <Star size={16} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" /> {isSaved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Copy link to this icon"
          title="Copy link"
          onClick={() => onCopy(`${SITE_URL}icons/${icon.name}/`, "Link")}
        >
          <Praticon.Link size={16} />
        </button>
      </div>
    </aside>
  );
}
