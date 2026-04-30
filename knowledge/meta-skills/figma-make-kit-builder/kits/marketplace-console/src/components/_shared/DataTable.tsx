// TODO phase-2: swap to shared power-data-table primitive when A2's kit is published.
// Minimal inline DataTable sufficient for ListingsManager and PayoutsLedger.

import type { ReactNode } from "react";
import { Stack, Inline } from "@/lib/layout";

export type ColumnDef<T> = {
  key: string;
  header: string;
  width?: string;
  render: (row: T, idx: number) => ReactNode;
  sortable?: boolean;
};

type DataTableProps<T> = {
  rows: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  selectable?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
};

export function DataTable<T>({
  rows,
  columns,
  keyExtractor,
  selectedKeys,
  onSelectionChange,
  selectable = false,
  emptyMessage = "No items found.",
  stickyHeader = true
}: DataTableProps<T>) {
  const allSelected = rows.length > 0 && selectedKeys?.size === rows.length;

  function toggleAll() {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(rows.map(keyExtractor)));
    }
  }

  function toggleRow(key: string) {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onSelectionChange(next);
  }

  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--lh-sm)"
        }}
      >
        <thead
          style={{
            position: stickyHeader ? "sticky" : undefined,
            top: stickyHeader ? 0 : undefined,
            zIndex: stickyHeader ? "var(--z-sticky)" : undefined,
            background: "var(--color-surface-raised)"
          }}
        >
          <tr>
            {selectable && (
              <th style={thStyle}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} style={{ ...thStyle, width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  textAlign: "center",
                  padding: "var(--space-48) var(--space-16)",
                  color: "var(--color-text-tertiary)",
                  fontSize: "var(--text-sm)"
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const key = keyExtractor(row);
              const selected = selectedKeys?.has(key) ?? false;
              return (
                <tr
                  key={key}
                  style={{
                    background: selected
                      ? "var(--color-accent-subtle)"
                      : idx % 2 === 0
                      ? "var(--color-surface-raised)"
                      : "var(--color-surface-base)",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    transition: "background var(--motion-fast)"
                  }}
                >
                  {selectable && (
                    <td style={tdStyle}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(key)}
                        aria-label={`Select row ${idx + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} style={tdStyle}>
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "var(--space-8) var(--space-12)",
  fontSize: "var(--text-xs)",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  borderBottom: "1px solid var(--color-border-default)",
  whiteSpace: "nowrap"
};

const tdStyle: React.CSSProperties = {
  padding: "var(--space-8) var(--space-12)",
  color: "var(--color-text-primary)",
  verticalAlign: "middle"
};

// Bulk action bar shown above table when items are selected
type BulkActionBarProps = {
  count: number;
  actions: Array<{ label: string; value: string; danger?: boolean }>;
  onAction: (action: string) => void;
  onClear: () => void;
};

export function BulkActionBar({ count, actions, onAction, onClear }: BulkActionBarProps) {
  return (
    <div
      style={{
        padding: "var(--space-8) var(--space-12)",
        background: "var(--color-accent-subtle)",
        borderRadius: "var(--radius-md)",
        borderBottom: "1px solid var(--color-border-default)"
      }}
    >
      <Inline gap={8} justify="between" align="center">
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>
          {count} selected
        </span>
        <Inline gap={8}>
          {actions.map((a) => (
            <button
              key={a.value}
              onClick={() => onAction(a.value)}
              style={{
                padding: "var(--space-4) var(--space-8)",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-default)",
                background: "var(--color-surface-raised)",
                color: a.danger ? "var(--color-danger)" : "var(--color-text-primary)",
                cursor: "pointer"
              }}
            >
              {a.label}
            </button>
          ))}
          <button
            onClick={onClear}
            style={{
              padding: "var(--space-4) var(--space-8)",
              fontSize: "var(--text-sm)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-secondary)",
              cursor: "pointer"
            }}
          >
            Clear
          </button>
        </Inline>
      </Inline>
    </div>
  );
}
