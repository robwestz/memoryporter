import { useState, useCallback } from "react";
import { Stack, Inline } from "@/lib/layout";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { DataTable, BulkActionBar } from "../_shared/DataTable";
import { StatusBadge, FilterChip, ListingTitleCell, formatCurrency, metricColumns } from "./ListingWidgets";
import type {
  Listing,
  ListingFilters,
  BulkAction,
  Metric,
  ListingAction,
  ListingStatus
} from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type ListingsManagerProps = {
  listings: Listing[];
  filters?: ListingFilters;
  bulkActions?: BulkAction[];
  onListingAction: (action: ListingAction) => void;
  showMetrics?: Metric[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingsManager({
  listings,
  filters = {},
  bulkActions = [],
  onListingAction,
  showMetrics = []
}: ListingsManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [localFilters, setLocalFilters] = useState<ListingFilters>(filters);

  useKeyboardShortcut({ key: "Escape" }, useCallback(() => setSelected(new Set()), []), selected.size > 0);

  // Apply filters
  const visible = listings.filter((l) => {
    if (localFilters.status) {
      const statuses = Array.isArray(localFilters.status) ? localFilters.status : [localFilters.status];
      if (!statuses.includes(l.status)) return false;
    }
    if (localFilters.lowStock && l.inventory > 5) return false;
    if (localFilters.priceMin !== undefined && l.price < localFilters.priceMin) return false;
    if (localFilters.priceMax !== undefined && l.price > localFilters.priceMax) return false;
    if (localFilters.category && l.category !== localFilters.category) return false;
    return true;
  });

  const columns = [
    { key: "title", header: "Listing", width: "30%", render: (row: Listing) => <ListingTitleCell listing={row} /> },
    { key: "status", header: "Status", render: (row: Listing) => <StatusBadge status={row.status} /> },
    { key: "price", header: "Price", render: (row: Listing) => <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{formatCurrency(row.price, row.currency)}</span> },
    {
      key: "inventory", header: "Stock",
      render: (row: Listing) => (
        <span style={{ fontSize: "var(--text-sm)", color: row.inventory <= 5 ? "var(--color-warning)" : "var(--color-text-primary)" }}>
          {row.inventory}
        </span>
      )
    },
    ...metricColumns(showMetrics)
  ];

  function handleBulkAction(action: string) {
    onListingAction({ type: "bulk", action: action as BulkAction, ids: Array.from(selected) });
    setSelected(new Set());
  }

  const bulkActionItems = bulkActions.map((a) => ({
    label: a.charAt(0).toUpperCase() + a.slice(1).replace(/-/g, " "),
    value: a,
    danger: a === "delete"
  }));

  return (
    <Stack gap={0} style={{ height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "var(--space-12) var(--space-16)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
        <Inline gap={8} justify="between" align="center">
          <Inline gap={8} wrap={false}>
            <FilterChip label="All" active={!localFilters.status} onClick={() => setLocalFilters({ ...localFilters, status: undefined })} />
            {(["active", "draft", "paused", "sold"] as ListingStatus[]).map((s) => (
              <FilterChip
                key={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                active={localFilters.status === s}
                onClick={() => setLocalFilters({ ...localFilters, status: s })}
              />
            ))}
            <FilterChip label="Low stock" active={!!localFilters.lowStock} onClick={() => setLocalFilters({ ...localFilters, lowStock: !localFilters.lowStock })} />
          </Inline>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {visible.length} listing{visible.length !== 1 ? "s" : ""}
          </span>
        </Inline>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && bulkActions.length > 0 && (
        <BulkActionBar count={selected.size} actions={bulkActionItems} onAction={handleBulkAction} onClear={() => setSelected(new Set())} />
      )}

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <DataTable
          rows={visible}
          columns={columns}
          keyExtractor={(r) => r.id}
          selectedKeys={selected}
          onSelectionChange={setSelected}
          selectable
          emptyMessage="No listings match these filters."
        />
      </div>
    </Stack>
  );
}
