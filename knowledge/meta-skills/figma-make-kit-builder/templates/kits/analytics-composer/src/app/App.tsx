import { useState } from "react";
import { Stack, Inline, Split } from "@/lib/layout";
import { createStore } from "@/lib/store/createStore";
import { WidgetCanvas } from "../components/WidgetCanvas";
import { MetricBuilder } from "../components/MetricBuilder";
import { FilterComposer } from "../components/FilterComposer";
import { SavedViewsDropdown } from "../components/SavedViewsDropdown";
import { ComparisonMode } from "../components/ComparisonMode";
import type {
  Widget,
  Layout,
  Filter,
  SavedView,
  DataSource,
  Period,
  DataSample,
  Metric,
} from "../components/types";

// --- Stub data ---

const STUB_SOURCE: DataSource = {
  id: "src-orders",
  name: "Orders",
  fields: [
    { name: "revenue", label: "Revenue", type: "number" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "discount", label: "Discount", type: "number" },
    { name: "product_category", label: "Product category", type: "string" },
    { name: "region", label: "Region", type: "string" },
    { name: "channel", label: "Channel", type: "string" },
    { name: "created_at", label: "Order date", type: "date" },
  ],
};

const STUB_PREVIEW: DataSample = {
  value: 142_830,
  breakdown: [
    { label: "Electronics", value: 65_000 },
    { label: "Apparel", value: 42_000 },
    { label: "Home", value: 28_000 },
    { label: "Sports", value: 7_830 },
  ],
};

const STUB_WIDGETS: Widget[] = [
  {
    id: "w-1",
    type: "metric",
    title: "Total Revenue",
    metricId: "m-1",
    config: { value: 142_830, prefix: "$" },
  },
  {
    id: "w-2",
    type: "bar-chart",
    title: "Revenue by Category",
    config: { data: STUB_PREVIEW.breakdown },
  },
  {
    id: "w-3",
    type: "metric",
    title: "Orders Count",
    config: { value: 1_284 },
  },
  {
    id: "w-4",
    type: "line-chart",
    title: "Revenue Trend",
    config: {},
  },
  {
    id: "w-5",
    type: "metric",
    title: "Avg. Order Value",
    config: { value: 111.24, prefix: "$" },
  },
];

const STUB_LAYOUT: Layout[] = [
  { i: "w-1", x: 0, y: 0, w: 4, h: 2 },
  { i: "w-2", x: 4, y: 0, w: 8, h: 4 },
  { i: "w-3", x: 0, y: 2, w: 4, h: 2 },
  { i: "w-4", x: 0, y: 4, w: 8, h: 4 },
  { i: "w-5", x: 8, y: 4, w: 4, h: 4 },
];

const STUB_VIEWS: SavedView[] = [
  {
    id: "v-1",
    name: "Executive weekly",
    layout: STUB_LAYOUT,
    filters: [],
    timeWindow: { preset: "last-7-days" },
  },
  {
    id: "v-2",
    name: "Sales standup",
    layout: STUB_LAYOUT,
    filters: [
      { id: "f-1", field: "channel", operator: "eq", value: "direct" },
    ],
    timeWindow: { preset: "today" },
  },
];

const BASE_PERIOD: Period = {
  start: "2026-04-01",
  end: "2026-04-15",
  label: "Apr 1–15",
};
const COMPARE_PERIOD: Period = {
  start: "2026-03-01",
  end: "2026-03-15",
  label: "Mar 1–15",
};

// --- Dashboard store ---

type DashboardState = {
  layout: Layout[];
  widgets: Widget[];
  filters: Filter[];
  activeViewId: string | null;
  compareEnabled: boolean;
  comparePeriod: Period;
  configuredWidget: string | null;
};

const dashboardStore = createStore<DashboardState>({
  layout: STUB_LAYOUT,
  widgets: STUB_WIDGETS,
  filters: [],
  activeViewId: null,
  compareEnabled: false,
  comparePeriod: COMPARE_PERIOD,
  configuredWidget: null,
});

// --- App ---

export default function App() {
  const layout = dashboardStore.use((s) => s.layout);
  const widgets = dashboardStore.use((s) => s.widgets);
  const filters = dashboardStore.use((s) => s.filters);
  const activeViewId = dashboardStore.use((s) => s.activeViewId);
  const compareEnabled = dashboardStore.use((s) => s.compareEnabled);
  const comparePeriod = dashboardStore.use((s) => s.comparePeriod);
  const configuredWidget = dashboardStore.use((s) => s.configuredWidget);

  const [views, setViews] = useState<SavedView[]>(STUB_VIEWS);

  function handleSaveMetric(metric: Metric) {
    console.info("Saved metric:", metric);
  }

  function handleSaveView() {
    const name = prompt("View name:");
    if (!name) return;
    const newView: SavedView = {
      id: `v-${Date.now()}`,
      name,
      layout,
      filters,
      timeWindow: { preset: "last-30-days" },
      compareEnabled,
    };
    setViews((prev) => [...prev, newView]);
  }

  function handleSelectView(id: string) {
    const view = views.find((v) => v.id === id);
    if (!view) return;
    dashboardStore.setState({
      layout: view.layout,
      filters: view.filters,
      activeViewId: id,
    });
  }

  function handleDeleteView(id: string) {
    setViews((prev) => prev.filter((v) => v.id !== id));
    if (activeViewId === id) {
      dashboardStore.setState({ activeViewId: null });
    }
  }

  const configWidget =
    configuredWidget !== null
      ? widgets.find((w) => w.id === configuredWidget) ?? null
      : null;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-surface-base)",
      }}
    >
      {/* Dashboard header */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border-subtle)",
          padding: "var(--space-12) var(--space-24)",
        }}
      >
        <Inline gap={16} justify="between" align="center">
          {/* Left: view selector + filters */}
          <Inline gap={12} align="center" wrap={false}>
            <h1
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              Dashboard
            </h1>
            <SavedViewsDropdown
              views={views}
              activeViewId={activeViewId}
              onSelect={handleSelectView}
              onSaveCurrent={handleSaveView}
              onDelete={handleDeleteView}
            />
          </Inline>

          {/* Right: comparison mode + actions */}
          <Inline gap={8} align="center" wrap={false}>
            <ComparisonMode
              enabled={compareEnabled}
              basePeriod={BASE_PERIOD}
              comparePeriod={comparePeriod}
              onToggle={(on) => dashboardStore.setState({ compareEnabled: on })}
              onPeriodChange={(p) =>
                dashboardStore.setState({ comparePeriod: p })
              }
            />
          </Inline>
        </Inline>

        {/* Filter bar */}
        <div style={{ marginTop: "var(--space-12)" }}>
          <FilterComposer
            filters={filters}
            availableFields={STUB_SOURCE.fields}
            onFiltersChange={(f) => dashboardStore.setState({ filters: f })}
            combineMode="and"
            saveableAs="preset"
          />
        </div>
      </div>

      {/* Canvas + config panel */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Split
          direction="horizontal"
          primary={
            <div
              style={{ height: "100%", overflowY: "auto", padding: "var(--space-24)" }}
            >
              <WidgetCanvas
                layout={layout}
                onLayoutChange={(l) => dashboardStore.setState({ layout: l })}
                widgets={widgets}
                gridColumns={12}
                rowHeight={48}
                renderWidget={(w) => (
                  <WidgetRenderer widget={w} compareEnabled={compareEnabled} />
                )}
              />
            </div>
          }
          secondary={
            configWidget ? (
              <div
                style={{
                  height: "100%",
                  overflowY: "auto",
                  borderLeft: "1px solid var(--color-border-subtle)",
                }}
              >
                <Inline
                  gap={8}
                  align="center"
                  justify="between"
                  style={{
                    padding: "var(--space-12) var(--space-16)",
                    borderBottom: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Configure widget
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      dashboardStore.setState({ configuredWidget: null })
                    }
                    style={closeButtonStyle}
                    aria-label="Close config panel"
                  >
                    ×
                  </button>
                </Inline>
                <MetricBuilder
                  source={STUB_SOURCE}
                  aggregation="sum"
                  field="revenue"
                  timeWindow={{ preset: "last-30-days" }}
                  onSave={handleSaveMetric}
                  previewData={STUB_PREVIEW}
                />
              </div>
            ) : (
              <div />
            )
          }
          primaryFlex={1}
          secondarySize={configWidget ? "360px" : "0px"}
        />
      </div>
    </div>
  );
}

// --- Widget renderer (inline SVG previews, no chart lib) ---

type WidgetRendererProps = {
  widget: Widget;
  compareEnabled: boolean;
};

function WidgetRenderer({ widget, compareEnabled }: WidgetRendererProps) {
  switch (widget.type) {
    case "metric":
      return <MetricWidget widget={widget} compareEnabled={compareEnabled} />;
    case "bar-chart":
      return <BarChartWidget widget={widget} />;
    case "line-chart":
      return <LineChartWidget />;
    default:
      return (
        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            padding: "var(--space-16)",
          }}
        >
          {widget.type}
        </div>
      );
  }
}

function MetricWidget({
  widget,
  compareEnabled,
}: {
  widget: Widget;
  compareEnabled: boolean;
}) {
  const value = widget.config.value as number;
  const prefix = (widget.config.prefix as string) ?? "";
  // Stub delta: 7.4% up
  const delta = 7.4;
  return (
    <Stack gap={4}>
      <div
        style={{
          fontSize: "var(--text-3xl)",
          fontWeight: 700,
          color: "var(--color-text-primary)",
        }}
      >
        {prefix}
        {value.toLocaleString()}
      </div>
      {compareEnabled && (
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: delta >= 0 ? "var(--color-success)" : "var(--color-danger)",
          }}
        >
          {delta >= 0 ? "+" : ""}
          {delta}% vs prev period
        </span>
      )}
    </Stack>
  );
}

function BarChartWidget({ widget }: { widget: Widget }) {
  const data = (widget.config.data as Array<{
    label: string;
    value: number;
  }>) ?? [];
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const BAR_W = 28;
  const BAR_MAX_H = 80;
  const GAP = 8;
  const svgW = data.length * (BAR_W + GAP) - GAP;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgW} ${BAR_MAX_H + 24}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${widget.title} bar chart`}
      style={{ overflow: "visible" }}
    >
      {data.map((item, i) => {
        const h = (item.value / maxVal) * BAR_MAX_H;
        const x = i * (BAR_W + GAP);
        const y = BAR_MAX_H - h;
        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={h}
              rx={3}
              fill="var(--color-accent-default)"
              opacity={0.85}
            />
            <text
              x={x + BAR_W / 2}
              y={BAR_MAX_H + 16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-text-tertiary)"
            >
              {item.label.slice(0, 6)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChartWidget() {
  // Stub: 12 data points trending upward
  const points = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    y: 30 + Math.random() * 40 + i * 3,
  }));
  const W = 220;
  const H = 80;
  const maxY = Math.max(...points.map((p) => p.y));
  const minY = Math.min(...points.map((p) => p.y));
  const range = maxY - minY || 1;
  const scaleX = (i: number) => (i / (points.length - 1)) * W;
  const scaleY = (y: number) => H - ((y - minY) / range) * H;

  const d = points
    .map((p, i) =>
      i === 0
        ? `M ${scaleX(i)} ${scaleY(p.y)}`
        : `L ${scaleX(i)} ${scaleY(p.y)}`
    )
    .join(" ");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Revenue trend line chart"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--color-accent-default)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Styles ---

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "var(--text-xl)",
  color: "var(--color-text-tertiary)",
  padding: "0 var(--space-4)",
  lineHeight: 1,
};
