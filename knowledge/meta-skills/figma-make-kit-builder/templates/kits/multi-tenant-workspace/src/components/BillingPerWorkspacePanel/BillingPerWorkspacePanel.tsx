import { Stack, Inline, Grid, GridItem } from "@/lib/layout";
import type { Workspace, Plan, UsageMetrics, Limits, Invoice, PaymentMethod } from "../types";
import { UsageMeterRow, StatCard, formatBytes, formatMoney, formatDate } from "./BillingParts";

export type BillingPerWorkspacePanelProps = {
  workspace: Workspace;
  currentPlan: Plan;
  usage: UsageMetrics;
  limits: Limits;
  nextInvoice: Invoice;
  paymentMethod: PaymentMethod;
  onUpgrade: () => void;
  onDowngrade: () => void;
};

export function BillingPerWorkspacePanel({ workspace, currentPlan, usage, limits, nextInvoice, paymentMethod, onUpgrade, onDowngrade }: BillingPerWorkspacePanelProps) {
  const tierBadgeColor: Record<string, string> = {
    free: "var(--color-text-tertiary)",
    starter: "var(--color-info)",
    pro: "var(--color-accent-default)",
    enterprise: "var(--color-success)",
  };

  return (
    <Stack gap={32} style={{ maxWidth: "860px", padding: "var(--space-32)" }}>
      {/* Plan header */}
      <div style={{ padding: "var(--space-24)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-xl)" }}>
        <Inline justify="between" align="start">
          <div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-4)" }}>{workspace.name}</div>
            <Inline gap={12} align="center">
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--color-text-primary)" }}>{currentPlan.name}</div>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: tierBadgeColor[currentPlan.tier] ?? "var(--color-text-secondary)", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius-pill)", border: "1px solid currentColor" }}>
                {currentPlan.tier}
              </span>
            </Inline>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-8)" }}>
              {formatMoney(currentPlan.pricePerSeat)}/seat/mo &middot; {currentPlan.billingCycle === "annual" ? "Billed annually" : "Billed monthly"}
            </div>
          </div>
          <Inline gap={8}>
            {currentPlan.tier !== "free" && (
              <button onClick={onDowngrade} style={{ padding: "var(--space-8) var(--space-16)", fontSize: "var(--text-sm)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                Downgrade
              </button>
            )}
            {currentPlan.tier !== "enterprise" && (
              <button onClick={onUpgrade} style={{ padding: "var(--space-8) var(--space-24)", fontSize: "var(--text-sm)", fontWeight: 600, border: "none", borderRadius: "var(--radius-md)", background: "var(--color-accent-default)", color: "var(--color-text-inverted)", cursor: "pointer" }}>
                Upgrade
              </button>
            )}
          </Inline>
        </Inline>
      </div>

      {/* Stats row */}
      <Grid columns={3} gap={16}>
        <GridItem>
          <StatCard label="Next invoice" value={formatMoney(nextInvoice.amount)} sub={`Due ${formatDate(nextInvoice.dueDate)}`} />
        </GridItem>
        <GridItem>
          <StatCard label="Seats" value={`${usage.seats.used} / ${limits.seats}`} sub={`${limits.seats - usage.seats.used} remaining`} />
        </GridItem>
        <GridItem>
          <StatCard
            label="Payment method"
            value={paymentMethod.type === "card" ? `${paymentMethod.brand} ···· ${paymentMethod.last4}` : paymentMethod.type}
            sub={paymentMethod.expiresAt ? `Expires ${paymentMethod.expiresAt}` : undefined}
          />
        </GridItem>
      </Grid>

      {/* Usage meters */}
      <div style={{ padding: "var(--space-24)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-xl)" }}>
        <div style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-24)", color: "var(--color-text-primary)" }}>
          Usage this period
        </div>
        <Stack gap={24}>
          <UsageMeterRow label="Seats" used={usage.seats.used} limit={limits.seats} format={(v) => `${v}`} />
          <UsageMeterRow label="Storage" used={usage.storage.usedBytes} limit={limits.storageBytes} format={formatBytes} />
          <UsageMeterRow label="API calls" used={usage.apiCalls.used} limit={limits.apiCalls} format={(v) => v.toLocaleString()} />
        </Stack>
      </div>
    </Stack>
  );
}
