// TODO phase-2: swap inline DataTable to shared power-data-table primitive once A2's kit is published.
import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import { DataTable } from "../_shared/DataTable";
import type { ColumnDef } from "../_shared/DataTable";
import { PayoutStatusBadge, PeriodChip, ExportMenu } from "./PayoutWidgets";
import type { Payout, PayoutFilters, ExportFormat } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type PayoutsLedgerProps = {
  payouts: Payout[];
  filters?: PayoutFilters;
  onExport: (format: ExportFormat) => void;
  onRowExpand: (payoutId: string) => void;
};

const PERIOD_OPTIONS: Array<{ label: string; value: NonNullable<PayoutFilters["period"]> }> = [
  { label: "Last 30 days", value: "last-30-days" },
  { label: "Last 90 days", value: "last-90-days" },
  { label: "Last year", value: "last-year" }
];

function fmt(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function withinPeriod(p: Payout, period?: PayoutFilters["period"]): boolean {
  if (!period) return true;
  const days = period === "last-30-days" ? 30 : period === "last-90-days" ? 90 : 365;
  return p.initiatedAt >= new Date(Date.now() - days * 86400000);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PayoutsLedger({ payouts, filters = {}, onExport, onRowExpand }: PayoutsLedgerProps) {
  const [localFilters, setLocalFilters] = useState<PayoutFilters>(filters);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleRowExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
    onRowExpand(id);
  }

  const visible = payouts.filter((p) => {
    if (localFilters.status && p.status !== localFilters.status) return false;
    if (localFilters.method && p.method !== localFilters.method) return false;
    return withinPeriod(p, localFilters.period);
  });

  const total = visible.reduce((s, p) => (p.status === "completed" ? s + p.amount : s), 0);

  const columns: ColumnDef<Payout>[] = [
    {
      key: "date", header: "Date",
      render: (row) => <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>{row.initiatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
    },
    {
      key: "reference", header: "Reference",
      render: (row) => <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>{row.reference}</span>
    },
    {
      key: "method", header: "Method",
      render: (row) => <span style={{ fontSize: "var(--text-sm)" }}>{row.method.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
    },
    {
      key: "amount", header: "Amount",
      render: (row) => <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{fmt(row.amount, row.currency)}</span>
    },
    {
      key: "status", header: "Status",
      render: (row) => <PayoutStatusBadge status={row.status} />
    },
    {
      key: "orders", header: "Orders",
      render: (row) => (
        <button
          onClick={() => handleRowExpand(row.id)}
          style={{ fontSize: "var(--text-xs)", color: "var(--color-text-accent)", border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
        >
          {row.orderIds.length} order{row.orderIds.length !== 1 ? "s" : ""} {expandedId === row.id ? "▲" : "▼"}
        </button>
      )
    }
  ];

  return (
    <Stack gap={0} style={{ height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "var(--space-12) var(--space-16)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
        <Inline gap={8} justify="between" align="center">
          <Inline gap={8} wrap={false}>
            {PERIOD_OPTIONS.map((opt) => (
              <PeriodChip key={opt.value} label={opt.label} active={localFilters.period === opt.value} onClick={() => setLocalFilters({ ...localFilters, period: opt.value })} />
            ))}
            <PeriodChip label="All time" active={!localFilters.period} onClick={() => setLocalFilters({ ...localFilters, period: undefined })} />
          </Inline>
          <Inline gap={12} align="center">
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
              Total: {fmt(total, "USD")}
            </span>
            <ExportMenu onExport={onExport} />
          </Inline>
        </Inline>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <DataTable rows={visible} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No payouts in this period." />
      </div>
    </Stack>
  );
}
