import { useState } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { FilterBar } from "./FilterBar";
import type { RunRecord, RunFilters, RunStatus, BulkAction } from "../types";

export interface RunHistoryTableProps {
  workflowId: string;
  filters?: RunFilters;
  onRunSelect: (id: string) => void;
  bulkActions?: BulkAction[];
}

const STATUS_COLOR: Record<RunStatus, string> = {
  running: "var(--color-info)", success: "var(--color-success)",
  error: "var(--color-danger)", cancelled: "var(--color-text-tertiary)",
};
const STATUS_LABEL: Record<RunStatus, string> = {
  running: "Running", success: "Success", error: "Error", cancelled: "Cancelled",
};
const BULK_LABELS: Record<BulkAction, string> = {
  retry: "Retry", cancel: "Cancel", "export-logs": "Export logs", delete: "Delete",
};

function fmt(d: Date) { return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }); }
function dur(ms?: number) { if (!ms) return "—"; return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`; }

const STUB_RUNS: RunRecord[] = [
  { id: "run-001", workflowId: "wf-1", status: "success", triggerSource: "webhook", startedAt: new Date(Date.now() - 300_000), endedAt: new Date(Date.now() - 240_000), durationMs: 1240, stepCount: 4 },
  { id: "run-002", workflowId: "wf-1", status: "error", triggerSource: "schedule", startedAt: new Date(Date.now() - 900_000), endedAt: new Date(Date.now() - 840_000), durationMs: 320, stepCount: 2, errorMessage: "HTTP 503" },
  { id: "run-003", workflowId: "wf-1", status: "running", triggerSource: "manual", startedAt: new Date(), stepCount: 1 },
];

const COL = "24px 1fr 100px 100px 80px 80px 80px";
const CELL_XS = { fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" };
const CELL_CODE = { fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" };

export function RunHistoryTable({ workflowId: _wfId, filters: init = {}, onRunSelect, bulkActions = [] }: RunHistoryTableProps) {
  const [filters, setFilters] = useState<RunFilters>(init);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useKeyboardShortcut({ key: "Escape" }, () => setSelected(new Set()), selected.size > 0);

  function toggle(id: string) {
    setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const filtered = STUB_RUNS.filter((r) => {
    if (!filters.status) return true;
    const ss = Array.isArray(filters.status) ? filters.status : [filters.status];
    return ss.includes(r.status);
  });

  return (
    <Stack gap={0} style={{ background: "var(--color-surface-raised)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <FilterBar filters={filters} onChange={setFilters} />

      {selected.size > 0 && (
        <Inline gap={8} align="center" style={{ padding: `var(--space-8) var(--space-16)`, background: "var(--color-accent-subtle)", borderBottom: `1px solid var(--color-border-subtle)` }}>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-accent)" }}>{selected.size} selected</span>
          {bulkActions.map((a) => (
            <button key={a} onClick={() => {}} style={{ fontSize: "var(--text-xs)", fontWeight: 500, padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-sm)", border: `1px solid var(--color-accent-default)`, background: "transparent", color: "var(--color-text-accent)", cursor: "pointer" }}>{BULK_LABELS[a]}</button>
          ))}
          <button onClick={() => setSelected(new Set())} style={{ marginLeft: "auto", fontSize: "var(--text-xs)", border: "none", background: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>Clear</button>
        </Inline>
      )}

      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: COL, gap: "var(--space-12)", padding: `var(--space-8) var(--space-16)`, background: "var(--color-surface-sunken)", borderTop: `1px solid var(--color-border-subtle)`, borderBottom: `1px solid var(--color-border-subtle)` }}>
        {["", "Run ID", "Status", "Trigger", "Steps", "Duration", "Started"].map((col) => (
          <div key={col} style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col}</div>
        ))}
      </div>

      {filtered.map((run) => (
        <div key={run.id} onClick={() => onRunSelect(run.id)}
          style={{ display: "grid", gridTemplateColumns: COL, gap: "var(--space-12)", padding: `var(--space-12) var(--space-16)`, alignItems: "center", borderBottom: `1px solid var(--color-border-subtle)`, background: selected.has(run.id) ? "var(--color-accent-subtle)" : "transparent", cursor: "pointer" }}>
          <input type="checkbox" checked={selected.has(run.id)} onChange={(e) => { e.stopPropagation(); toggle(run.id); }} onClick={(e) => e.stopPropagation()} style={{ accentColor: "var(--color-accent-default)", cursor: "pointer" }} />
          <code style={CELL_CODE}>{run.id}</code>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: STATUS_COLOR[run.status] }}>{STATUS_LABEL[run.status]}</span>
          <span style={CELL_XS}>{run.triggerSource}</span>
          <span style={CELL_XS}>{run.stepCount ?? "—"}</span>
          <span style={CELL_XS}>{dur(run.durationMs)}</span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{fmt(run.startedAt)}</span>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ padding: "var(--space-48)", textAlign: "center", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
          No runs match the current filters.
        </div>
      )}
    </Stack>
  );
}
