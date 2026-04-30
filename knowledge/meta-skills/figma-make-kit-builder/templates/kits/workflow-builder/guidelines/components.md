# Components — workflow-builder

Visual automation builder (Zapier/n8n-style). Target user: operators wiring
triggers → actions across services, monitoring runs, debugging failures. The
kit is the canvas + the sidecars around it (trigger/action panels, run logs,
retry controls).

## NodeCanvas

**Usage** — The main workspace. Pan/zoom infinite canvas where nodes
(triggers/actions) are placed and edges connect them. Pairs with `NodeInspector`
(right panel, shows selected node's config) and `MinimapOverlay`.

**Semantic purpose** — A directed graph where nodes are typed operations and
edges carry typed data. Not a diagram; an executable program.

**Examples**

Correct:

```tsx
<NodeCanvas
  nodes={nodes}
  edges={edges}
  onNodesChange={setNodes}
  onEdgesChange={setEdges}
  nodeTypes={registeredNodeTypes}
  validation="on-edit"
  snapToGrid={16}
/>
```

Incorrect:

```tsx
<NodeCanvas nodes={nodes} edges={edges} />
```

*Why wrong:* Without `nodeTypes`, the canvas can't validate that the edges
carry compatible types. Users build broken workflows that fail at runtime
instead of at connection-time.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `nodes` | `Node[]` | yes | — | Current node positions + data |
| `edges` | `Edge[]` | yes | — | Connections, typed by source port |
| `onNodesChange` | `(n: Node[]) => void` | yes | — | Persist layout/data |
| `onEdgesChange` | `(e: Edge[]) => void` | yes | — | Persist connections |
| `nodeTypes` | `NodeTypeRegistry` | yes | — | Defines ports, validation, icons |
| `validation` | `"on-edit" \| "on-save" \| "off"` | no | `"on-edit"` | Edge type-check |
| `snapToGrid` | `number` | no | `16` | Pixel snap |

---

## TriggerPanel

**Usage** — The entry point of a workflow. Configures *when* the workflow
runs (webhook, schedule, event, manual). First node in every workflow.
Pairs with `WebhookTester` for webhook triggers.

**Semantic purpose** — Defines the workflow's invocation contract — what
starts it and what data it receives. Exactly one per workflow.

**Examples**

Correct:

```tsx
<TriggerPanel
  triggerType="webhook"
  config={{ endpoint: generatedUrl, authMode: "secret" }}
  onTest={runWebhookTest}
  lastInvokedAt={lastTrigger}
/>
```

Incorrect:

```tsx
<TriggerPanel triggerType="webhook" />
```

*Why wrong:* No config, no test affordance, no history. Users can't verify
that the trigger actually fires. The test/last-invoked loop is the core
feedback the trigger panel must surface.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `triggerType` | `"webhook" \| "schedule" \| "event" \| "manual"` | yes | — | Kind |
| `config` | `TriggerConfig` | yes | — | Type-specific settings |
| `onTest` | `() => Promise<TriggerTestResult>` | no | — | Manual fire |
| `lastInvokedAt` | `Date \| null` | no | `null` | Timestamp for feedback |

---

## ActionConfigPanel

**Usage** — Right-side panel shown when a non-trigger node is selected on the
canvas. Two modes: configure the action (input mapping) or inspect its last
run (output data). Tabbed UI: Config | Last Run | Docs.

**Semantic purpose** — The binding between an action's declared inputs and
the upstream data flowing into them. Input mapping is typed and validated.

**Examples**

Correct:

```tsx
<ActionConfigPanel
  nodeId={selectedNodeId}
  actionType="http-request"
  inputSchema={actionSchema.inputs}
  upstreamData={getUpstreamDataFor(selectedNodeId)}
  mapping={currentMapping}
  onMappingChange={setMapping}
  lastRunOutput={lastRunFor(selectedNodeId)}
/>
```

Incorrect:

```tsx
<ActionConfigPanel node={selectedNode} />
```

*Why wrong:* No input schema = no validation; no upstream data = user must
hand-type variable references; no last-run output = no debugging. The panel's
value is the full config+inspect loop.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `nodeId` | `string` | yes | — | Selected node |
| `actionType` | `string` | yes | — | Which action (drives schema) |
| `inputSchema` | `JSONSchema` | yes | — | Declared inputs |
| `upstreamData` | `DataShape` | yes | — | Types available from upstream |
| `mapping` | `InputMapping` | yes | — | Current binding |
| `onMappingChange` | `(m: InputMapping) => void` | yes | — | Setter |
| `lastRunOutput` | `RunOutput \| null` | no | `null` | For inspection tab |

---

## RunLogViewer

**Usage** — Full-page or drawer view of a single run's execution. Shows per-node
input, output, duration, and errors. Pairs with `RetryControls` (rerun from
a specific node with modified input).

**Semantic purpose** — A run is an ordered, time-stamped trace. Each step is
inspectable. Debugging = reading the trace and targeting a specific node.

**Examples**

Correct:

```tsx
<RunLogViewer
  runId={runId}
  steps={runSteps}
  onStepSelect={setFocusedStep}
  focusedStepId={focusedStep}
  renderStepDetail={(step) => <StepDetail step={step} />}
/>
```

Incorrect:

```tsx
<RunLogViewer log={flatLogString} />
```

*Why wrong:* A flat string log can't be navigated, filtered, or retried from
a specific point. Runs are structured; the viewer must expose that structure.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `runId` | `string` | yes | — | Which run |
| `steps` | `RunStep[]` | yes | — | Ordered by start time |
| `onStepSelect` | `(id: string) => void` | yes | — | Navigation |
| `focusedStepId` | `string \| null` | yes | — | Current step |
| `renderStepDetail` | `(step: RunStep) => ReactNode` | yes | — | Per-step renderer |

---

## RunHistoryTable

**Usage** — Top-level view at `/workflows/:id/runs`. Virtualized table of every
execution with status, duration, trigger source, and one-click re-run. Uses
`PowerDataTable` primitives (shared with power-data-table kit).

**Semantic purpose** — Observability surface. Historical truth about what
happened — when, why, how long, with what result.

**Examples**

Correct:

```tsx
<RunHistoryTable
  workflowId={workflowId}
  filters={{ status: "error", timeRange: "last-7-days" }}
  onRunSelect={(runId) => openRunLog(runId)}
  bulkActions={["retry", "export-logs"]}
/>
```

Incorrect:

```tsx
<RunHistoryTable workflowId={workflowId} />
```

*Why wrong:* No filters on a runs table = unusable once you have >100 runs.
Operators specifically come to this table to find errors in a time window;
filters are the primary affordance.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `workflowId` | `string` | yes | — | Scope |
| `filters` | `RunFilters` | no | `{}` | Status, time range, trigger |
| `onRunSelect` | `(id: string) => void` | yes | — | Opens log viewer |
| `bulkActions` | `BulkAction[]` | no | `[]` | Multi-select ops |

---

## Monetization patterns enforced

- **Usage-visible billing** — `UsageMeter` in header showing runs-this-period
  vs plan limit
- **Advanced-mode toggles** — `ProFeatureCallout` on parallel-branch nodes,
  on webhook-auth modes, on retention period > 7 days
- **API/webhook access** — `WebhookEventLog` under `/settings/webhooks`,
  `ApiKeyManager` under `/settings/api`
- **Abandoned-state rescue** — `IncompleteDraftsPanel` on workflows dashboard
  showing unfinished workflows from last session
