// Kit-local sub-components for PayoutsLedger.

import { useState } from "react";
import { Inline } from "@/lib/layout";
import type { PayoutStatus, ExportFormat } from "../types";

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusColors: Record<PayoutStatus, string> = {
  pending: "var(--color-text-tertiary)",
  processing: "var(--color-info)",
  completed: "var(--color-success)",
  failed: "var(--color-danger)",
  "on-hold": "var(--color-warning)"
};

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  return (
    <span style={{ display: "inline-block", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 500, color: statusColors[status], background: "var(--color-surface-sunken)" }}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ")}
    </span>
  );
}

// ─── Period chip ──────────────────────────────────────────────────────────────

export function PeriodChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "var(--space-4) var(--space-12)", fontSize: "var(--text-xs)", fontWeight: active ? 600 : 400,
        borderRadius: "var(--radius-pill)", border: `1px solid ${active ? "var(--color-accent-default)" : "var(--color-border-default)"}`,
        background: active ? "var(--color-accent-subtle)" : "transparent", color: active ? "var(--color-text-accent)" : "var(--color-text-secondary)", cursor: "pointer", whiteSpace: "nowrap"
      }}
    >
      {label}
    </button>
  );
}

// ─── Export menu ──────────────────────────────────────────────────────────────
// Monetization: CSV free, Excel/PDF/JSON gated (PRO badge shown).

type ExportMenuFormat = { label: string; value: ExportFormat; gated?: boolean };

const FORMATS: ExportMenuFormat[] = [
  { label: "CSV", value: "csv" },
  { label: "Excel", value: "excel", gated: true },
  { label: "PDF", value: "pdf", gated: true },
  { label: "JSON (API)", value: "json", gated: true }
];

export function ExportMenu({ onExport }: { onExport: (format: ExportFormat) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", background: "var(--color-surface-raised)", color: "var(--color-text-primary)", cursor: "pointer" }}
      >
        Export ↓
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + var(--space-4))", background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", boxShadow: "var(--elev-2)", zIndex: "var(--z-dropdown)", minWidth: 160, overflow: "hidden" }}>
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => { if (!f.gated) { onExport(f.value); setOpen(false); } }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", border: "none", background: "transparent", color: f.gated ? "var(--color-text-tertiary)" : "var(--color-text-primary)", cursor: f.gated ? "default" : "pointer", textAlign: "left" as const }}
            >
              {f.label}
              {f.gated && (
                <span style={{ fontSize: "var(--text-xs)", padding: "2px var(--space-4)", borderRadius: "var(--radius-sm)", background: "var(--color-accent-subtle)", color: "var(--color-text-accent)", fontWeight: 600 }}>
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
