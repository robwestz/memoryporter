// Kit-local sub-components for ListingsManager.

import { Stack, Inline } from "@/lib/layout";
import type { Listing, ListingStatus, Metric } from "../types";

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusColors: Record<ListingStatus, string> = {
  active: "var(--color-success)",
  draft: "var(--color-text-tertiary)",
  paused: "var(--color-warning)",
  sold: "var(--color-info)"
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 500, color: statusColors[status], background: "var(--color-surface-sunken)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "var(--radius-pill)", background: statusColors[status], flexShrink: 0 }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

// ─── Listing row cell ─────────────────────────────────────────────────────────

export function ListingTitleCell({ listing }: { listing: Listing }) {
  return (
    <Inline gap={8} align="center">
      {listing.imageUrl && (
        <img src={listing.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }} />
      )}
      <Stack gap={4}>
        <span style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>{listing.title}</span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>{listing.category}</span>
      </Stack>
    </Inline>
  );
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

// Column generators for optional metrics
export function metricColumns(showMetrics: Metric[]) {
  const cols = [];
  if (showMetrics.includes("views")) {
    cols.push({ key: "views", header: "Views", render: (row: Listing) => <span style={{ fontSize: "var(--text-sm)" }}>{row.views.toLocaleString()}</span> });
  }
  if (showMetrics.includes("conversion")) {
    cols.push({ key: "conversion", header: "CVR", render: (row: Listing) => <span style={{ fontSize: "var(--text-sm)" }}>{(row.conversionRate * 100).toFixed(1)}%</span> });
  }
  if (showMetrics.includes("revenue-7d")) {
    cols.push({ key: "revenue7d", header: "Rev 7d", render: (row: Listing) => <span style={{ fontSize: "var(--text-sm)" }}>{formatCurrency(row.revenue7d, row.currency)}</span> });
  }
  return cols;
}
