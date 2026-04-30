// Domain types for analytics-composer

export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "not_contains"
  | "is_empty"
  | "is_not_empty";

export type Filter = {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
};

export type WidgetType =
  | "metric"
  | "bar-chart"
  | "line-chart"
  | "table"
  | "pie-chart"
  | "text";

export type Layout = {
  /** Must match widget.id */
  i: string;
  /** Grid column start (0-indexed) */
  x: number;
  /** Grid row start (0-indexed) */
  y: number;
  /** Width in grid columns */
  w: number;
  /** Height in grid rows */
  h: number;
};

export type Widget = {
  id: string;
  type: WidgetType;
  title: string;
  metricId?: string;
  /** Raw config blob — interpreted by widget renderer */
  config: Record<string, unknown>;
};

export type DataSource = {
  id: string;
  name: string;
  /** Available fields */
  fields: Field[];
};

export type Field = {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "boolean";
};

export type Aggregation = "sum" | "avg" | "count" | "p95" | "p99" | "min" | "max";

export type TimePreset =
  | "today"
  | "yesterday"
  | "last-7-days"
  | "last-30-days"
  | "last-90-days"
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "custom";

export type TimeWindow =
  | { preset: TimePreset }
  | { preset: "custom"; start: string; end: string };

export type DataSample = {
  /** Total / aggregated value */
  value: number;
  /** Optional breakdown rows */
  breakdown?: Array<{ label: string; value: number }>;
};

export type Metric = {
  id: string;
  name: string;
  sourceId: string;
  aggregation: Aggregation;
  field: string;
  breakdown: string | null;
  timeWindow: TimeWindow;
};

export type Period = {
  start: string;
  end: string;
  label: string;
};

export type SavedView = {
  id: string;
  name: string;
  layout: Layout[];
  filters: Filter[];
  timeWindow: TimeWindow;
  compareEnabled?: boolean;
};
