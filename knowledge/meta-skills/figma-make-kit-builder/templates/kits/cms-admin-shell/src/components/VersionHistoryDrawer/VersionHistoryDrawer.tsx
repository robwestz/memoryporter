import { useState, type ReactNode } from "react";
import { Stack, Inline, Split } from "@/lib/layout";
import type { Version } from "../types";
import { VersionItem } from "./VersionItem";

export type VersionHistoryDrawerProps = {
  contentId: string;
  versions: Version[];
  onRestore: (id: string) => void;
  renderDiff: (a: Version, b: Version) => ReactNode;
};

export function VersionHistoryDrawer({ contentId, versions, onRestore, renderDiff }: VersionHistoryDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(versions[0]?.id ?? null);

  const selected = versions.find((v) => v.id === selectedId) ?? null;
  const current = versions.find((v) => v.isCurrent) ?? null;
  const showDiff = selected && current && selected.id !== current.id;

  return (
    <div style={{ width: "520px", height: "100%", background: "var(--color-surface-overlay)", borderLeft: "1px solid var(--color-border-subtle)", boxShadow: "var(--elev-3)", zIndex: "var(--z-drawer)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "var(--space-16) var(--space-24)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
        <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>Version history</div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-4)" }}>
          {versions.length} saved versions · {contentId}
        </div>

        {/* Pro callout */}
        <div style={{ marginTop: "var(--space-12)", padding: "var(--space-8) var(--space-12)", borderRadius: "var(--radius-md)", background: "var(--color-accent-subtle)", border: "1px solid var(--color-border-subtle)" }}>
          <Inline gap={8} align="center">
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-accent)" }}>
              Pro: unlimited history — free plan keeps 10 versions.
            </span>
            <button style={{ padding: "var(--space-4) var(--space-8)", fontSize: "var(--text-xs)", fontWeight: 600, border: "none", borderRadius: "var(--radius-pill)", background: "var(--color-accent-default)", color: "var(--color-text-inverted)", cursor: "pointer", whiteSpace: "nowrap" }}>
              Upgrade
            </button>
          </Inline>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Split
          direction="horizontal"
          primary={
            <div style={{ height: "100%", overflowY: "auto" }}>
              <Stack gap={0}>
                {versions.map((v) => (
                  <VersionItem key={v.id} version={v} isSelected={v.id === selectedId} onSelect={() => setSelectedId(v.id)} onRestore={onRestore} />
                ))}
              </Stack>
            </div>
          }
          secondary={
            <div style={{ height: "100%", overflowY: "auto", padding: "var(--space-16)", borderLeft: "1px solid var(--color-border-subtle)", background: "var(--color-surface-base)" }}>
              {showDiff ? renderDiff(selected, current) : (
                <div style={{ padding: "var(--space-32)", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>
                  {selected?.isCurrent ? "This is the current version." : "Select a version to compare."}
                </div>
              )}
            </div>
          }
          primarySize="200px"
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}
