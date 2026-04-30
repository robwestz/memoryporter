// Kit-local sub-components for StreamingAnswerPane.
// Extracted to keep StreamingAnswerPane.tsx within the 250-line limit.
// If react-markdown is added in a future pass, replace renderMarkdown() with
// <ReactMarkdown> and remark-gfm. The prop interface stays identical.

import { useState, type ReactNode } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { ToolCall, CodeBlock } from "../types";

// ─── Citation marker ──────────────────────────────────────────────────────────

export function CitationMarker({
  index,
  sourceId,
  onClick
}: {
  index: number;
  sourceId: string;
  onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(sourceId)}
      title={`Source ${index}`}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 18, height: 18, fontSize: "var(--text-xs)", fontWeight: 700,
        borderRadius: "var(--radius-pill)", border: "1px solid var(--color-accent-default)",
        background: "var(--color-accent-subtle)", color: "var(--color-text-accent)",
        cursor: "pointer", verticalAlign: "super", lineHeight: 1, marginLeft: 2, padding: 0
      }}
    >
      {index}
    </button>
  );
}

// ─── Inline markdown renderer ─────────────────────────────────────────────────

function renderInline(
  text: string,
  sourceIds: string[],
  onCitationClick: (id: string) => void,
  baseKey: number
): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\^?\d+\])/g);
  return parts.map((part, i) => {
    const k = baseKey * 1000 + i;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={k} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", background: "var(--color-surface-sunken)", padding: "1px var(--space-4)", borderRadius: "var(--radius-sm)" }}>{part.slice(1, -1)}</code>;
    }
    const citMatch = part.match(/^\[\^?(\d+)\]$/);
    if (citMatch) {
      const idx = parseInt(citMatch[1], 10);
      const sourceId = sourceIds[idx - 1];
      if (sourceId) return <CitationMarker key={k} index={idx} sourceId={sourceId} onClick={onCitationClick} />;
    }
    return <span key={k}>{part}</span>;
  });
}

export function renderMarkdown(
  text: string,
  sourceIds: string[],
  onCitationClick: (id: string) => void
): ReactNode[] {
  const lines = text.split("\n");
  const result: ReactNode[] = [];
  let paraBuffer: string[] = [];
  let key = 0;

  function flushPara() {
    if (!paraBuffer.length) return;
    const joined = paraBuffer.join(" ").trim();
    if (joined) {
      result.push(
        <p key={key++} style={{ margin: "0 0 var(--space-12)", lineHeight: "var(--lh-base)", fontSize: "var(--text-base)" }}>
          {renderInline(joined, sourceIds, onCitationClick, key)}
        </p>
      );
    }
    paraBuffer = [];
  }

  for (const line of lines) {
    if (line.startsWith("### ")) {
      flushPara();
      result.push(<h3 key={key++} style={{ fontSize: "var(--text-lg)", fontWeight: 600, margin: "var(--space-16) 0 var(--space-8)", color: "var(--color-text-primary)" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushPara();
      result.push(<h2 key={key++} style={{ fontSize: "var(--text-xl)", fontWeight: 600, margin: "var(--space-16) 0 var(--space-8)", color: "var(--color-text-primary)" }}>{line.slice(3)}</h2>);
    } else if (line.trim() === "") {
      flushPara();
    } else {
      paraBuffer.push(line);
    }
  }
  flushPara();
  return result;
}

// ─── Default tool call card ───────────────────────────────────────────────────

export function DefaultToolCallCard({ call }: { call: ToolCall }) {
  const statusColor = call.status === "completed" ? "var(--color-success)" : call.status === "failed" ? "var(--color-danger)" : "var(--color-info)";
  return (
    <div style={{ padding: "var(--space-8) var(--space-12)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)", background: "var(--color-surface-sunken)" }}>
      <Inline gap={8} align="center">
        <span style={{ width: 8, height: 8, borderRadius: "var(--radius-pill)", background: statusColor, flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 500 }}>{call.name}</span>
        {call.durationMs !== undefined && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginLeft: "auto" }}>{call.durationMs}ms</span>
        )}
      </Inline>
    </div>
  );
}

// ─── Default code block ───────────────────────────────────────────────────────

export function DefaultCodeBlock({ block }: { block: CodeBlock }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-subtle)", overflow: "hidden", marginBottom: "var(--space-12)" }}>
      {(block.language || block.filename) && (
        <Inline justify="between" align="center" style={{ padding: "var(--space-4) var(--space-12)", background: "var(--color-surface-sunken)", borderBottom: "1px solid var(--color-border-subtle)" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>{block.filename ?? block.language}</span>
          <button onClick={copy} style={{ fontSize: "var(--text-xs)", border: "none", background: "transparent", color: copied ? "var(--color-success)" : "var(--color-text-secondary)", cursor: "pointer" }}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </Inline>
      )}
      <pre style={{ margin: 0, padding: "var(--space-12) var(--space-16)", overflowX: "auto", fontSize: "var(--text-sm)", lineHeight: "var(--lh-base)", fontFamily: "var(--font-mono)", background: "var(--color-surface-sunken)", color: "var(--color-text-primary)" }}>
        <code>{block.code}</code>
      </pre>
    </div>
  );
}
