import type { ReactNode } from "react";
import { Split } from "@/lib/layout/Split";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import { canvasStore } from "../../lib/canvasStore";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import type { RunStep, StepStatus } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RunLogViewerProps {
  runId: string;
  steps: RunStep[];
  onStepSelect: (id: string) => void;
  focusedStepId: string | null;
  renderStepDetail: (step: RunStep) => ReactNode;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<StepStatus, string> = {
  pending: "var(--color-text-tertiary)",
  running: "var(--color-info)",
  success: "var(--color-success)",
  error: "var(--color-danger)",
  skipped: "var(--color-text-tertiary)",
};

const STATUS_ICON: Record<StepStatus, string> = {
  pending: "○",
  running: "◌",
  success: "✓",
  error: "✕",
  skipped: "—",
};

function formatDuration(ms?: number): string {
  if (ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Step row ──────────────────────────────────────────────────────────────────

function StepRow({
  step,
  isSelected,
  onSelect,
}: {
  step: RunStep;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-12)",
        padding: `var(--space-8) var(--space-12)`,
        background: isSelected
          ? "var(--color-accent-subtle)"
          : "transparent",
        border: "none",
        borderLeft: isSelected
          ? `3px solid var(--color-accent-default)`
          : `3px solid transparent`,
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        transition: `background var(--motion-fast)`,
      }}
    >
      <span
        style={{
          fontSize: "var(--text-sm)",
          color: STATUS_COLOR[step.status],
          fontWeight: 700,
          minWidth: 16,
          textAlign: "center",
        }}
      >
        {STATUS_ICON[step.status]}
      </span>
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--color-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {step.nodeLabel}
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
          {formatDuration(step.durationMs)}
        </div>
      </Stack>
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RunLogViewer({
  runId,
  steps,
  onStepSelect,
  focusedStepId,
  renderStepDetail,
}: RunLogViewerProps) {
  // Sync focused step to canvas store for cross-panel awareness
  canvasStore.setState({ focusedRunId: runId, focusedStepId });

  // Arrow-key navigation
  useKeyboardShortcut(
    { key: "ArrowDown" },
    () => {
      const idx = steps.findIndex((s) => s.id === focusedStepId);
      const next = steps[idx + 1];
      if (next) onStepSelect(next.id);
    },
    steps.length > 0
  );

  useKeyboardShortcut(
    { key: "ArrowUp" },
    () => {
      const idx = steps.findIndex((s) => s.id === focusedStepId);
      const prev = steps[idx - 1];
      if (prev) onStepSelect(prev.id);
    },
    steps.length > 0
  );

  const focusedStep = steps.find((s) => s.id === focusedStepId) ?? null;

  // Summary counts
  const errorCount = steps.filter((s) => s.status === "error").length;
  const successCount = steps.filter((s) => s.status === "success").length;

  return (
    <div
      style={{
        background: "var(--color-surface-raised)",
        border: `1px solid var(--color-border-default)`,
        borderRadius: "var(--radius-lg)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header bar */}
      <Inline
        gap={12}
        align="center"
        justify="between"
        style={{
          padding: `var(--space-12) var(--space-16)`,
          borderBottom: `1px solid var(--color-border-subtle)`,
        }}
      >
        <Inline gap={8} align="center">
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            Run log
          </span>
          <code style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}>
            {runId.slice(0, 8)}
          </code>
        </Inline>
        <Inline gap={12} align="center">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-success)" }}>
            {successCount} ok
          </span>
          {errorCount > 0 && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>
              {errorCount} error{errorCount > 1 ? "s" : ""}
            </span>
          )}
        </Inline>
      </Inline>

      {/* Body */}
      <Split
        direction="horizontal"
        primarySize="240px"
        primary={
          <Stack
            gap={0}
            style={{
              height: "100%",
              overflowY: "auto",
              borderRight: `1px solid var(--color-border-subtle)`,
            }}
          >
            {steps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                isSelected={step.id === focusedStepId}
                onSelect={() => onStepSelect(step.id)}
              />
            ))}
            {steps.length === 0 && (
              <div
                style={{
                  padding: "var(--space-24)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-tertiary)",
                  textAlign: "center",
                }}
              >
                No steps recorded.
              </div>
            )}
          </Stack>
        }
        secondary={
          <div style={{ height: "100%", overflowY: "auto", padding: "var(--space-16)" }}>
            {focusedStep
              ? renderStepDetail(focusedStep)
              : (
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                  Select a step to inspect.
                </div>
              )}
          </div>
        }
        style={{ flex: 1, minHeight: 0 }}
      />
    </div>
  );
}
