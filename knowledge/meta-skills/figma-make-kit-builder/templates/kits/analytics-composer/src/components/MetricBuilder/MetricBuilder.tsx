import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type {
  DataSource,
  Aggregation,
  TimeWindow,
  Metric,
  DataSample,
  TimePreset,
} from "../types";

type MetricBuilderProps = {
  source: DataSource;
  aggregation: Aggregation;
  field: string;
  breakdown?: string | null;
  timeWindow: TimeWindow;
  onSave: (m: Metric) => void;
  previewData?: DataSample;
};

const AGGREGATIONS: Aggregation[] = ["sum", "avg", "count", "p95", "p99", "min", "max"];

const TIME_PRESETS: TimePreset[] = [
  "today",
  "yesterday",
  "last-7-days",
  "last-30-days",
  "last-90-days",
  "this-month",
  "last-month",
  "this-quarter",
];

export function MetricBuilder({
  source,
  aggregation: initialAgg,
  field: initialField,
  breakdown: initialBreakdown = null,
  timeWindow: initialTimeWindow,
  onSave,
  previewData,
}: MetricBuilderProps) {
  const [aggregation, setAggregation] = useState<Aggregation>(initialAgg);
  const [field, setField] = useState<string>(initialField);
  const [breakdown, setBreakdown] = useState<string | null>(initialBreakdown);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(initialTimeWindow);
  const [name, setName] = useState<string>("");

  const numericFields = source.fields.filter(
    (f) => f.type === "number"
  );
  const dimensionFields = source.fields.filter(
    (f) => f.type === "string"
  );

  function handleSave() {
    if (!field || !name) return;
    onSave({
      id: `metric-${Date.now()}`,
      name,
      sourceId: source.id,
      aggregation,
      field,
      breakdown,
      timeWindow,
    });
  }

  const preset =
    timeWindow.preset !== "custom" ? timeWindow.preset : "custom";

  return (
    <Stack gap={16} style={{ padding: "var(--space-16)" }}>
      <span
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: 500,
          color: "var(--color-text-primary)",
        }}
      >
        Build metric
      </span>

      {/* Name */}
      <LabeledField label="Metric name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekly revenue"
          style={inputStyle}
          aria-label="Metric name"
        />
      </LabeledField>

      {/* Source (read-only display) */}
      <LabeledField label="Data source">
        <div style={readOnlyFieldStyle}>{source.name}</div>
      </LabeledField>

      {/* Aggregation */}
      <LabeledField label="Aggregation">
        <Inline gap={8} wrap>
          {AGGREGATIONS.map((agg) => (
            <button
              key={agg}
              type="button"
              onClick={() => setAggregation(agg)}
              aria-pressed={aggregation === agg}
              style={chipStyle(aggregation === agg)}
            >
              {agg}
            </button>
          ))}
        </Inline>
      </LabeledField>

      {/* Field */}
      <LabeledField label="Field to aggregate">
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          style={inputStyle}
          aria-label="Field to aggregate"
        >
          {numericFields.map((f) => (
            <option key={f.name} value={f.name}>
              {f.label}
            </option>
          ))}
        </select>
      </LabeledField>

      {/* Breakdown */}
      <LabeledField label="Breakdown dimension (optional)">
        <select
          value={breakdown ?? ""}
          onChange={(e) =>
            setBreakdown(e.target.value === "" ? null : e.target.value)
          }
          style={inputStyle}
          aria-label="Breakdown dimension"
        >
          <option value="">None</option>
          {dimensionFields.map((f) => (
            <option key={f.name} value={f.name}>
              {f.label}
            </option>
          ))}
        </select>
      </LabeledField>

      {/* Time window */}
      <LabeledField label="Time window">
        <Inline gap={8} wrap>
          {TIME_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTimeWindow({ preset: p })}
              aria-pressed={preset === p}
              style={chipStyle(preset === p)}
            >
              {p}
            </button>
          ))}
        </Inline>
      </LabeledField>

      {/* Preview */}
      {previewData && (
        <MetricPreview data={previewData} />
      )}

      {/* Save */}
      <Inline gap={8} justify="end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!field || !name}
          style={{
            ...primaryButtonStyle,
            opacity: !field || !name ? 0.5 : 1,
            cursor: !field || !name ? "not-allowed" : "pointer",
          }}
        >
          Save metric
        </button>
      </Inline>
    </Stack>
  );
}

// --- Sub-components ---

function LabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap={8}>
      <label
        style={{
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </label>
      {children}
    </Stack>
  );
}

function MetricPreview({ data }: { data: DataSample }) {
  const maxVal = data.breakdown
    ? Math.max(...data.breakdown.map((b) => b.value))
    : data.value;

  return (
    <div
      style={{
        background: "var(--color-surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-16)",
      }}
    >
      <div
        style={{
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: "var(--color-text-tertiary)",
          textTransform: "uppercase",
          marginBottom: "var(--space-8)",
        }}
      >
        Preview
      </div>
      <div
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: "var(--space-8)",
        }}
      >
        {data.value.toLocaleString()}
      </div>

      {/* Inline SVG bar chart for breakdown */}
      {data.breakdown && (
        <MiniBarChart items={data.breakdown} maxVal={maxVal} />
      )}
    </div>
  );
}

function MiniBarChart({
  items,
  maxVal,
}: {
  items: Array<{ label: string; value: number }>;
  maxVal: number;
}) {
  const BAR_WIDTH = 20;
  const BAR_MAX_HEIGHT = 60;
  const GAP = 4;
  const total = items.length;
  const svgWidth = total * (BAR_WIDTH + GAP) - GAP;

  return (
    <svg
      width={svgWidth}
      height={BAR_MAX_HEIGHT + 20}
      role="img"
      aria-label="Metric breakdown preview"
      style={{ overflow: "visible" }}
    >
      {items.map((item, i) => {
        const barHeight = maxVal > 0 ? (item.value / maxVal) * BAR_MAX_HEIGHT : 0;
        const x = i * (BAR_WIDTH + GAP);
        const y = BAR_MAX_HEIGHT - barHeight;
        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={barHeight}
              rx={2}
              fill="var(--color-accent-default)"
              opacity={0.8}
            />
          </g>
        );
      })}
    </svg>
  );
}

// --- Styles ---

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: "var(--text-sm)",
  color: "var(--color-text-primary)",
  background: "var(--color-surface-base)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-8) var(--space-12)",
  outline: "none",
  fontFamily: "var(--font-sans)",
};

const readOnlyFieldStyle: React.CSSProperties = {
  fontSize: "var(--text-sm)",
  color: "var(--color-text-secondary)",
  background: "var(--color-surface-sunken)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-8) var(--space-12)",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "var(--color-accent-default)",
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-8) var(--space-24)",
  color: "var(--color-text-inverted)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? "var(--color-accent-default)" : "var(--color-surface-raised)",
    border: `1px solid ${active ? "var(--color-accent-default)" : "var(--color-border-default)"}`,
    borderRadius: "var(--radius-pill)",
    padding: "var(--space-4) var(--space-12)",
    fontSize: "var(--text-xs)",
    fontWeight: active ? 600 : 400,
    color: active ? "var(--color-text-inverted)" : "var(--color-text-primary)",
    cursor: "pointer",
    transition: `background var(--motion-fast)`,
  };
}
