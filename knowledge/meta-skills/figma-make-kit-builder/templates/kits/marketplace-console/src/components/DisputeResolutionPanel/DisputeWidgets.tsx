// Kit-local sub-components for DisputeResolutionPanel.
// Extracted to keep DisputeResolutionPanel.tsx within the 250-line limit.

import { useState, useEffect, useRef, useCallback } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { Evidence, Decision, Duration } from "../types";

// ─── SLA Countdown ───────────────────────────────────────────────────────────
// Live timer: receives Duration, counts down every second via setInterval.

function toSeconds(d: Duration): number {
  return d.hours * 3600 + d.minutes * 60 + d.seconds;
}

function fromSeconds(s: number): Duration {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { hours: h, minutes: m, seconds: sec };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function SlaCountdown({ initial }: { initial: Duration }) {
  const [remaining, setRemaining] = useState(toSeconds(initial));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const d = fromSeconds(remaining);
  const urgent = remaining < 3600;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-8)",
        padding: "var(--space-8) var(--space-12)",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${urgent ? "var(--color-danger)" : "var(--color-border-default)"}`,
        background: urgent ? "var(--color-surface-sunken)" : "var(--color-surface-raised)"
      }}
    >
      <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: urgent ? "var(--color-danger)" : "var(--color-text-secondary)" }}>
        SLA Deadline
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 700, color: urgent ? "var(--color-danger)" : "var(--color-text-primary)" }}>
        {pad(d.hours)}:{pad(d.minutes)}:{pad(d.seconds)}
      </span>
      {remaining === 0 && (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", fontWeight: 600 }}>EXPIRED</span>
      )}
    </div>
  );
}

// ─── Evidence list ────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceList({
  items,
  onAdd
}: {
  items: Evidence[];
  onAdd: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { await onAdd(file); } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Stack gap={8}>
      {items.map((ev) => (
        <div key={ev.id} style={{ display: "flex", gap: "var(--space-8)", alignItems: "center", padding: "var(--space-8) var(--space-12)", background: "var(--color-surface-raised)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)" }}>
          <span style={{ fontSize: "var(--text-xs)", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius-sm)", background: "var(--color-surface-sunken)", color: "var(--color-text-secondary)", fontWeight: 500, textTransform: "uppercase" as const, flexShrink: 0 }}>
            {ev.type}
          </span>
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.filename}</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{ev.uploadedBy} · {formatBytes(ev.size)}</span>
          </Stack>
          <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-accent)", flexShrink: 0 }}>View</a>
        </div>
      ))}
      <div>
        <input ref={inputRef} type="file" id="evidence-upload" style={{ display: "none" }} onChange={handleFile} accept="image/*,application/pdf,.csv,.xlsx" />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ width: "100%", padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", border: "1px dashed var(--color-border-default)", background: "transparent", color: "var(--color-text-secondary)", cursor: uploading ? "wait" : "pointer" }}
        >
          {uploading ? "Uploading…" : "+ Add evidence"}
        </button>
      </div>
    </Stack>
  );
}

// ─── Decision panel ───────────────────────────────────────────────────────────

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: "var(--space-8) var(--space-12)", fontSize: "var(--text-xs)", fontWeight: 600, borderRadius: "var(--radius-md)", border: `1px solid ${color}`, background: "var(--color-surface-base)", color, cursor: "pointer", whiteSpace: "nowrap" as const }}>
      {label}
    </button>
  );
}

export function DecisionPanel({ onDecision }: { onDecision: (d: Decision) => void }) {
  const [note, setNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const submit = useCallback((type: Decision["type"]) => {
    onDecision({ type, note: note || undefined, refundAmount: refundAmount ? parseFloat(refundAmount) : undefined });
  }, [note, refundAmount, onDecision]);

  return (
    <Stack gap={12}>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Resolution note (optional)…"
        rows={3}
        style={{ width: "100%", padding: "var(--space-8) var(--space-12)", fontSize: "var(--text-sm)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", resize: "vertical", fontFamily: "var(--font-sans)" }}
      />
      <input
        type="number"
        value={refundAmount}
        onChange={(e) => setRefundAmount(e.target.value)}
        placeholder="Refund amount (if applicable)"
        style={{ width: "100%", padding: "var(--space-8) var(--space-12)", fontSize: "var(--text-sm)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", background: "var(--color-surface-base)", color: "var(--color-text-primary)" }}
      />
      <Inline gap={8}>
        <ActionBtn label="Accept" color="var(--color-success)" onClick={() => submit("accept")} />
        <ActionBtn label="Contest" color="var(--color-warning)" onClick={() => submit("contest")} />
        <ActionBtn label="Escalate" color="var(--color-info)" onClick={() => submit("escalate")} />
        <ActionBtn label="Partial Refund" color="var(--color-danger)" onClick={() => submit("partial-refund")} />
      </Inline>
    </Stack>
  );
}
