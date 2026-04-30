import { useState } from "react";
import { Inline } from "@/lib/layout";
import type { PublishState, Action } from "../types";
import { SchedulePicker } from "./SchedulePicker";

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

const STATE_LABELS: Record<PublishState, string> = {
  draft: "Draft", review: "In Review", scheduled: "Scheduled", published: "Published",
};

const STATE_COLORS: Record<PublishState, string> = {
  draft: "var(--color-text-secondary)",
  review: "var(--color-warning)",
  scheduled: "var(--color-info)",
  published: "var(--color-success)",
};

const ACTION_LABELS: Record<Action, string> = {
  save: "Save draft",
  "request-review": "Request review",
  approve: "Approve",
  schedule: "Schedule",
  publish: "Publish",
  unpublish: "Unpublish",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "var(--space-8) var(--space-24)",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  border: "none",
  borderRadius: "var(--radius-md)",
  background: "var(--color-accent-default)",
  color: "var(--color-text-inverted)",
  cursor: "pointer",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "var(--space-8) var(--space-16)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-base)",
  color: "var(--color-text-primary)",
  cursor: "pointer",
};

export type DraftPublishBarProps = {
  state: PublishState;
  lastSavedAt: Date;
  nextAction: Action;
  onAction: (a: Action) => void;
  scheduleEnabled?: boolean;
};

export function DraftPublishBar({ state, lastSavedAt, nextAction, onAction, scheduleEnabled = true }: DraftPublishBarProps) {
  const [showScheduler, setShowScheduler] = useState(false);

  const handlePrimary = () => {
    if (nextAction === "schedule") { setShowScheduler(true); }
    else { onAction(nextAction); }
  };

  return (
    <div style={{ padding: "var(--space-12) var(--space-24)", borderTop: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)", boxShadow: "var(--elev-1)", position: "relative" }}>
      <Inline justify="between" align="center">
        {/* State indicator */}
        <Inline gap={16} align="center">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
            <span style={{ width: "var(--space-8)", height: "var(--space-8)", borderRadius: "var(--radius-pill)", background: STATE_COLORS[state], flexShrink: 0 }} />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: STATE_COLORS[state] }}>
              {STATE_LABELS[state]}
            </span>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            Saved {formatRelativeTime(lastSavedAt)}
          </span>
        </Inline>

        {/* Actions */}
        <Inline gap={8} align="center" style={{ position: "relative" }}>
          <button onClick={() => onAction("save")} style={secondaryBtnStyle}>Save</button>

          {scheduleEnabled && nextAction !== "schedule" && nextAction !== "unpublish" && (
            <button onClick={() => setShowScheduler((v) => !v)} style={secondaryBtnStyle}>Schedule</button>
          )}

          {!scheduleEnabled && (nextAction === "schedule" || nextAction === "publish") && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", padding: "var(--space-4) var(--space-8)", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-pill)" }}>
              Pro: scheduling
            </span>
          )}

          <button onClick={handlePrimary} style={primaryBtnStyle}>{ACTION_LABELS[nextAction]}</button>

          {showScheduler && (
            <SchedulePicker
              onConfirm={() => { setShowScheduler(false); onAction("schedule"); }}
              onCancel={() => setShowScheduler(false)}
            />
          )}
        </Inline>
      </Inline>
    </div>
  );
}
