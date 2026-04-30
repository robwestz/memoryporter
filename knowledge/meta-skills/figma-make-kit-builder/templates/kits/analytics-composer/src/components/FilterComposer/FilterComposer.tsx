import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { Filter, FilterOperator, Field } from "../types";

type FilterComposerProps = {
  filters: Filter[];
  availableFields: Field[];
  onFiltersChange: (f: Filter[]) => void;
  combineMode?: "and" | "or";
  saveableAs?: "preset" | null;
};

const OPERATORS: Array<{ value: FilterOperator; label: string }> = [
  { value: "eq", label: "is" },
  { value: "neq", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "gte", label: ">=" },
  { value: "lte", label: "<=" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

export function FilterComposer({
  filters,
  availableFields,
  onFiltersChange,
  combineMode = "and",
  saveableAs = null,
}: FilterComposerProps) {
  const [savePrompt, setSavePrompt] = useState(false);
  const [presetName, setPresetName] = useState("");

  function addFilter() {
    const first = availableFields[0];
    if (!first) return;
    const newFilter: Filter = {
      id: `f-${Date.now()}`,
      field: first.name,
      operator: "eq",
      value: "",
    };
    onFiltersChange([...filters, newFilter]);
  }

  function updateFilter(id: string, patch: Partial<Filter>) {
    onFiltersChange(
      filters.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  }

  function removeFilter(id: string) {
    onFiltersChange(filters.filter((f) => f.id !== id));
  }

  return (
    <Stack gap={8}>
      {/* Header */}
      <Inline gap={8} align="center" justify="between">
        <Inline gap={8} align="center">
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Filters
          </span>
          {filters.length > 1 && (
            <CombineModeToggle mode={combineMode} />
          )}
        </Inline>
        <Inline gap={8}>
          {saveableAs === "preset" && filters.length > 0 && (
            <button
              type="button"
              onClick={() => setSavePrompt(true)}
              style={ghostButtonStyle}
            >
              Save as preset
            </button>
          )}
          <button
            type="button"
            onClick={addFilter}
            style={ghostButtonStyle}
          >
            + Add filter
          </button>
        </Inline>
      </Inline>

      {/* Filter rows */}
      {filters.length === 0 && (
        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-tertiary)",
            padding: "var(--space-8) 0",
          }}
        >
          No filters — all data shown.
        </div>
      )}

      <Stack gap={8}>
        {filters.map((filter, idx) => (
          <FilterRow
            key={filter.id}
            filter={filter}
            availableFields={availableFields}
            combineMode={combineMode}
            isFirst={idx === 0}
            onChange={(patch) => updateFilter(filter.id, patch)}
            onRemove={() => removeFilter(filter.id)}
          />
        ))}
      </Stack>

      {/* Save preset prompt */}
      {savePrompt && (
        <div
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-12)",
          }}
        >
          <Inline gap={8} align="center">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name…"
              autoFocus
              style={{ ...inputStyle, flex: 1 }}
              aria-label="Filter preset name"
            />
            <button
              type="button"
              disabled={!presetName}
              onClick={() => {
                // Parent handles the actual save via onFiltersChange pattern
                // In production: emit a save-preset event
                console.info("Save preset:", presetName, filters);
                setSavePrompt(false);
                setPresetName("");
              }}
              style={{
                ...primaryChipStyle,
                opacity: !presetName ? 0.5 : 1,
                cursor: !presetName ? "not-allowed" : "pointer",
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setSavePrompt(false)}
              style={ghostButtonStyle}
            >
              Cancel
            </button>
          </Inline>
        </div>
      )}
    </Stack>
  );
}

// --- Sub-components ---

function CombineModeToggle({ mode }: { mode: "and" | "or" }) {
  return (
    <span
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--color-accent-default)",
        background: "var(--color-accent-subtle)",
        borderRadius: "var(--radius-pill)",
        padding: "var(--space-4) var(--space-8)",
        textTransform: "uppercase",
      }}
    >
      {mode}
    </span>
  );
}

type FilterRowProps = {
  filter: Filter;
  availableFields: Field[];
  combineMode: "and" | "or";
  isFirst: boolean;
  onChange: (patch: Partial<Filter>) => void;
  onRemove: () => void;
};

function FilterRow({
  filter,
  availableFields,
  combineMode,
  isFirst,
  onChange,
  onRemove,
}: FilterRowProps) {
  const noValue =
    filter.operator === "is_empty" || filter.operator === "is_not_empty";

  return (
    <Inline gap={8} align="center">
      {/* Combinator label */}
      <div
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-tertiary)",
          width: "28px",
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {isFirst ? "where" : combineMode}
      </div>

      {/* Field */}
      <select
        value={filter.field}
        onChange={(e) => onChange({ field: e.target.value })}
        style={{ ...inputStyle, flex: 1 }}
        aria-label="Filter field"
      >
        {availableFields.map((f) => (
          <option key={f.name} value={f.name}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Operator */}
      <select
        value={filter.operator}
        onChange={(e) =>
          onChange({ operator: e.target.value as FilterOperator })
        }
        style={{ ...inputStyle, flex: "0 0 140px" }}
        aria-label="Filter operator"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Value */}
      {!noValue && (
        <input
          type="text"
          value={String(filter.value ?? "")}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="Value…"
          style={{ ...inputStyle, flex: 1 }}
          aria-label="Filter value"
        />
      )}

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove filter"
        style={removeButtonStyle}
      >
        ×
      </button>
    </Inline>
  );
}

// --- Styles ---

const inputStyle: React.CSSProperties = {
  fontSize: "var(--text-sm)",
  color: "var(--color-text-primary)",
  background: "var(--color-surface-base)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-8) var(--space-8)",
  outline: "none",
  fontFamily: "var(--font-sans)",
};

const ghostButtonStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-4) var(--space-12)",
  fontSize: "var(--text-sm)",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
};

const primaryChipStyle: React.CSSProperties = {
  background: "var(--color-accent-default)",
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-8) var(--space-16)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  color: "var(--color-text-inverted)",
};

const removeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "var(--text-lg)",
  color: "var(--color-text-tertiary)",
  padding: "0 var(--space-4)",
  lineHeight: 1,
  flexShrink: 0,
};
