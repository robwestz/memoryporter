import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { Source } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
// All four required fields are preserved as mandated by components.md.
// Never drop source.url, excerpt, confidence, or retrievedAt.

type CitationCardProps = {
  source: Source;
  excerpt: string;
  confidence: number; // 0–1
  retrievedAt: Date;
  onOpen: () => void;
};

// ─── Confidence bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.8
      ? "var(--color-success)"
      : value >= 0.5
      ? "var(--color-warning)"
      : "var(--color-danger)";

  return (
    <Inline gap={8} align="center">
      <div
        style={{
          flex: 1,
          height: 4,
          borderRadius: "var(--radius-pill)",
          background: "var(--color-surface-sunken)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: "var(--radius-pill)",
            transition: "width var(--motion-base)"
          }}
        />
      </div>
      <span
        style={{
          fontSize: "var(--text-xs)",
          color,
          fontWeight: 600,
          flexShrink: 0,
          minWidth: 28
        }}
      >
        {pct}%
      </span>
    </Inline>
  );
}

// ─── Source type icon ─────────────────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  web: "WEB",
  doc: "DOC",
  file: "FILE",
  database: "DB",
  api: "API"
};

function SourceTypeBadge({ type }: { type: string }) {
  return (
    <span
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        padding: "2px var(--space-4)",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface-sunken)",
        color: "var(--color-text-secondary)",
        letterSpacing: "0.04em",
        flexShrink: 0
      }}
    >
      {typeLabels[type] ?? type.toUpperCase()}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CitationCard({
  source,
  excerpt,
  confidence,
  retrievedAt,
  onOpen
}: CitationCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${hovered ? "var(--color-border-strong)" : "var(--color-border-subtle)"}`,
        background: "var(--color-surface-raised)",
        boxShadow: hovered ? "var(--elev-2)" : "var(--elev-1)",
        transition: "border-color var(--motion-fast), box-shadow var(--motion-fast)",
        overflow: "hidden",
        maxWidth: 360
      }}
    >
      {/* Header */}
      <div style={{ padding: "var(--space-12) var(--space-16) var(--space-8)" }}>
        <Inline gap={8} align="start" justify="between">
          <Inline gap={8} align="center">
            {source.favicon && (
              <img
                src={source.favicon}
                alt=""
                style={{ width: 16, height: 16, borderRadius: "var(--radius-sm)", flexShrink: 0 }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <Stack gap={4} style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {source.title}
              </span>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-tertiary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  textDecoration: "none"
                }}
              >
                {source.domain}
              </a>
            </Stack>
          </Inline>
          <SourceTypeBadge type={source.type} />
        </Inline>
      </div>

      {/* Excerpt */}
      <div
        style={{
          padding: "var(--space-8) var(--space-16)",
          borderTop: "1px solid var(--color-border-subtle)",
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-surface-sunken)"
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--lh-sm)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden"
          }}
        >
          "{excerpt}"
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: "var(--space-8) var(--space-16)" }}>
        <Stack gap={8}>
          <Inline gap={8} align="center">
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
                flexShrink: 0
              }}
            >
              Confidence
            </span>
            <ConfidenceBar value={confidence} />
          </Inline>
          <Inline justify="between" align="center">
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
              Retrieved {formatRelative(retrievedAt)}
            </span>
            <button
              onClick={onOpen}
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-text-accent)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0
              }}
            >
              Open →
            </button>
          </Inline>
        </Stack>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}
