import { useState } from "react";
import { ReactFlowProvider, type Node, type Edge } from "@xyflow/react";

import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import { Split } from "@/lib/layout/Split";

import { NodeCanvas } from "../components/NodeCanvas";
import { TriggerPanel } from "../components/TriggerPanel";
import { ActionConfigPanel } from "../components/ActionConfigPanel";
import { RunLogViewer } from "../components/RunLogViewer";
import { RunHistoryTable } from "../components/RunHistoryTable";
import { canvasStore } from "../lib/canvasStore";

import type {
  NodeTypeRegistry,
  TriggerConfig,
  RunStep,
  InputMapping,
} from "../components/types";

// ── Stub data ─────────────────────────────────────────────────────────────────

const NODE_TYPES: NodeTypeRegistry = {
  "http-trigger": {
    label: "Webhook",
    icon: "⚡",
    category: "trigger",
    inputs: [],
    outputs: [{ id: "body", label: "Body", kind: "object" }],
  },
  "http-request": {
    label: "HTTP Request",
    icon: "🌐",
    category: "action",
    inputs: [
      { id: "url", label: "URL", kind: "string" },
      { id: "body", label: "Body", kind: "object" },
    ],
    outputs: [{ id: "response", label: "Response", kind: "object" }],
  },
  "slack-message": {
    label: "Slack Message",
    icon: "💬",
    category: "action",
    inputs: [
      { id: "channel", label: "Channel", kind: "string" },
      { id: "text", label: "Message", kind: "string" },
    ],
    outputs: [],
  },
};

const INITIAL_NODES: Node[] = [
  {
    id: "trigger-1",
    type: "http-trigger",
    position: { x: 80, y: 200 },
    data: { label: "Webhook" },
  },
  {
    id: "action-1",
    type: "http-request",
    position: { x: 320, y: 160 },
    data: { label: "HTTP Request" },
  },
  {
    id: "action-2",
    type: "slack-message",
    position: { x: 560, y: 240 },
    data: { label: "Slack Message" },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1", source: "trigger-1", target: "action-1" },
  { id: "e2", source: "action-1", target: "action-2" },
];

const TRIGGER_CONFIG: TriggerConfig = {
  endpoint: "https://hooks.example.com/wf/abc123",
  authMode: "secret",
};

const STUB_RUN_STEPS: RunStep[] = [
  {
    id: "step-1",
    nodeId: "trigger-1",
    nodeLabel: "Webhook",
    status: "success",
    startedAt: new Date(Date.now() - 5000),
    endedAt: new Date(Date.now() - 4800),
    durationMs: 200,
    output: { body: { event: "form.submit", email: "user@example.com" } },
  },
  {
    id: "step-2",
    nodeId: "action-1",
    nodeLabel: "HTTP Request",
    status: "success",
    startedAt: new Date(Date.now() - 4800),
    endedAt: new Date(Date.now() - 4200),
    durationMs: 600,
    input: { url: "https://api.example.com/users", body: "{{body}}" },
    output: { response: { id: 42, created: true } },
  },
  {
    id: "step-3",
    nodeId: "action-2",
    nodeLabel: "Slack Message",
    status: "error",
    startedAt: new Date(Date.now() - 4200),
    endedAt: new Date(Date.now() - 4100),
    durationMs: 100,
    error: "channel_not_found: #alerts does not exist",
  },
];

// ── View types ────────────────────────────────────────────────────────────────

type ViewTab = "canvas" | "runs";

// ── App ───────────────────────────────────────────────────────────────────────

function WorkflowBuilderApp() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [mapping, setMapping] = useState<InputMapping>({});
  const [view, setView] = useState<ViewTab>("canvas");
  const [focusedStep, setFocusedStep] = useState<string | null>("step-1");

  const selectedNodeId = canvasStore.use((s) => s.selectedNodeId);

  const selectedNodeDef = selectedNodeId
    ? NODE_TYPES[nodes.find((n) => n.id === selectedNodeId)?.type ?? ""] ?? null
    : null;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-surface-base)",
      }}
    >
      {/* Top bar */}
      <Inline
        gap={16}
        align="center"
        justify="between"
        style={{
          padding: `var(--space-12) var(--space-24)`,
          borderBottom: `1px solid var(--color-border-subtle)`,
          background: "var(--color-surface-raised)",
          boxShadow: "var(--elev-1)",
        }}
      >
        <Inline gap={8} align="center">
          <span style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Workflow Builder
          </span>
          <span
            style={{
              fontSize: "var(--text-xs)",
              background: "var(--color-surface-sunken)",
              color: "var(--color-text-secondary)",
              padding: `var(--space-4) var(--space-8)`,
              borderRadius: "var(--radius-pill)",
            }}
          >
            Demo workflow
          </span>
        </Inline>

        <Inline gap={4} align="center">
          {(["canvas", "runs"] as ViewTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setView(t)}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: view === t ? 600 : 400,
                padding: `var(--space-4) var(--space-12)`,
                borderRadius: "var(--radius-md)",
                border: "none",
                background:
                  view === t ? "var(--color-accent-subtle)" : "transparent",
                color:
                  view === t
                    ? "var(--color-text-accent)"
                    : "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              {t === "canvas" ? "Canvas" : "Run History"}
            </button>
          ))}
        </Inline>

        {/* Monetization: usage meter (pattern #1) */}
        <Inline gap={8} align="center">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
            Runs this month:
          </span>
          <div
            style={{
              width: 120,
              height: 6,
              background: "var(--color-surface-sunken)",
              borderRadius: "var(--radius-pill)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "100%",
                background: "var(--color-accent-default)",
                borderRadius: "var(--radius-pill)",
              }}
            />
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
            600 / 1,000
          </span>
          <button
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              padding: `var(--space-4) var(--space-8)`,
              borderRadius: "var(--radius-sm)",
              border: `1px solid var(--color-accent-default)`,
              background: "transparent",
              color: "var(--color-text-accent)",
              cursor: "pointer",
            }}
          >
            Upgrade
          </button>
        </Inline>
      </Inline>

      {/* Main body */}
      {view === "canvas" && (
        <Split
          direction="horizontal"
          style={{ flex: 1, minHeight: 0 }}
          primaryFlex={3}
          secondaryFlex={1}
          primary={
            <Split
              direction="horizontal"
              primaryFlex={1}
              secondaryFlex={0}
              secondarySize="280px"
              style={{ height: "100%" }}
              primary={
                <div style={{ height: "100%", position: "relative" }}>
                  <NodeCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={setNodes}
                    onEdgesChange={setEdges}
                    nodeTypes={NODE_TYPES}
                    validation="on-edit"
                    snapToGrid={16}
                  />
                </div>
              }
              secondary={
                <Stack
                  gap={16}
                  style={{
                    padding: "var(--space-16)",
                    borderLeft: `1px solid var(--color-border-subtle)`,
                    height: "100%",
                    overflowY: "auto",
                    background: "var(--color-surface-raised)",
                  }}
                >
                  <TriggerPanel
                    triggerType="webhook"
                    config={TRIGGER_CONFIG}
                    onTest={async () => ({
                      success: true,
                      payload: { event: "test", ts: Date.now() },
                      latencyMs: 142,
                    })}
                    lastInvokedAt={new Date(Date.now() - 60_000 * 3)}
                  />

                  {selectedNodeDef && selectedNodeId && (
                    <ActionConfigPanel
                      nodeId={selectedNodeId}
                      actionType={selectedNodeDef.label}
                      inputSchema={{
                        properties: Object.fromEntries(
                          selectedNodeDef.inputs.map((p) => [
                            p.id,
                            { type: "string", description: p.label },
                          ])
                        ),
                        required: selectedNodeDef.inputs
                          .filter((p) => p.kind !== "any")
                          .map((p) => p.id),
                      }}
                      upstreamData={{ body: "object", event: "string" }}
                      mapping={mapping}
                      onMappingChange={setMapping}
                      lastRunOutput={null}
                    />
                  )}
                </Stack>
              }
            />
          }
          secondary={
            <div style={{ padding: "var(--space-16)", height: "100%", overflowY: "auto" }}>
              <RunLogViewer
                runId="run-003"
                steps={STUB_RUN_STEPS}
                onStepSelect={setFocusedStep}
                focusedStepId={focusedStep}
                renderStepDetail={(step) => (
                  <Stack gap={12}>
                    <div
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {step.nodeLabel}
                    </div>
                    {step.error && (
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--color-danger)",
                          fontFamily: "var(--font-mono)",
                          padding: "var(--space-8)",
                          background: "var(--color-surface-sunken)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        {step.error}
                      </div>
                    )}
                    {step.output && (
                      <pre
                        style={{
                          fontSize: "var(--text-xs)",
                          fontFamily: "var(--font-mono)",
                          background: "var(--color-surface-sunken)",
                          padding: "var(--space-8)",
                          borderRadius: "var(--radius-sm)",
                          margin: 0,
                          overflowX: "auto",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    )}
                  </Stack>
                )}
              />
            </div>
          }
        />
      )}

      {view === "runs" && (
        <div style={{ flex: 1, padding: "var(--space-24)", overflowY: "auto" }}>
          <Stack gap={16}>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>
              Run History
            </div>
            <RunHistoryTable
              workflowId="wf-demo"
              filters={{ timeRange: "last-7-days" }}
              onRunSelect={(id) => console.log("open run", id)}
              bulkActions={["retry", "export-logs"]}
            />
          </Stack>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderApp />
    </ReactFlowProvider>
  );
}
