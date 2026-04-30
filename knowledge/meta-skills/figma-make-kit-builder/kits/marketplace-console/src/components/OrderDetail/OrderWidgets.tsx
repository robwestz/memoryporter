// Kit-local sub-components for OrderDetail.

import { Stack, Inline } from "@/lib/layout";
import type { Order, OrderAction, OrderLineItem, ShippingLabel } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmt(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(d: Date): string {
  return d.toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ─── Section title ────────────────────────────────────────────────────────────

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 var(--space-8)" }}>
      {children}
    </h3>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "var(--color-warning)", label: "Pending" },
  paid: { color: "var(--color-success)", label: "Paid" },
  processing: { color: "var(--color-info)", label: "Processing" },
  shipped: { color: "var(--color-accent-default)", label: "Shipped" },
  delivered: { color: "var(--color-success)", label: "Delivered" },
  returned: { color: "var(--color-warning)", label: "Returned" },
  refunded: { color: "var(--color-warning)", label: "Refunded" },
  cancelled: { color: "var(--color-danger)", label: "Cancelled" }
};

export function StatusPill({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { color: "var(--color-text-tertiary)", label: status };
  return (
    <span style={{ padding: "var(--space-4) var(--space-12)", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 600, color: cfg.color, background: "var(--color-surface-sunken)", border: `1px solid ${cfg.color}33` }}>
      {cfg.label}
    </span>
  );
}

// ─── Line items ───────────────────────────────────────────────────────────────

export function LineItemRow({ item, currency }: { item: OrderLineItem; currency: string }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-12)", alignItems: "center", padding: "var(--space-12)", background: "var(--color-surface-raised)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-subtle)" }}>
      {item.imageUrl && <img src={item.imageUrl} alt="" style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", objectFit: "cover" }} />}
      <Stack gap={4} style={{ flex: 1 }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{item.title}</span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Qty: {item.quantity}</span>
      </Stack>
      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{fmt(item.unitPrice * item.quantity, currency)}</span>
    </div>
  );
}

// ─── Total row ────────────────────────────────────────────────────────────────

export function TotalRow({ label, amount, currency, bold = false }: { label: string; amount: number; currency: string; bold?: boolean }) {
  return (
    <Inline justify="between">
      <span style={{ fontSize: "var(--text-sm)", fontWeight: bold ? 600 : 400, color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "var(--text-sm)", fontWeight: bold ? 700 : 500, color: "var(--color-text-primary)" }}>{fmt(amount, currency)}</span>
    </Inline>
  );
}

// ─── Shipping labels ──────────────────────────────────────────────────────────

export function ShippingLabelList({ labels }: { labels: ShippingLabel[] }) {
  return (
    <Stack gap={8}>
      {labels.map((label) => (
        <Inline key={label.id} justify="between" align="center" style={{ padding: "var(--space-8) var(--space-12)", background: "var(--color-surface-raised)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)" }}>
          <Stack gap={4}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{label.carrier}</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>{label.trackingNumber}</span>
          </Stack>
          <a href={label.labelUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-accent)" }}>Download</a>
        </Inline>
      ))}
    </Stack>
  );
}

// ─── Action labels ────────────────────────────────────────────────────────────

const actionLabels: Record<OrderAction, string> = {
  refund: "Refund", reship: "Reship", cancel: "Cancel",
  "mark-shipped": "Mark Shipped", "contact-customer": "Contact Customer", "download-label": "Download Label"
};

const actionDanger: Record<OrderAction, boolean> = {
  refund: true, reship: false, cancel: true, "mark-shipped": false, "contact-customer": false, "download-label": false
};

export function OrderActionButton({ action, onClick }: { action: OrderAction; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", fontWeight: 500, borderRadius: "var(--radius-md)", border: `1px solid ${actionDanger[action] ? "var(--color-danger)" : "var(--color-border-default)"}`, background: "var(--color-surface-base)", color: actionDanger[action] ? "var(--color-danger)" : "var(--color-text-primary)", cursor: "pointer", textAlign: "left" as const }}
    >
      {actionLabels[action]}
    </button>
  );
}
