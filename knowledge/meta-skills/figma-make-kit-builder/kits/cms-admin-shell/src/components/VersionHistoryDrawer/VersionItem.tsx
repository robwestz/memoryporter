import { Inline } from "@/lib/layout";
import type { Version } from "../types";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export type VersionItemProps = {
  version: Version;
  isSelected: boolean;
  onSelect: () => void;
  onRestore: (id: string) => void;
};

export function VersionItem({ version, isSelected, onSelect, onRestore }: VersionItemProps) {
  return (
    <div
      onClick={onSelect}
      style={{ padding: "var(--space-12) var(--space-16)", cursor: "pointer", borderBottom: "1px solid var(--color-border-subtle)", background: isSelected ? "var(--color-accent-subtle)" : "transparent", transition: `background var(--motion-fast)` }}
    >
      <Inline justify="between" align="start">
        <div>
          {version.isCurrent && (
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-success)", marginBottom: "var(--space-4)", display: "block" }}>CURRENT</span>
          )}
          {version.label && (
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>{version.label}</div>
          )}
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: version.label ? "var(--space-4)" : 0 }}>
            {formatDate(version.createdAt)}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "var(--space-4)" }}>
            by {version.createdBy}
          </div>
        </div>

        {!version.isCurrent && (
          <button
            onClick={(e) => { e.stopPropagation(); onRestore(version.id); }}
            style={{ padding: "var(--space-4) var(--space-8)", fontSize: "var(--text-xs)", fontWeight: 500, border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", background: "var(--color-surface-overlay)", color: "var(--color-text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Restore
          </button>
        )}
      </Inline>
    </div>
  );
}
