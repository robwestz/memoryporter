import { type ReactNode } from "react";
import { Stack, Inline } from "@/lib/layout";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import type { Source } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type SourceBrowserProps = {
  sources: Source[];
  activeSourceId: string | null;
  onSourceSelect: (id: string) => void;
  renderSource: (source: Source) => ReactNode;
};

// ─── Source list item ─────────────────────────────────────────────────────────

function SourceListItem({
  source,
  active,
  onClick
}: {
  source: Source;
  active: boolean;
  onClick: () => void;
}) {
  const confidencePct = Math.round(source.confidence * 100);
  const confidenceColor =
    source.confidence >= 0.8
      ? "var(--color-success)"
      : source.confidence >= 0.5
      ? "var(--color-warning)"
      : "var(--color-danger)";

  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "var(--space-12) var(--space-16)",
        textAlign: "left",
        border: "none",
        background: active ? "var(--color-accent-subtle)" : "transparent",
        borderLeft: `3px solid ${active ? "var(--color-accent-default)" : "transparent"}`,
        cursor: "pointer",
        transition: "background var(--motion-fast)"
      }}
    >
      <Stack gap={4}>
        <Inline gap={8} align="start" justify="between">
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: active ? 600 : 400,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1
            }}
          >
            {source.title}
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: confidenceColor, fontWeight: 600, flexShrink: 0 }}>
            {confidencePct}%
          </span>
        </Inline>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-tertiary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {source.domain}
        </span>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            textOverflow: "ellipsis"
          }}
        >
          {source.excerpt}
        </span>
      </Stack>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SourceBrowser({
  sources,
  activeSourceId,
  onSourceSelect,
  renderSource
}: SourceBrowserProps) {
  const activeIdx = sources.findIndex((s) => s.id === activeSourceId);
  const activeSource = activeIdx >= 0 ? sources[activeIdx] : null;

  // Arrow keys to navigate between sources
  useKeyboardShortcut({ key: "ArrowUp", alt: true }, () => {
    if (activeIdx > 0) onSourceSelect(sources[activeIdx - 1].id);
    else if (sources.length > 0) onSourceSelect(sources[sources.length - 1].id);
  }, sources.length > 0);

  useKeyboardShortcut({ key: "ArrowDown", alt: true }, () => {
    if (activeIdx < sources.length - 1) onSourceSelect(sources[activeIdx + 1].id);
    else if (sources.length > 0) onSourceSelect(sources[0].id);
  }, sources.length > 0);

  if (sources.length === 0) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-32)"
        }}
      >
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
          No sources for this answer.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Source list (left) */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: "1px solid var(--color-border-subtle)",
          overflowY: "auto",
          background: "var(--color-surface-raised)"
        }}
      >
        <div
          style={{
            padding: "var(--space-8) var(--space-16)",
            borderBottom: "1px solid var(--color-border-subtle)"
          }}
        >
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Sources ({sources.length})
          </span>
        </div>
        {sources.map((source) => (
          <SourceListItem
            key={source.id}
            source={source}
            active={source.id === activeSourceId}
            onClick={() => onSourceSelect(source.id)}
          />
        ))}
      </div>

      {/* Source viewer (right) */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeSource ? (
          <>
            {/* Source header */}
            <div
              style={{
                padding: "var(--space-12) var(--space-16)",
                borderBottom: "1px solid var(--color-border-subtle)",
                background: "var(--color-surface-raised)",
                flexShrink: 0
              }}
            >
              <Inline gap={12} align="center" justify="between">
                <Stack gap={4} style={{ minWidth: 0 }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {activeSource.title}
                  </span>
                  <a
                    href={activeSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-accent)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block"
                    }}
                  >
                    {activeSource.url}
                  </a>
                </Stack>
                <Inline gap={8}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                    {activeIdx + 1} / {sources.length}
                  </span>
                </Inline>
              </Inline>
            </div>

            {/* Rendered source content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-16)" }}>
              {renderSource(activeSource)}
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Select a source to view
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
