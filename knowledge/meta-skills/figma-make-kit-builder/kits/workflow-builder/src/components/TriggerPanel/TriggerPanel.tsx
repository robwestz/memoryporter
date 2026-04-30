import { useState } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import type {
  TriggerType,
  TriggerConfig,
  TriggerTestResult,
  WebhookConfig,
  ScheduleConfig,
} from "../types";

export interface TriggerPanelProps {
  triggerType: TriggerType;
  config: TriggerConfig;
  onTest?: () => Promise<TriggerTestResult>;
  lastInvokedAt?: Date | null;
}

const LABELS: Record<TriggerType, string> = {
  webhook: "Webhook", schedule: "Schedule", event: "Event", manual: "Manual",
};
const ICONS: Record<TriggerType, string> = {
  webhook: "⚡", schedule: "🕐", event: "📡", manual: "▶",
};

function fmt(d: Date) {
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

function WebhookDetail({ config }: { config: WebhookConfig }) {
  return (
    <Stack gap={8}>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Endpoint</div>
      <code style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", background: "var(--color-surface-sunken)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-sm)", wordBreak: "break-all", color: "var(--color-text-primary)" }}>
        {config.endpoint}
      </code>
      <Inline gap={8} align="center">
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Auth:</span>
        <span style={{ fontSize: "var(--text-xs)", background: "var(--color-accent-subtle)", color: "var(--color-text-accent)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-pill)" }}>
          {config.authMode}
        </span>
      </Inline>
    </Stack>
  );
}

function ScheduleDetail({ config }: { config: ScheduleConfig }) {
  return (
    <Stack gap={8}>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Cron</div>
      <code style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", background: "var(--color-surface-sunken)", padding: `var(--space-8) var(--space-12)`, borderRadius: "var(--radius-sm)", color: "var(--color-text-primary)" }}>
        {config.cron}
      </code>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>TZ: {config.timezone}</div>
    </Stack>
  );
}

function TestControls({ onTest }: { onTest: () => Promise<TriggerTestResult> }) {
  const [state, setState] = useState<"idle" | "running" | "success" | "error">("idle");
  const [result, setResult] = useState<TriggerTestResult | null>(null);

  const colors: Record<string, string> = {
    idle: "var(--color-text-tertiary)", running: "var(--color-info)",
    success: "var(--color-success)", error: "var(--color-danger)",
  };

  async function run() {
    setState("running"); setResult(null);
    try {
      const r = await onTest();
      setResult(r); setState(r.success ? "success" : "error");
    } catch { setState("error"); setResult({ success: false, error: "Unexpected error" }); }
  }

  return (
    <Stack gap={8}>
      <button
        onClick={run} disabled={state === "running"}
        style={{ fontSize: "var(--text-sm)", fontWeight: 500, padding: `var(--space-8) var(--space-16)`, borderRadius: "var(--radius-md)", border: "none", cursor: state === "running" ? "not-allowed" : "pointer", background: state === "running" ? "var(--color-surface-sunken)" : "var(--color-accent-default)", color: state === "running" ? "var(--color-text-tertiary)" : "var(--color-text-inverted)", transition: `background var(--motion-fast)` }}
      >
        {state === "running" ? "Testing…" : "Test trigger"}
      </button>
      {result && (
        <div style={{ fontSize: "var(--text-xs)", color: colors[state], fontFamily: "var(--font-mono)", padding: `var(--space-8) var(--space-12)`, background: "var(--color-surface-sunken)", borderRadius: "var(--radius-sm)", borderLeft: `3px solid ${colors[state]}` }}>
          {result.success ? `OK (${result.latencyMs ?? "?"}ms)` : result.error ?? "Error"}
        </div>
      )}
    </Stack>
  );
}

export function TriggerPanel({ triggerType, config, onTest, lastInvokedAt = null }: TriggerPanelProps) {
  return (
    <Stack gap={16} style={{ background: "var(--color-surface-raised)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-lg)", padding: "var(--space-16)" }}>
      <Inline gap={8} align="center" justify="between" style={{ flexWrap: "nowrap" }}>
        <Inline gap={8} align="center">
          <span style={{ fontSize: "var(--text-xl)" }}>{ICONS[triggerType]}</span>
          <Stack gap={4}>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trigger</div>
            <div style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-text-primary)" }}>{LABELS[triggerType]}</div>
          </Stack>
        </Inline>
        {lastInvokedAt && (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Last run: {fmt(lastInvokedAt)}</div>
        )}
      </Inline>

      {triggerType === "webhook" && <WebhookDetail config={config as WebhookConfig} />}
      {triggerType === "schedule" && <ScheduleDetail config={config as ScheduleConfig} />}
      {(triggerType === "event" || triggerType === "manual") && (
        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
          {triggerType === "manual" ? "Run manually from dashboard or API." : "Listening for platform events."}
        </div>
      )}

      {onTest && <TestControls onTest={onTest} />}
    </Stack>
  );
}
