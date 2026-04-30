# Components — analytics-composer

Dashboard *builder*. Target user: analysts and operators composing dashboards
from data sources, not consuming pre-made dashboards. Drag-drop widget grid,
metric/filter composition, saved views.

## WidgetCanvas

**Usage** — The main composing surface. Drag widgets from a palette onto a
grid; resize; rearrange. Pairs with `WidgetPalette` (left) and `WidgetConfigPanel`
(right, appears on selection).

**Semantic purpose** — A 2D layout that persists as data. Widget positions
and sizes are saved state, not DOM state.

**Examples**

Correct:

```tsx
<WidgetCanvas
  layout={dashboardLayout}
  onLayoutChange={setLayout}
  widgets={widgets}
  gridColumns={12}
  rowHeight={48}
  renderWidget={(w) => <WidgetRenderer widget={w} />}
/>
```

Incorrect:

```tsx
<WidgetCanvas widgets={widgets} />
```

*Why wrong:* No layout persistence = users lose their work on reload. Layout
is the whole point of a composer.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `layout` | `Layout[]` | yes | — | x/y/w/h per widget |
| `onLayoutChange` | `(l: Layout[]) => void` | yes | — | Persist |
| `widgets` | `Widget[]` | yes | — | Widget config |
| `gridColumns` | `number` | no | `12` | Grid resolution |
| `rowHeight` | `number` | no | `48` | Row pixel height |
| `renderWidget` | `(w: Widget) => ReactNode` | yes | — | Widget renderer |

---

## MetricBuilder

**Usage** — Inside `WidgetConfigPanel` when a widget is a metric/chart. Lets
the user pick a source, an aggregation (sum, avg, count, p95), a breakdown
dimension, and a time window. Paired with `FilterComposer`.

**Semantic purpose** — A reusable definition of a metric. Saved metrics can
be referenced by multiple widgets and dashboards.

**Examples**

Correct:

```tsx
<MetricBuilder
  source={dataSources.orders}
  aggregation="sum"
  field="revenue"
  breakdown="product_category"
  timeWindow={{ preset: "last-30-days" }}
  onSave={saveMetric}
  previewData={samplePreview}
/>
```

Incorrect:

```tsx
<MetricBuilder
  formula="SELECT SUM(revenue) FROM orders WHERE ..."
/>
```

*Why wrong:* SQL as the UI makes the component inaccessible to non-technical
analysts. The builder's value is a typed, validated metric definition.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `source` | `DataSource` | yes | — | Table/collection |
| `aggregation` | `Aggregation` | yes | — | sum/avg/count/p95/… |
| `field` | `string` | yes | — | Field to aggregate |
| `breakdown` | `string \| null` | no | `null` | Group-by dimension |
| `timeWindow` | `TimeWindow` | yes | — | Preset or custom range |
| `onSave` | `(m: Metric) => void` | yes | — | Persist metric |
| `previewData` | `DataSample` | no | — | For live preview |

---

## FilterComposer

**Usage** — Dashboard-level or widget-level filter stack. Each filter: field
+ operator + value. Filters combine (AND by default) and are applied to all
filter-aware widgets on the dashboard.

**Semantic purpose** — Scope. Filters shrink the data every downstream widget
consumes, without rewriting each widget.

**Examples**

Correct:

```tsx
<FilterComposer
  filters={activeFilters}
  availableFields={schema.fields}
  onFiltersChange={setFilters}
  combineMode="and"
  saveableAs="preset"
/>
```

Incorrect:

```tsx
<FilterComposer filter={currentFilter} />
```

*Why wrong:* Singular filter = can't express "last 30 days AND US region AND
paid plan". Composition is the component's whole value.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `filters` | `Filter[]` | yes | — | Active filter stack |
| `availableFields` | `Field[]` | yes | — | Schema-driven options |
| `onFiltersChange` | `(f: Filter[]) => void` | yes | — | Setter |
| `combineMode` | `"and" \| "or"` | no | `"and"` | Logical combinator |
| `saveableAs` | `"preset" \| null` | no | `null` | Enables save-preset UI |

---

## SavedViewsDropdown

**Usage** — Top of the dashboard. Dropdown listing saved views (combinations
of filters + layout + timeRange). Switching a view rehydrates the composer
and canvas.

**Semantic purpose** — A view is a named, reusable dashboard state. Lets
analysts flip between "Executive weekly", "Sales Monday standup",
"Engineering incident review" without rebuilding.

**Examples**

Correct:

```tsx
<SavedViewsDropdown
  views={userSavedViews}
  activeViewId={activeView}
  onSelect={switchToView}
  onSaveCurrent={promptToSaveCurrent}
  onDelete={deleteView}
/>
```

Incorrect:

```tsx
<SavedViewsDropdown views={views} />
```

*Why wrong:* No save / delete affordances = read-only. The value of saved
views is the round-trip of save → switch → update.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `views` | `SavedView[]` | yes | — | User's views |
| `activeViewId` | `string \| null` | yes | — | Current |
| `onSelect` | `(id: string) => void` | yes | — | Switch |
| `onSaveCurrent` | `() => void` | yes | — | Save current state |
| `onDelete` | `(id: string) => void` | yes | — | Delete existing |

---

## ComparisonMode

**Usage** — Toggle in the dashboard header. Enables period-over-period
comparison: every metric widget displays current value, previous period, and
delta. Paired with `DeltaBadge` inside widgets.

**Semantic purpose** — Time comparison is a dashboard-level concern, not a
widget-level one. Toggling here applies to all comparison-aware widgets.

**Examples**

Correct:

```tsx
<ComparisonMode
  enabled={compareEnabled}
  basePeriod={currentPeriod}
  comparePeriod={previousPeriod}
  onToggle={setCompareEnabled}
  onPeriodChange={setComparePeriod}
/>
```

Incorrect:

```tsx
<ComparisonMode isOn onToggle={toggle} />
```

*Why wrong:* No period context = can't tell what's being compared to what.
The base/compare period pair is the core data.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `enabled` | `boolean` | yes | — | Toggle state |
| `basePeriod` | `Period` | yes | — | Current window |
| `comparePeriod` | `Period` | yes | — | Comparison window |
| `onToggle` | `(on: boolean) => void` | yes | — | Toggle handler |
| `onPeriodChange` | `(p: Period) => void` | yes | — | Compare period setter |

---

## Monetization patterns enforced

- **Advanced-mode toggles** — `ProFeatureCallout` on custom aggregations,
  on widget types gated by tier, on export formats
- **Data export / portability** — `ExportMenu` on every widget (PNG/CSV free,
  PDF/API paid), `ExportHistoryList` in settings
- **Usage-visible billing** — row-count meter next to data sources
- **Tier-aware empty states** — new dashboard empty state shows premium
  widget templates as teasers
