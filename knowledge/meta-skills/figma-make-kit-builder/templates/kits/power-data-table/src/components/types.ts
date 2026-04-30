// Domain types for power-data-table
// Generic Row: use DataTable<MyRow> for full type safety.

export type Row = Record<string, unknown>;

export type ColumnPin = "left" | "right" | null;

export type ColumnConfig = {
  /** Field key — must match Row property */
  field: string;
  /** Display label */
  label: string;
  /** px width — undefined = auto */
  width?: number;
  /** Hidden from view but still in config */
  hidden?: boolean;
  /** Left or right pin */
  pin?: ColumnPin;
  /** Render override — defaults to string coercion */
  renderCell?: (value: unknown, row: Row) => React.ReactNode;
  /** Allow inline editing */
  editable?: boolean;
  /** Typed editor for InlineCellEditor */
  fieldSpec?: FieldSpec;
};

export type FieldType = "text" | "number" | "currency" | "date" | "select";

export type FieldSpec =
  | { type: "text"; maxLength?: number }
  | { type: "number"; min?: number; max?: number; step?: number }
  | { type: "currency"; currency: string; min?: number; max?: number }
  | { type: "date"; min?: string; max?: string }
  | { type: "select"; options: Array<{ value: string; label: string }> };

export type RowAction = {
  /** Row key value */
  rowKey: string;
  /** Action identifier */
  action: string;
};

export type TableDensity = "compact" | "default" | "comfortable";

export type BulkAction = {
  id: string;
  label: string;
  /** SVG icon component */
  icon?: React.ComponentType<{ size?: number }>;
  /** If set, action is gated — shows upgrade prompt */
  requiresPlan?: "pro" | "enterprise";
  /** Disable reason shown in tooltip */
  disabledReason?: string;
};

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

export type FilterSet = {
  id: string;
  name: string;
  filters: Filter[];
  /** undefined = personal, otherwise team id */
  teamId?: string;
};
