import { useState } from "react";
import { Stack, Inline, Split } from "@/lib/layout";
import { createStore } from "@/lib/store/createStore";
import { DataTable } from "../components/DataTable";
import { ColumnConfigurator } from "../components/ColumnConfigurator";
import { BulkActionBar } from "../components/BulkActionBar";
import { SavedFilterSets } from "../components/SavedFilterSets";
import type {
  ColumnConfig,
  Row,
  RowAction,
  FilterSet,
  BulkAction,
} from "../components/types";

// --- Stub data ---

const STUB_ROWS: Row[] = Array.from({ length: 200 }, (_, i) => ({
  id: `row-${i + 1}`,
  name: `Customer ${i + 1}`,
  plan: i % 3 === 0 ? "enterprise" : i % 2 === 0 ? "pro" : "free",
  mrr: Math.round(Math.random() * 5000 * 100) / 100,
  status: i % 5 === 0 ? "churned" : i % 4 === 0 ? "at-risk" : "active",
  lastSeen: new Date(Date.now() - Math.random() * 1e10)
    .toISOString()
    .slice(0, 10),
}));

const INITIAL_COLUMNS: ColumnConfig[] = [
  { field: "id", label: "ID", width: 80 },
  { field: "name", label: "Name" },
  { field: "plan", label: "Plan", width: 100 },
  {
    field: "mrr",
    label: "MRR",
    width: 100,
    renderCell: (v) =>
      `$${(v as number).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  },
  {
    field: "status",
    label: "Status",
    width: 100,
    renderCell: (v) => <StatusBadge status={v as string} />,
  },
  { field: "lastSeen", label: "Last Seen", width: 110 },
];

const BULK_ACTIONS: BulkAction[] = [
  { id: "archive", label: "Archive" },
  { id: "assign", label: "Assign" },
  {
    id: "export",
    label: "Export",
    requiresPlan: "pro",
  },
];

const STUB_FILTER_SETS: FilterSet[] = [
  {
    id: "fs-1",
    name: "Active customers",
    filters: [{ id: "f1", field: "status", operator: "eq", value: "active" }],
  },
  {
    id: "fs-2",
    name: "At-risk pro",
    filters: [
      { id: "f2", field: "status", operator: "eq", value: "at-risk" },
      { id: "f3", field: "plan", operator: "eq", value: "pro" },
    ],
  },
];

const TEAM_FILTER_SETS: FilterSet[] = [
  {
    id: "tf-1",
    name: "All enterprise",
    filters: [
      { id: "f4", field: "plan", operator: "eq", value: "enterprise" },
    ],
    teamId: "team-1",
  },
];

// --- Store for selection state ---

type SelectionState = {
  selected: Set<string>;
};

const selectionStore = createStore<SelectionState>({ selected: new Set() });

// --- App ---

export default function App() {
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [configuratorOpen, setConfiguratorOpen] = useState(false);
  const [activeFilterSet, setActiveFilterSet] = useState<string | null>(null);

  const selected = selectionStore.use((s) => s.selected);
  const selectedCount = selected.size;

  function handleRowAction(action: RowAction) {
    if (action.action === "open") {
      // In production: navigate to row detail
      console.info("Open row:", action.rowKey);
    }
    if (action.action === "select") {
      selectionStore.setState((prev) => {
        const next = new Set(prev.selected);
        if (next.has(action.rowKey)) next.delete(action.rowKey);
        else next.add(action.rowKey);
        return { selected: next };
      });
    }
  }

  function handleBulkAction(actionId: string) {
    if (actionId.startsWith("__upgrade__")) {
      console.info("Upgrade prompt for:", actionId);
      return;
    }
    console.info("Bulk action:", actionId, "on", selectedCount, "rows");
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-surface-base)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border-subtle)",
          padding: "var(--space-12) var(--space-24)",
        }}
      >
        <Inline gap={16} justify="between" align="center">
          <Inline gap={8} align="center">
            <h1
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              Customers
            </h1>
            <RowCountBadge count={STUB_ROWS.length} />
          </Inline>

          <Inline gap={8}>
            <SavedFilterSets
              sets={STUB_FILTER_SETS}
              teamSets={TEAM_FILTER_SETS}
              activeSetId={activeFilterSet}
              onApply={setActiveFilterSet}
              onSaveCurrent={() => console.info("Save current filters")}
              onShare={(id) => console.info("Share set:", id)}
            />
            <button
              type="button"
              onClick={() => setConfiguratorOpen((o) => !o)}
              aria-pressed={configuratorOpen}
              style={secondaryButtonStyle}
            >
              Columns
            </button>
          </Inline>
        </Inline>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Split
          direction="horizontal"
          primary={
            <Stack gap={0} style={{ height: "100%" }}>
              <BulkActionBar
                selectedCount={selectedCount}
                actions={BULK_ACTIONS}
                onAction={handleBulkAction}
                onClearSelection={() =>
                  selectionStore.setState({ selected: new Set() })
                }
              />
              <DataTable
                columns={columns}
                rows={STUB_ROWS}
                rowKey="id"
                virtualized
                stickyHeader
                onColumnConfigChange={setColumns}
                onRowAction={handleRowAction}
                density="default"
              />
            </Stack>
          }
          secondary={
            configuratorOpen ? (
              <div
                style={{
                  padding: "var(--space-16)",
                  borderLeft: "1px solid var(--color-border-subtle)",
                  height: "100%",
                  overflowY: "auto",
                }}
              >
                <ColumnConfigurator
                  columns={columns}
                  onChange={setColumns}
                  pinnableLeft={["id", "name"]}
                  pinnableRight={["status"]}
                />
              </div>
            ) : (
              <div />
            )
          }
          primaryFlex={1}
          secondarySize={configuratorOpen ? "300px" : "0px"}
        />
      </div>
    </div>
  );
}

// --- Small presentational helpers ---

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "var(--color-success)",
    "at-risk": "var(--color-warning)",
    churned: "var(--color-danger)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-4)",
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        color: colorMap[status] ?? "var(--color-text-secondary)",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "var(--radius-pill)",
          background: colorMap[status] ?? "var(--color-text-tertiary)",
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}

function RowCountBadge({ count }: { count: number }) {
  return (
    <span
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        background: "var(--color-surface-sunken)",
        borderRadius: "var(--radius-pill)",
        padding: "var(--space-4) var(--space-8)",
      }}
    >
      {count.toLocaleString()} rows
    </span>
  );
}

const secondaryButtonStyle: React.CSSProperties = {
  background: "var(--color-surface-raised)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-8) var(--space-12)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  color: "var(--color-text-primary)",
  cursor: "pointer",
};
