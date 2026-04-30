import { Inline } from "@/lib/layout/Inline";
import type { RunFilters, RunStatus } from "../types";

const STATUS_COLOR: Record<RunStatus, string> = {
  running: "var(--color-info)", success: "var(--color-success)",
  error: "var(--color-danger)", cancelled: "var(--color-text-tertiary)",
};
const STATUS_LABEL: Record<RunStatus, string> = {
  running: "Running", success: "Success", error: "Error", cancelled: "Cancelled",
};
const TIME_RANGE_LABELS = {
  "last-hour": "Last hour", "last-24h": "Last 24h",
  "last-7-days": "Last 7 days", "last-30-days": "Last 30 days",
};

export function FilterBar({ filters, onChange }: { filters: RunFilters; onChange: (f: RunFilters) => void }) {
  const statuses: RunStatus[] = ["running", "success", "error", "cancelled"];
  return (
    <Inline gap={8} align="center" style={{ padding: `var(--space-8) var(--space-16)` }}>
      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", fontWeight: 500 }}>Status:</span>
      {statuses.map((s) => {
        const active = Array.isArray(filters.status) ? filters.status.includes(s) : filters.status === s;
        return (
          <button key={s} onClick={() => onChange({ ...filters, status: active ? undefined : s })}
            style={{ fontSize: "var(--text-xs)", fontWeight: 500, padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-pill)", border: `1px solid ${active ? STATUS_COLOR[s] : "var(--color-border-default)"}`, background: active ? "var(--color-surface-sunken)" : "transparent", color: active ? STATUS_COLOR[s] : "var(--color-text-secondary)", cursor: "pointer" }}>
            {STATUS_LABEL[s]}
          </button>
        );
      })}
      <span style={{ marginLeft: "var(--space-8)", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", fontWeight: 500 }}>Range:</span>
      <select value={filters.timeRange ?? ""} onChange={(e) => onChange({ ...filters, timeRange: (e.target.value as RunFilters["timeRange"]) || undefined })}
        style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "var(--color-surface-base)", color: "var(--color-text-primary)" }}>
        <option value="">All time</option>
        {(Object.keys(TIME_RANGE_LABELS) as Array<keyof typeof TIME_RANGE_LABELS>).map((k) => (
          <option key={k} value={k}>{TIME_RANGE_LABELS[k]}</option>
        ))}
      </select>
    </Inline>
  );
}
