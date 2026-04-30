import { Stack, Inline, Split } from "@/lib/layout";
import { EventTimeline } from "../_shared/EventTimeline";
import {
  StatusPill, SectionTitle, LineItemRow, TotalRow,
  ShippingLabelList, OrderActionButton, fmt, formatDate
} from "./OrderWidgets";
import type { Order, OrderEvent, OrderAction, ShippingLabel } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type OrderDetailProps = {
  order: Order;
  timeline: OrderEvent[];
  availableActions: OrderAction[];
  onAction: (action: OrderAction) => void;
  shippingLabels?: ShippingLabel[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderDetail({
  order,
  timeline,
  availableActions,
  onAction,
  shippingLabels = []
}: OrderDetailProps) {
  return (
    <Split
      direction="horizontal"
      primarySize="60%"
      primary={
        <Stack gap={24} style={{ padding: "var(--space-24)", overflowY: "auto", height: "100%" }}>
          {/* Header */}
          <Inline justify="between" align="start">
            <Stack gap={4}>
              <span style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                Order #{order.number}
              </span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                {formatDate(order.createdAt)}
              </span>
            </Stack>
            <StatusPill status={order.status} />
          </Inline>

          {/* Customer */}
          <section>
            <SectionTitle>Customer</SectionTitle>
            <div style={{ padding: "var(--space-12) var(--space-16)", background: "var(--color-surface-raised)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-subtle)" }}>
              <Stack gap={4}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{order.customer.name}</span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>{order.customer.email}</span>
              </Stack>
            </div>
          </section>

          {/* Line items */}
          <section>
            <SectionTitle>Items</SectionTitle>
            <Stack gap={8}>
              {order.lineItems.map((item) => (
                <LineItemRow key={item.id} item={item} currency={order.currency} />
              ))}
            </Stack>
          </section>

          {/* Totals */}
          <section>
            <div style={{ padding: "var(--space-16)", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-lg)" }}>
              <Stack gap={8}>
                <TotalRow label="Subtotal" amount={order.subtotal} currency={order.currency} />
                <TotalRow label="Tax" amount={order.tax} currency={order.currency} />
                <TotalRow label="Shipping" amount={order.shipping} currency={order.currency} />
                <div style={{ borderTop: "1px solid var(--color-border-default)", paddingTop: "var(--space-8)" }}>
                  <TotalRow label="Total" amount={order.total} currency={order.currency} bold />
                </div>
              </Stack>
            </div>
          </section>

          {/* Shipping labels */}
          {shippingLabels.length > 0 && (
            <section>
              <SectionTitle>Shipping Labels</SectionTitle>
              <ShippingLabelList labels={shippingLabels} />
            </section>
          )}
        </Stack>
      }
      secondary={
        <Stack gap={24} style={{ padding: "var(--space-24)", borderLeft: "1px solid var(--color-border-subtle)", height: "100%", overflowY: "auto", background: "var(--color-surface-raised)" }}>
          {/* Actions */}
          {availableActions.length > 0 && (
            <section>
              <SectionTitle>Actions</SectionTitle>
              <Stack gap={8}>
                {availableActions.map((action) => (
                  <OrderActionButton key={action} action={action} onClick={() => onAction(action)} />
                ))}
              </Stack>
            </section>
          )}

          {/* Timeline */}
          <section>
            <SectionTitle>Timeline</SectionTitle>
            <EventTimeline events={timeline} />
          </section>
        </Stack>
      }
    />
  );
}
