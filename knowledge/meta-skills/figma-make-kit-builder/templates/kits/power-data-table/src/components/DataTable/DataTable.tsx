import { useRef, useState, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Stack } from "@/lib/layout";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import type { ColumnConfig, Row, RowAction, TableDensity } from "../types";

type DataTableProps = {
  columns: ColumnConfig[];
  rows: Row[];
  rowKey: string;
  virtualized?: boolean;
  stickyHeader?: boolean;
  onColumnConfigChange?: (c: ColumnConfig[]) => void;
  onRowAction?: (a: RowAction) => void;
  density?: TableDensity;
};

const DENSITY_HEIGHT: Record<TableDensity, number> = {
  compact: 32,
  default: 44,
  comfortable: 56,
};

export function DataTable({
  columns,
  rows,
  rowKey,
  virtualized = true,
  stickyHeader = true,
  onRowAction,
  density = "default",
}: DataTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const rowHeight = DENSITY_HEIGHT[density];

  const visibleColumns = useMemo(
    () => columns.filter((c) => !c.hidden),
    [columns]
  );

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
    enabled: virtualized,
  });

  const moveFocus = useCallback(
    (delta: number) => {
      setFocusedRow((prev) => {
        if (prev === null) return delta > 0 ? 0 : rows.length - 1;
        return Math.max(0, Math.min(rows.length - 1, prev + delta));
      });
    },
    [rows.length]
  );

  useKeyboardShortcut({ key: "ArrowDown" }, (e) => {
    e.preventDefault();
    moveFocus(1);
  });
  useKeyboardShortcut({ key: "ArrowUp" }, (e) => {
    e.preventDefault();
    moveFocus(-1);
  });
  useKeyboardShortcut({ key: "Enter" }, () => {
    if (focusedRow !== null) {
      const row = rows[focusedRow];
      onRowAction?.({ rowKey: String(row[rowKey]), action: "open" });
    }
  });

  const virtualItems = virtualized
    ? rowVirtualizer.getVirtualItems()
    : rows.map((_, i) => ({
        index: i,
        start: i * rowHeight,
        size: rowHeight,
        key: i,
        lane: 0,
      }));

  const totalSize = virtualized
    ? rowVirtualizer.getTotalSize()
    : rows.length * rowHeight;

  return (
    <Stack gap={0} style={{ height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div
        role="rowgroup"
        style={{
          position: stickyHeader ? "sticky" : "relative",
          top: 0,
          zIndex: "var(--z-sticky)",
          background: "var(--color-surface-raised)",
          borderBottom: "1px solid var(--color-border-default)",
        }}
      >
        <div
          role="row"
          style={{
            display: "flex",
            alignItems: "center",
            height: "var(--space-48)",
            paddingInline: "var(--space-16)",
          }}
        >
          {visibleColumns.map((col) => (
            <HeaderCell key={col.field} col={col} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div
        ref={containerRef}
        role="rowgroup"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "auto",
        }}
        tabIndex={0}
      >
        <div style={{ height: `${totalSize}px`, position: "relative" }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const key = String(row[rowKey]);
            const isFocused = focusedRow === virtualRow.index;
            return (
              <div
                key={key}
                role="row"
                aria-selected={isFocused}
                onClick={() => setFocusedRow(virtualRow.index)}
                style={{
                  position: "absolute",
                  top: `${virtualRow.start}px`,
                  left: 0,
                  right: 0,
                  height: `${rowHeight}px`,
                  display: "flex",
                  alignItems: "center",
                  paddingInline: "var(--space-16)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  background: isFocused
                    ? "var(--color-accent-subtle)"
                    : "var(--color-surface-base)",
                  cursor: "default",
                }}
              >
                {visibleColumns.map((col) => (
                  <DataCell
                    key={col.field}
                    col={col}
                    row={row}
                    onAction={onRowAction}
                    rowKey={key}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Stack>
  );
}

// --- Sub-components ---

type HeaderCellProps = { col: ColumnConfig };

function HeaderCell({ col }: HeaderCellProps) {
  return (
    <div
      role="columnheader"
      style={{
        flex: col.width ? `0 0 ${col.width}px` : "1 1 0",
        minWidth: 0,
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        paddingRight: "var(--space-8)",
        userSelect: "none",
      }}
    >
      {col.label}
    </div>
  );
}

type DataCellProps = {
  col: ColumnConfig;
  row: Row;
  rowKey: string;
  onAction?: (a: RowAction) => void;
};

function DataCell({ col, row }: DataCellProps) {
  const value = row[col.field];
  return (
    <div
      role="cell"
      style={{
        flex: col.width ? `0 0 ${col.width}px` : "1 1 0",
        minWidth: 0,
        fontSize: "var(--text-sm)",
        color: "var(--color-text-primary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        paddingRight: "var(--space-8)",
      }}
    >
      {col.renderCell
        ? col.renderCell(value, row)
        : value === null || value === undefined
        ? "—"
        : String(value)}
    </div>
  );
}
