// Domain types — workflow-builder kit
// All types used across the kit's 5 headline components.

// ── Node / Edge (wraps @xyflow/react base types) ─────────────────────────────

export type PortKind = "string" | "number" | "boolean" | "object" | "array" | "any";

export interface Port {
  id: string;
  label: string;
  kind: PortKind;
}

export interface NodeTypeDefinition {
  label: string;
  icon: string; // SVG string or emoji fallback
  category: "trigger" | "action" | "logic" | "transform";
  inputs: Port[];
  outputs: Port[];
}

export type NodeTypeRegistry = Record<string, NodeTypeDefinition>;

export type ValidationMode = "on-edit" | "on-save" | "off";

// ── Trigger ───────────────────────────────────────────────────────────────────

export type TriggerType = "webhook" | "schedule" | "event" | "manual";

export interface WebhookConfig {
  endpoint: string;
  authMode: "none" | "secret" | "oauth";
  secret?: string;
}

export interface ScheduleConfig {
  cron: string;
  timezone: string;
}

export interface EventConfig {
  source: string;
  eventName: string;
}

export interface ManualConfig {
  samplePayload?: Record<string, unknown>;
}

export type TriggerConfig =
  | WebhookConfig
  | ScheduleConfig
  | EventConfig
  | ManualConfig;

export interface TriggerTestResult {
  success: boolean;
  payload?: Record<string, unknown>;
  error?: string;
  latencyMs?: number;
}

// ── Action config ─────────────────────────────────────────────────────────────

// JSONSchema subset sufficient for input-mapping UI
export interface JSONSchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
}

export interface JSONSchema {
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export type DataShape = Record<string, PortKind>;

export type InputMapping = Record<string, string>; // field → expression / literal

export interface RunOutput {
  data?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
}

// ── Run log ───────────────────────────────────────────────────────────────────

export type StepStatus = "pending" | "running" | "success" | "error" | "skipped";

export interface RunStep {
  id: string;
  nodeId: string;
  nodeLabel: string;
  status: StepStatus;
  startedAt: Date;
  endedAt?: Date;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
}

// ── Run history ───────────────────────────────────────────────────────────────

export type RunStatus = "running" | "success" | "error" | "cancelled";
export type TriggerSource = "webhook" | "schedule" | "manual" | "api";

export interface RunRecord {
  id: string;
  workflowId: string;
  status: RunStatus;
  triggerSource: TriggerSource;
  startedAt: Date;
  endedAt?: Date;
  durationMs?: number;
  stepCount?: number;
  errorMessage?: string;
}

export interface RunFilters {
  status?: RunStatus | RunStatus[];
  timeRange?: "last-hour" | "last-24h" | "last-7-days" | "last-30-days";
  triggerSource?: TriggerSource;
}

export type BulkAction = "retry" | "cancel" | "export-logs" | "delete";
