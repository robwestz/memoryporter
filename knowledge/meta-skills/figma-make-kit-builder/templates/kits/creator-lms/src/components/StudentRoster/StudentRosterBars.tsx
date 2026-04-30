import { Inline } from "@/lib/layout/Inline";
import type { StudentFilters, StudentStatus, BulkAction } from "../types";

const STATUS_COLOR: Record<StudentStatus, string> = {
  active: "var(--color-success)", stuck: "var(--color-warning)",
  completed: "var(--color-info)", dropped: "var(--color-danger)",
};
const STATUS_LABEL: Record<StudentStatus, string> = {
  active: "Active", stuck: "Stuck", completed: "Completed", dropped: "Dropped",
};
const BULK_LABELS: Record<BulkAction, string> = {
  message: "Message", remind: "Send reminder", export: "Export", remove: "Remove",
};

export function RosterFilterBar({ filters, onChange }: { filters: StudentFilters; onChange: (f: StudentFilters) => void }) {
  const statuses: StudentStatus[] = ["active", "stuck", "completed", "dropped"];
  const active = (s: StudentStatus) => filters.status === s;
  return (
    <Inline gap={8} align="center" style={{ padding: `var(--space-12) var(--space-16)` }}>
      <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-text-secondary)" }}>Status:</span>
      <button onClick={() => onChange({ ...filters, status: undefined })}
        style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-pill)", border: `1px solid ${!filters.status ? "var(--color-accent-default)" : "var(--color-border-default)"}`, background: !filters.status ? "var(--color-accent-subtle)" : "transparent", color: !filters.status ? "var(--color-text-accent)" : "var(--color-text-secondary)", cursor: "pointer" }}>
        All
      </button>
      {statuses.map((s) => (
        <button key={s} onClick={() => onChange({ ...filters, status: s })}
          style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-pill)", border: `1px solid ${active(s) ? STATUS_COLOR[s] : "var(--color-border-default)"}`, background: active(s) ? "var(--color-surface-sunken)" : "transparent", color: active(s) ? STATUS_COLOR[s] : "var(--color-text-secondary)", cursor: "pointer" }}>
          {STATUS_LABEL[s]}
        </button>
      ))}
    </Inline>
  );
}

export function RosterBulkBar({ selectedIds, actions, onAction, onClear }: {
  selectedIds: Set<string>; actions: BulkAction[];
  onAction: (a: BulkAction) => void; onClear: () => void;
}) {
  if (selectedIds.size === 0) return null;
  return (
    <Inline gap={8} align="center" style={{ padding: `var(--space-8) var(--space-16)`, background: "var(--color-accent-subtle)", borderTop: `1px solid var(--color-border-subtle)` }}>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-accent)" }}>{selectedIds.size} selected</span>
      {actions.map((a) => (
        <button key={a} onClick={() => onAction(a)}
          style={{ fontSize: "var(--text-xs)", fontWeight: 500, padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-sm)", border: `1px solid var(--color-accent-default)`, background: "transparent", color: "var(--color-text-accent)", cursor: "pointer" }}>
          {BULK_LABELS[a]}
        </button>
      ))}
      <button onClick={onClear} style={{ marginLeft: "auto", fontSize: "var(--text-xs)", border: "none", background: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>Clear</button>
    </Inline>
  );
}
