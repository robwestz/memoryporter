import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { ColumnConfig, ColumnPin } from "../types";

type ColumnConfiguratorProps = {
  columns: ColumnConfig[];
  onChange: (c: ColumnConfig[]) => void;
  pinnableLeft?: string[];
  pinnableRight?: string[];
  maxVisible?: number | null;
};

export function ColumnConfigurator({
  columns,
  onChange,
  pinnableLeft = [],
  pinnableRight = [],
  maxVisible = null,
}: ColumnConfiguratorProps) {
  const [draft, setDraft] = useState<ColumnConfig[]>(columns);

  const visibleCount = draft.filter((c) => !c.hidden).length;

  function toggleHidden(field: string) {
    const next = draft.map((c) => {
      if (c.field !== field) return c;
      const wouldShow = c.hidden;
      if (wouldShow && maxVisible !== null && visibleCount >= maxVisible) {
        return c; // cap reached — no-op
      }
      return { ...c, hidden: !c.hidden };
    });
    setDraft(next);
    onChange(next);
  }

  function setPin(field: string, pin: ColumnPin) {
    const next = draft.map((c) =>
      c.field === field ? { ...c, pin } : c
    );
    setDraft(next);
    onChange(next);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...draft];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setDraft(next);
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === draft.length - 1) return;
    const next = [...draft];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setDraft(next);
    onChange(next);
  }

  return (
    <div
      role="dialog"
      aria-label="Configure columns"
      style={{
        background: "var(--color-surface-overlay)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--elev-2)",
        padding: "var(--space-16)",
        minWidth: "280px",
        maxHeight: "480px",
        overflowY: "auto",
      }}
    >
      <Stack gap={4}>
        <Inline justify="between" style={{ marginBottom: "var(--space-8)" }}>
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Columns
          </span>
          {maxVisible !== null && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
              }}
            >
              {visibleCount}/{maxVisible} visible
            </span>
          )}
        </Inline>

        {draft.map((col, i) => (
          <ColumnRow
            key={col.field}
            col={col}
            index={i}
            total={draft.length}
            pinnableLeft={pinnableLeft}
            pinnableRight={pinnableRight}
            onToggleHidden={() => toggleHidden(col.field)}
            onSetPin={(pin) => setPin(col.field, pin)}
            onMoveUp={() => moveUp(i)}
            onMoveDown={() => moveDown(i)}
          />
        ))}
      </Stack>
    </div>
  );
}

// --- Sub-component ---

type ColumnRowProps = {
  col: ColumnConfig;
  index: number;
  total: number;
  pinnableLeft: string[];
  pinnableRight: string[];
  onToggleHidden: () => void;
  onSetPin: (pin: ColumnPin) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function ColumnRow({
  col,
  index,
  total,
  pinnableLeft,
  pinnableRight,
  onToggleHidden,
  onSetPin,
  onMoveUp,
  onMoveDown,
}: ColumnRowProps) {
  const canPinLeft = pinnableLeft.includes(col.field);
  const canPinRight = pinnableRight.includes(col.field);

  return (
    <Inline
      gap={8}
      align="center"
      style={{
        padding: "var(--space-8) var(--space-4)",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface-base)",
      }}
    >
      {/* Visibility toggle */}
      <button
        type="button"
        aria-label={col.hidden ? `Show ${col.label}` : `Hide ${col.label}`}
        onClick={onToggleHidden}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "var(--space-4)",
          color: col.hidden
            ? "var(--color-text-tertiary)"
            : "var(--color-accent-default)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {col.hidden ? <EyeOffIcon /> : <EyeIcon />}
      </button>

      {/* Label */}
      <span
        style={{
          flex: 1,
          fontSize: "var(--text-sm)",
          color: col.hidden
            ? "var(--color-text-tertiary)"
            : "var(--color-text-primary)",
        }}
      >
        {col.label}
      </span>

      {/* Pin buttons */}
      {canPinLeft && (
        <button
          type="button"
          aria-label="Pin left"
          aria-pressed={col.pin === "left"}
          onClick={() => onSetPin(col.pin === "left" ? null : "left")}
          style={pinButtonStyle(col.pin === "left")}
        >
          ←
        </button>
      )}
      {canPinRight && (
        <button
          type="button"
          aria-label="Pin right"
          aria-pressed={col.pin === "right"}
          onClick={() => onSetPin(col.pin === "right" ? null : "right")}
          style={pinButtonStyle(col.pin === "right")}
        >
          →
        </button>
      )}

      {/* Reorder */}
      <button
        type="button"
        aria-label="Move up"
        disabled={index === 0}
        onClick={onMoveUp}
        style={reorderButtonStyle(index === 0)}
      >
        ↑
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={index === total - 1}
        onClick={onMoveDown}
        style={reorderButtonStyle(index === total - 1)}
      >
        ↓
      </button>
    </Inline>
  );
}

function pinButtonStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? "var(--color-accent-subtle)" : "none",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    padding: "var(--space-4)",
    fontSize: "var(--text-xs)",
    color: active
      ? "var(--color-accent-default)"
      : "var(--color-text-secondary)",
  };
}

function reorderButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    color: disabled
      ? "var(--color-text-tertiary)"
      : "var(--color-text-secondary)",
    padding: "var(--space-4)",
    fontSize: "var(--text-xs)",
  };
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M1 7c1.5-3 3.5-4.5 6-4.5S11.5 4 13 7c-1.5 3-3.5 4.5-6 4.5S2.5 10 1 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 2l10 10M1 7c1.5-3 3.5-4.5 6-4.5m5 .5C13.5 4.8 13 7 13 7c-.5 1-1.2 2-2.2 2.8"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
