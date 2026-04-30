import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { Period } from "../types";

type ComparePresetMenuProps = {
  presets: Array<{ label: string; offset: number }>;
  onSelect: (offset: number) => void;
  onClose: () => void;
  basePeriod: Period;
  currentCompare: Period;
  onCustomChange: (p: Period) => void;
};

export function ComparePresetMenu({
  presets,
  onSelect,
  onClose,
  currentCompare,
  onCustomChange,
}: ComparePresetMenuProps) {
  const [customStart, setCustomStart] = useState(currentCompare.start);
  const [customEnd, setCustomEnd] = useState(currentCompare.end);

  return (
    <div
      role="listbox"
      aria-label="Comparison period presets"
      style={{
        position: "absolute",
        top: "calc(100% + var(--space-4))",
        left: 0,
        zIndex: "var(--z-dropdown)",
        background: "var(--color-surface-overlay)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--elev-2)",
        minWidth: "240px",
        padding: "var(--space-8)",
      }}
    >
      <Stack gap={4}>
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            role="option"
            onClick={() => {
              onSelect(preset.offset);
              onClose();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "var(--space-8) var(--space-12)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-primary)",
              textAlign: "left",
              borderRadius: "var(--radius-sm)",
              width: "100%",
            }}
          >
            {preset.label}
          </button>
        ))}

        <div
          style={{
            borderTop: "1px solid var(--color-border-subtle)",
            paddingTop: "var(--space-8)",
            marginTop: "var(--space-4)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--color-text-tertiary)",
              marginBottom: "var(--space-8)",
            }}
          >
            Custom range
          </div>
          <Inline gap={8} align="center">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              style={dateInputStyle}
              aria-label="Comparison start"
            />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
              to
            </span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              style={dateInputStyle}
              aria-label="Comparison end"
            />
          </Inline>
          <button
            type="button"
            onClick={() => {
              onCustomChange({
                start: customStart,
                end: customEnd,
                label: "Custom comparison",
              });
              onClose();
            }}
            disabled={!customStart || !customEnd}
            style={{ ...applyButtonStyle, marginTop: "var(--space-8)" }}
          >
            Apply
          </button>
        </div>
      </Stack>
    </div>
  );
}

const dateInputStyle: React.CSSProperties = {
  fontSize: "var(--text-xs)",
  color: "var(--color-text-primary)",
  background: "var(--color-surface-base)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-4) var(--space-8)",
  fontFamily: "var(--font-sans)",
  flex: 1,
  minWidth: 0,
};

const applyButtonStyle: React.CSSProperties = {
  background: "var(--color-accent-default)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-4) var(--space-12)",
  fontSize: "var(--text-xs)",
  fontWeight: 500,
  color: "var(--color-text-inverted)",
  cursor: "pointer",
  width: "100%",
};
