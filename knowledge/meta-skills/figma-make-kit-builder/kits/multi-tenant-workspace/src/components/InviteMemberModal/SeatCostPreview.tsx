import { Stack, Inline } from "@/lib/layout";

export type SeatCostPreviewProps = {
  currentSeatCount: number;
  planLimit: number;
  costPerExtraSeat: number;
  addingCount: number;
};

export function SeatCostPreview({ currentSeatCount, planLimit, costPerExtraSeat, addingCount }: SeatCostPreviewProps) {
  const newTotal = currentSeatCount + addingCount;
  const extraSeats = Math.max(0, newTotal - planLimit);
  const extraCost = extraSeats * costPerExtraSeat;
  const atCapacity = currentSeatCount >= planLimit;
  const willExceed = newTotal > planLimit;

  return (
    <div style={{ padding: "var(--space-12) var(--space-16)", borderRadius: "var(--radius-lg)", background: willExceed ? "var(--color-accent-subtle)" : "var(--color-surface-sunken)", border: `1px solid ${willExceed ? "var(--color-warning)" : "var(--color-border-subtle)"}` }}>
      <Stack gap={8}>
        <div>
          <Inline justify="between" align="center" style={{ marginBottom: "var(--space-4)" }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-text-primary)" }}>Seats</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
              {currentSeatCount} of {planLimit} used
            </span>
          </Inline>
          <div style={{ height: "var(--space-8)", background: "var(--color-border-subtle)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (newTotal / planLimit) * 100)}%`, background: willExceed ? "var(--color-danger)" : "var(--color-accent-default)", borderRadius: "var(--radius-pill)", transition: `width var(--motion-base)` }} />
          </div>
        </div>

        {willExceed ? (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)", fontWeight: 500 }}>
            Adding {addingCount} seat{addingCount !== 1 ? "s" : ""} exceeds your plan by {extraSeats}. Extra cost: <strong>${extraCost}/mo</strong>
          </div>
        ) : atCapacity ? (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-warning)" }}>
            At plan capacity. Any invite will add to your bill.
          </div>
        ) : (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
            {planLimit - newTotal} seats remaining on current plan.
          </div>
        )}
      </Stack>
    </div>
  );
}
