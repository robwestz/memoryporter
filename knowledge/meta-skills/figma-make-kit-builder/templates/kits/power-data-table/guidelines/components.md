# Components — power-data-table

The power-user table primitive. Virtualized rows, inline editing, column
configuration, saved filter sets, bulk actions. Target user: operators
spending hours in tables — ops, finance, support, sales, analysts. This kit's
components are **deliberately designed to be cut and reused** — they show up
in marketplace-console, cms-admin-shell, workflow-builder as shared primitives.

## DataTable

**Usage** — The root table. Virtualized rendering, column config persistence,
sticky headers, keyboard navigation. Composes with `ColumnConfigurator`,
`InlineCellEditor`, `BulkActionBar`, `SavedFilterSets`.

**Semantic purpose** — A tabular view of homogeneous records where the user
configures what they see and operates on rows in bulk.

**Examples**

Correct:

```tsx
<DataTable
  columns={columnConfig}
  rows={rows}
  rowKey="id"
  virtualized
  stickyHeader
  onColumnConfigChange={persistColumnConfig}
  onRowAction={handleRowAction}
  density="default"
/>
```

Incorrect:

```tsx
<DataTable columns={columns} rows={rows} />
```

*Why wrong:* Missing `rowKey` breaks reconciliation; missing virtualization
breaks at 10k+ rows; missing column persistence means users reconfigure every
session. Defaults matter here.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `ColumnConfig[]` | yes | — | Ordered column defs |
| `rows` | `Row[]` | yes | — | Data |
| `rowKey` | `string` | yes | — | Unique field for React key + reconcile |
| `virtualized` | `boolean` | no | `true` | Enable virtualization |
| `stickyHeader` | `boolean` | no | `true` | Header stays visible |
| `onColumnConfigChange` | `(c: ColumnConfig[]) => void` | no | — | Persist user config |
| `onRowAction` | `(a: RowAction) => void` | no | — | Per-row action handler |
| `density` | `"compact" \| "default" \| "comfortable"` | no | `"default"` | Row height |

---

## ColumnConfigurator

**Usage** — Popover opened from the column-chevron menu in the header. Lets
the user toggle column visibility, reorder, set widths, pin left/right. Saves
as the user's preference for this table.

**Semantic purpose** — Per-user column layout. Not transient; persisted to
the user's preferences so next visit shows their config.

**Examples**

Correct:

```tsx
<ColumnConfigurator
  columns={columns}
  onChange={persistColumnConfig}
  pinnableLeft={["id", "status"]}
  pinnableRight={["actions"]}
  maxVisible={null}
/>
```

Incorrect:

```tsx
<ColumnConfigurator onToggle={toggleColumn} />
```

*Why wrong:* Single-column toggle = no reorder, no pin, no width. Power users
expect full control here, not just show/hide.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `ColumnConfig[]` | yes | — | Current order + visibility |
| `onChange` | `(c: ColumnConfig[]) => void` | yes | — | Persist |
| `pinnableLeft` | `string[]` | no | `[]` | Fields allowed as left-pinned |
| `pinnableRight` | `string[]` | no | `[]` | Fields allowed as right-pinned |
| `maxVisible` | `number \| null` | no | `null` | Cap visible columns |

---

## InlineCellEditor

**Usage** — Activated on double-click (or Enter) in editable cells. Takes a
cell value, validates on change, commits on Enter or blur, rolls back on Esc.
Supports typed editors (text, number, select, date, currency).

**Semantic purpose** — Editing without a modal. For high-volume power users,
double-click → type → Enter is 10x faster than click → modal → field → save.

**Examples**

Correct:

```tsx
<InlineCellEditor
  value={row.price}
  field={{ type: "currency", currency: "USD", min: 0 }}
  onCommit={(v) => updateRow({ price: v })}
  onCancel={closeEditor}
  validateOnChange
/>
```

Incorrect:

```tsx
<InlineCellEditor value={value} onChange={onChange} />
```

*Why wrong:* No type = wrong keyboard, no validation, no currency formatting.
The typed editor is what makes inline editing safe at scale.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `unknown` | yes | — | Initial cell value |
| `field` | `FieldSpec` | yes | — | Typed editor config |
| `onCommit` | `(v: unknown) => void` | yes | — | On Enter/blur |
| `onCancel` | `() => void` | yes | — | On Esc |
| `validateOnChange` | `boolean` | no | `false` | Inline validation feedback |

---

## BulkActionBar

**Usage** — Sticky bar above the table that appears when rows are selected.
Shows count and available actions. Disabled actions show why (tooltip).

**Semantic purpose** — Multi-row operations as a first-class feature. Not a
checkbox footnote; the primary mode for ops tables.

**Examples**

Correct:

```tsx
<BulkActionBar
  selectedCount={selected.size}
  actions={[
    { id: "archive", label: "Archive", icon: ArchiveIcon },
    { id: "assign", label: "Assign to…", icon: UserIcon },
    { id: "export", label: "Export", icon: DownloadIcon, requiresPlan: "pro" }
  ]}
  onAction={handleBulk}
  onClearSelection={clearSelection}
/>
```

Incorrect:

```tsx
<BulkActionBar onAction={handleBulk} />
```

*Why wrong:* No selection count = user doesn't know what they're operating
on. Confirmations later won't surface that.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `selectedCount` | `number` | yes | — | For "Archive 47 rows" |
| `actions` | `BulkAction[]` | yes | — | Available operations |
| `onAction` | `(id: string) => void` | yes | — | Handler |
| `onClearSelection` | `() => void` | yes | — | Deselect all |

---

## SavedFilterSets

**Usage** — Dropdown near the filter composer. Saves a filter combination
under a name; switching loads it; team sets are shared across the workspace.
Pairs with `FilterComposer` (shared with analytics-composer).

**Semantic purpose** — Filters as reusable presets. Lets users jump to "My
open tickets", "Last week's signups", "Disputed orders" without re-composing.

**Examples**

Correct:

```tsx
<SavedFilterSets
  sets={userSets}
  teamSets={teamSets}
  activeSetId={activeSet}
  onApply={applyFilterSet}
  onSaveCurrent={promptToSaveCurrent}
  onShare={shareToTeam}
/>
```

Incorrect:

```tsx
<SavedFilterSets sets={allSets} />
```

*Why wrong:* No split between personal and team sets = noisy, shared clutter.
Power users need their own namespace.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `sets` | `FilterSet[]` | yes | — | User's personal sets |
| `teamSets` | `FilterSet[]` | yes | — | Team-shared sets |
| `activeSetId` | `string \| null` | yes | — | Current |
| `onApply` | `(id: string) => void` | yes | — | Load set |
| `onSaveCurrent` | `() => void` | yes | — | Save current filters |
| `onShare` | `(id: string) => void` | yes | — | Promote to team |

---

## Monetization patterns enforced

- **Data export / portability** — `ExportMenu` on every table; CSV free,
  Excel/API paid
- **Advanced-mode toggles** — `GatedToggle` on bulk-export > 10k rows,
  on team-shared filter sets, on custom cell types
- **Usage-visible billing** — row count meter per table (rows stored in
  collection) visible when approaching limit
- **Tier-aware empty states** — empty table state promotes saved-view feature
  as a premium teaser
