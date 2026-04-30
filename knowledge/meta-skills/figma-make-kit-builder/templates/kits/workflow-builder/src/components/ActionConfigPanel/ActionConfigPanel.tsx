import { useState } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import type { JSONSchema, DataShape, InputMapping, RunOutput } from "../types";

export interface ActionConfigPanelProps {
  nodeId: string;
  actionType: string;
  inputSchema: JSONSchema;
  upstreamData: DataShape;
  mapping: InputMapping;
  onMappingChange: (m: InputMapping) => void;
  lastRunOutput?: RunOutput | null;
}

type TabId = "config" | "last-run" | "docs";

function TabBar({ active, onChange, hasLastRun }: { active: TabId; onChange: (t: TabId) => void; hasLastRun: boolean }) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "config", label: "Config" }, { id: "last-run", label: "Last Run" }, { id: "docs", label: "Docs" },
  ];
  return (
    <Inline gap={0} align="center" style={{ borderBottom: `1px solid var(--color-border-subtle)`, marginBottom: "var(--space-16)" }}>
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onChange(tab.id)} disabled={tab.id === "last-run" && !hasLastRun}
          style={{ fontSize: "var(--text-sm)", fontWeight: active === tab.id ? 600 : 400, color: active === tab.id ? "var(--color-text-accent)" : "var(--color-text-secondary)", background: "none", border: "none", borderBottom: active === tab.id ? `2px solid var(--color-text-accent)` : `2px solid transparent`, padding: `var(--space-8) var(--space-12)`, cursor: tab.id === "last-run" && !hasLastRun ? "not-allowed" : "pointer", opacity: tab.id === "last-run" && !hasLastRun ? 0.4 : 1, marginBottom: "-1px" }}>
          {tab.label}
        </button>
      ))}
    </Inline>
  );
}

function ConfigTab({ schema, upstreamData, mapping, onChange }: { schema: JSONSchema; upstreamData: DataShape; mapping: InputMapping; onChange: (m: InputMapping) => void }) {
  const fields = Object.entries(schema.properties);
  const upstreamKeys = Object.keys(upstreamData);
  const inputStyle = { fontSize: "var(--text-sm)", padding: `var(--space-8) var(--space-12)`, border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-sm)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", width: "100%" };

  return (
    <Stack gap={12}>
      {fields.map(([field, prop]) => (
        <Stack gap={4} key={field}>
          <Inline gap={4} align="baseline">
            <label htmlFor={`f-${field}`} style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-text-primary)" }}>{field}</label>
            {schema.required?.includes(field) && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>*</span>}
            {prop.description && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>— {prop.description}</span>}
          </Inline>
          {prop.enum ? (
            <select id={`f-${field}`} value={mapping[field] ?? ""} onChange={(e) => onChange({ ...mapping, [field]: e.target.value })} style={inputStyle}>
              <option value="">— select —</option>
              {prop.enum.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          ) : (
            <>
              <input id={`f-${field}`} list={`up-${field}`} value={mapping[field] ?? ""} onChange={(e) => onChange({ ...mapping, [field]: e.target.value })} placeholder="{{expression}} or literal" style={inputStyle} />
              <datalist id={`up-${field}`}>{upstreamKeys.map((k) => <option key={k} value={`{{${k}}}`} />)}</datalist>
            </>
          )}
        </Stack>
      ))}
      {fields.length === 0 && <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>No inputs defined.</div>}
    </Stack>
  );
}

function LastRunTab({ output }: { output: RunOutput }) {
  const c = output.error ? "var(--color-danger)" : "var(--color-success)";
  return (
    <Stack gap={12}>
      <Inline gap={8} align="center">
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
        <span style={{ fontSize: "var(--text-sm)", color: c, fontWeight: 500 }}>{output.error ? "Failed" : "Success"}</span>
        {output.durationMs !== undefined && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{output.durationMs}ms</span>}
      </Inline>
      <pre style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", background: "var(--color-surface-sunken)", padding: "var(--space-12)", borderRadius: "var(--radius-sm)", overflowX: "auto", margin: 0, color: "var(--color-text-primary)" }}>
        {output.error ?? JSON.stringify(output.data ?? {}, null, 2)}
      </pre>
    </Stack>
  );
}

export function ActionConfigPanel({ nodeId, actionType, inputSchema, upstreamData, mapping, onMappingChange, lastRunOutput = null }: ActionConfigPanelProps) {
  const [tab, setTab] = useState<TabId>("config");
  return (
    <Stack gap={0} style={{ background: "var(--color-surface-raised)", border: `1px solid var(--color-border-default)`, borderRadius: "var(--radius-lg)", padding: "var(--space-16)", height: "100%", overflow: "hidden" }}>
      <Stack gap={4} style={{ marginBottom: "var(--space-12)" }}>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Node {nodeId}</div>
        <div style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-text-primary)" }}>{actionType}</div>
      </Stack>
      <TabBar active={tab} onChange={setTab} hasLastRun={lastRunOutput !== null} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "config" && <ConfigTab schema={inputSchema} upstreamData={upstreamData} mapping={mapping} onChange={onMappingChange} />}
        {tab === "last-run" && lastRunOutput && <LastRunTab output={lastRunOutput} />}
        {tab === "docs" && <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Documentation for <strong>{actionType}</strong>.</div>}
      </div>
    </Stack>
  );
}
