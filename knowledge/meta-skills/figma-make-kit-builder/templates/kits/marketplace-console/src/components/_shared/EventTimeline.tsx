// Kit-local reusable sub-component — EventTimeline
// Used by OrderDetail and DisputeResolutionPanel.
// Do not globalize — scoped to marketplace-console.

import type { ReactNode } from "react";
import { Stack } from "@/lib/layout";
import type { OrderEvent, OrderEventType } from "../types";

const eventColors: Record<OrderEventType, string> = {
  created: "var(--color-info)",
  paid: "var(--color-success)",
  processing: "var(--color-info)",
  "label-created": "var(--color-info)",
  shipped: "var(--color-accent-default)",
  "in-transit": "var(--color-accent-default)",
  "out-for-delivery": "var(--color-accent-default)",
  delivered: "var(--color-success)",
  "return-requested": "var(--color-warning)",
  returned: "var(--color-warning)",
  refunded: "var(--color-warning)",
  cancelled: "var(--color-danger)",
  note: "var(--color-text-tertiary)"
};

type EventTimelineProps = {
  events: OrderEvent[];
  renderExtra?: (event: OrderEvent) => ReactNode;
};

export function EventTimeline({ events, renderExtra }: EventTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <Stack gap={0} style={{ position: "relative" }}>
      {sorted.map((event, idx) => (
        <div
          key={event.id}
          style={{
            display: "flex",
            gap: "var(--space-12)",
            paddingBottom: idx < sorted.length - 1 ? "var(--space-16)" : 0,
            position: "relative"
          }}
        >
          {/* Vertical line */}
          {idx < sorted.length - 1 && (
            <div
              style={{
                position: "absolute",
                left: "var(--space-8)",
                top: "var(--space-16)",
                bottom: 0,
                width: "1px",
                background: "var(--color-border-subtle)"
              }}
            />
          )}

          {/* Dot */}
          <div
            style={{
              width: "var(--space-16)",
              height: "var(--space-16)",
              borderRadius: "var(--radius-pill)",
              background: eventColors[event.type],
              flexShrink: 0,
              marginTop: "var(--space-4)",
              zIndex: 1
            }}
          />

          {/* Content */}
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--color-text-primary)",
                lineHeight: "var(--lh-sm)"
              }}
            >
              {event.description}
            </span>
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
                lineHeight: "var(--lh-xs)"
              }}
            >
              {formatDate(event.timestamp)}
              {event.actor && ` · ${event.actor}`}
            </span>
            {renderExtra?.(event)}
          </Stack>
        </div>
      ))}
    </Stack>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
