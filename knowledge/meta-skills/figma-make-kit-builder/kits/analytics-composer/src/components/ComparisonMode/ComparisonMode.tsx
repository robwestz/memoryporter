import { useState } from "react";
import { Inline } from "@/lib/layout";
import { ComparePresetMenu } from "./ComparePresetMenu";
import type { Period } from "../types";

type ComparisonModeProps = {
  enabled: boolean;
  basePeriod: Period;
  comparePeriod: Period;
  onToggle: (on: boolean) => void;
  onPeriodChange: (p: Period) => void;
};

const COMPARE_PRESETS: Array<{ label: string; offset: number }> = [
  { label: "Previous period", offset: -1 },
  { label: "Same period last month", offset: -30 },
  { label: "Same period last quarter", offset: -90 },
  { label: "Same period last year", offset: -365 },
];

export function ComparisonMode({
  enabled,
  basePeriod,
  comparePeriod,
  onToggle,
  onPeriodChange,
}: ComparisonModeProps) {
  const [presetOpen, setPresetOpen] = useState(false);

  function applyPreset(offsetDays: number) {
    const baseStart = new Date(basePeriod.start);
    const baseEnd = new Date(basePeriod.end);
    const baseRangeDays =
      (baseEnd.getTime() - baseStart.getTime()) / (1000 * 60 * 60 * 24);

    const compareEnd = new Date(baseStart);
    compareEnd.setDate(compareEnd.getDate() + offsetDays);
    const compareStart = new Date(compareEnd);
    compareStart.setDate(compareStart.getDate() - baseRangeDays);

    onPeriodChange({
      start: compareStart.toISOString().slice(0, 10),
      end: compareEnd.toISOString().slice(0, 10),
      label: "Custom comparison",
    });
    setPresetOpen(false);
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-8)",
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4) var(--space-12)",
      }}
    >
      {/* Toggle */}
      <Inline gap={8} align="center">
        <ToggleSwitch
          on={enabled}
          onToggle={onToggle}
          label="Compare periods"
        />
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: enabled
              ? "var(--color-text-primary)"
              : "var(--color-text-tertiary)",
          }}
        >
          Compare
        </span>
      </Inline>

      {/* Period info + controls (only when enabled) */}
      {enabled && (
        <>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "var(--color-border-subtle)",
            }}
          />
          <PeriodPill period={basePeriod} label="Base" />
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-tertiary)",
            }}
          >
            vs
          </span>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setPresetOpen((o) => !o)}
              style={comparePillStyle}
              aria-expanded={presetOpen}
              aria-haspopup="listbox"
            >
              {comparePeriod.label || `${comparePeriod.start} — ${comparePeriod.end}`}
              <ChevronIcon />
            </button>

            {presetOpen && (
              <ComparePresetMenu
                presets={COMPARE_PRESETS}
                onSelect={applyPreset}
                onClose={() => setPresetOpen(false)}
                basePeriod={basePeriod}
                currentCompare={comparePeriod}
                onCustomChange={onPeriodChange}
              />
            )}
          </div>

          <DeltaBadge basePeriod={basePeriod} comparePeriod={comparePeriod} />
        </>
      )}
    </div>
  );
}

// --- Sub-components ---

function ToggleSwitch({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onToggle(!on)}
      style={{
        width: "32px",
        height: "18px",
        borderRadius: "var(--radius-pill)",
        background: on ? "var(--color-accent-default)" : "var(--color-border-default)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: `background var(--motion-base)`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: on ? "16px" : "2px",
          width: "14px",
          height: "14px",
          borderRadius: "var(--radius-pill)",
          background: "var(--color-surface-overlay)",
          transition: `left var(--motion-base)`,
          boxShadow: "var(--elev-1)",
        }}
      />
    </button>
  );
}

function PeriodPill({ period, label }: { period: Period; label: string }) {
  return (
    <div
      style={{
        fontSize: "var(--text-xs)",
        color: "var(--color-text-secondary)",
        background: "var(--color-surface-sunken)",
        borderRadius: "var(--radius-pill)",
        padding: "var(--space-4) var(--space-8)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
      }}
    >
      <span style={{ color: "var(--color-text-tertiary)" }}>{label}:</span>
      <span>
        {period.start} — {period.end}
      </span>
    </div>
  );
}

function DeltaBadge({
  basePeriod,
  comparePeriod,
}: {
  basePeriod: Period;
  comparePeriod: Period;
}) {
  // Placeholder delta — in production, this receives computed delta values
  const daysDiff = Math.round(
    (new Date(basePeriod.start).getTime() -
      new Date(comparePeriod.start).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const label = daysDiff > 0 ? `${daysDiff}d ago` : "Same period";
  return (
    <span
      style={{
        fontSize: "var(--text-xs)",
        color: "var(--color-text-secondary)",
        background: "var(--color-surface-sunken)",
        borderRadius: "var(--radius-pill)",
        padding: "var(--space-4) var(--space-8)",
      }}
    >
      {label}
    </span>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// --- Styles ---

const comparePillStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  fontSize: "var(--text-xs)",
  color: "var(--color-accent-default)",
  background: "var(--color-accent-subtle)",
  borderRadius: "var(--radius-pill)",
  padding: "var(--space-4) var(--space-8)",
  border: "none",
  cursor: "pointer",
  maxWidth: "160px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

