import { useState } from "react";
import { Inline } from "@/lib/layout";

export type SchedulePickerProps = {
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

export function SchedulePicker({ onConfirm, onCancel }: SchedulePickerProps) {
  const [value, setValue] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });

  return (
    <div style={{ position: "absolute", bottom: "calc(100% + var(--space-8))", right: 0, background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-xl)", boxShadow: "var(--elev-3)", padding: "var(--space-16)", zIndex: "var(--z-dropdown)", minWidth: "260px" }}>
      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-12)", color: "var(--color-text-primary)" }}>
        Schedule publish
      </div>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: "100%", padding: "var(--space-8) var(--space-12)", fontSize: "var(--text-sm)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", marginBottom: "var(--space-12)", boxSizing: "border-box" }}
      />
      <Inline gap={8} justify="end">
        <button onClick={onCancel} style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={() => onConfirm(new Date(value))} style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 500, border: "none", borderRadius: "var(--radius-md)", background: "var(--color-accent-default)", color: "var(--color-text-inverted)", cursor: "pointer" }}>
          Confirm
        </button>
      </Inline>
    </div>
  );
}
