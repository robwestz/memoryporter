// Kit-local sub-components for ReviewManagerTable.

import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { ReviewStatus } from "../types";

// ─── Star rating ──────────────────────────────────────────────────────────────

export function StarRating({ rating }: { rating: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <Inline gap={4} align="center">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "var(--color-warning)" : "var(--color-border-default)", fontSize: "var(--text-sm)" }}>★</span>
      ))}
      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginLeft: "var(--space-4)" }}>{rating}/5</span>
    </Inline>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusColors: Record<ReviewStatus, string> = {
  published: "var(--color-success)",
  flagged: "var(--color-warning)",
  removed: "var(--color-danger)",
  pending: "var(--color-info)"
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span style={{ padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 500, color: statusColors[status], background: "var(--color-surface-sunken)" }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Flag reason picker dialog ────────────────────────────────────────────────

const FLAG_REASONS = ["Spam", "Offensive content", "Fake review", "Irrelevant", "Other"];

export function FlagReasonPicker({
  reviewId,
  onFlag,
  onClose
}: {
  reviewId: string;
  onFlag: (id: string, reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", zIndex: "var(--z-modal)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--color-surface-overlay)", borderRadius: "var(--radius-xl)", boxShadow: "var(--elev-3)", padding: "var(--space-24)", width: 360, maxWidth: "90vw" }}>
        <Stack gap={16}>
          <span style={{ fontSize: "var(--text-xl)", fontWeight: 600 }}>Flag Review</span>
          <Stack gap={8}>
            {FLAG_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                style={{ padding: "var(--space-8) var(--space-12)", borderRadius: "var(--radius-md)", border: `1px solid ${reason === r ? "var(--color-accent-default)" : "var(--color-border-default)"}`, background: reason === r ? "var(--color-accent-subtle)" : "transparent", color: reason === r ? "var(--color-text-accent)" : "var(--color-text-primary)", fontSize: "var(--text-sm)", cursor: "pointer", textAlign: "left" as const }}
              >
                {r}
              </button>
            ))}
          </Stack>
          <Inline gap={8} justify="end">
            <button onClick={onClose} style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
              Cancel
            </button>
            <button
              onClick={() => { if (reason) { onFlag(reviewId, reason); onClose(); } }}
              disabled={!reason}
              style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 600, border: `1px solid var(--color-danger)`, borderRadius: "var(--radius-md)", background: reason ? "var(--color-danger)" : "var(--color-surface-sunken)", color: reason ? "var(--color-text-inverted)" : "var(--color-text-tertiary)", cursor: reason ? "pointer" : "default" }}
            >
              Flag
            </button>
          </Inline>
        </Stack>
      </div>
    </div>
  );
}
