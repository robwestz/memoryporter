import { Inline } from "@/lib/layout";
import type { Field } from "../types";

const reorderBtnStyle: React.CSSProperties = {
  fontSize: "var(--text-sm)",
  padding: "var(--space-4) var(--space-8)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-surface-base)",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
};

export type FieldRowProps = {
  field: Field;
  index: number;
  total: number;
  onReorder: (from: number, to: number) => void;
  readonly: boolean;
};

export function FieldRow({ field, index, total, onReorder, readonly }: FieldRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-12)",
        padding: "var(--space-12) var(--space-16)",
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <span
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-tertiary)",
          fontFamily: "var(--font-mono)",
          minWidth: "var(--space-16)",
          textAlign: "center",
        }}
      >
        {index + 1}
      </span>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>
          {field.name}
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "var(--space-4)" }}>
          {field.type}
          {field.required && (
            <span style={{ marginLeft: "var(--space-8)", color: "var(--color-danger)" }}>required</span>
          )}
          {field.localized && (
            <span style={{ marginLeft: "var(--space-8)", color: "var(--color-info)" }}>localized</span>
          )}
        </div>
      </div>

      {!readonly && (
        <Inline gap={4} align="center">
          <button disabled={index === 0} onClick={() => onReorder(index, index - 1)} style={reorderBtnStyle} aria-label="Move up">↑</button>
          <button disabled={index === total - 1} onClick={() => onReorder(index, index + 1)} style={reorderBtnStyle} aria-label="Move down">↓</button>
        </Inline>
      )}
    </div>
  );
}
