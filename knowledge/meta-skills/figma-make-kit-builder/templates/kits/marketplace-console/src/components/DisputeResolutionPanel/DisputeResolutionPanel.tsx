import { Stack, Inline, Split } from "@/lib/layout";
import { EventTimeline } from "../_shared/EventTimeline";
import { SlaCountdown, EvidenceList, DecisionPanel } from "./DisputeWidgets";
import type {
  Dispute,
  Claim,
  DisputeResponse,
  Evidence,
  Decision,
  Duration,
  OrderEvent
} from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type DisputeResolutionPanelProps = {
  dispute: Dispute;
  buyerClaim: Claim;
  sellerResponse: DisputeResponse | null;
  evidence: Evidence[];
  onEvidenceAdd: (file: File) => Promise<void>;
  onDecision: (decision: Decision) => void;
  slaRemaining: Duration;
};

// ─── Local helpers ────────────────────────────────────────────────────────────

function ClaimBlock({ title, text, meta, side }: { title: string; text: string; meta: string; side: "buyer" | "seller" }) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ padding: "var(--space-16)", borderRadius: "var(--radius-lg)", border: `1px solid ${side === "buyer" ? "var(--color-warning)" : "var(--color-info)"}22`, background: "var(--color-surface-raised)" }}>
        <Stack gap={8}>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-primary)", lineHeight: "var(--lh-base)" }}>{text}</p>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{meta}</span>
        </Stack>
      </div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 var(--space-8)" }}>
      {children}
    </h3>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// Convert dispute events to OrderEvent shape for EventTimeline
function toTimelineEvents(dispute: Dispute, claim: Claim, response: DisputeResponse | null): OrderEvent[] {
  const events: OrderEvent[] = [
    { id: "dispute-opened", type: "created", timestamp: dispute.openedAt, description: `Dispute opened: ${dispute.reason}`, actor: "buyer" },
    { id: "claim-submitted", type: "note", timestamp: claim.submittedAt, description: `Buyer claimed: ${claim.requestedResolution}`, actor: "buyer" }
  ];
  if (response) {
    events.push({ id: "seller-responded", type: "note", timestamp: response.submittedAt, description: "Seller submitted response", actor: "seller" });
  }
  return events;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DisputeResolutionPanel({
  dispute,
  buyerClaim,
  sellerResponse,
  evidence,
  onEvidenceAdd,
  onDecision,
  slaRemaining
}: DisputeResolutionPanelProps) {
  const timelineEvents = toTimelineEvents(dispute, buyerClaim, sellerResponse);

  return (
    <Split
      direction="horizontal"
      primarySize="55%"
      primary={
        <Stack gap={24} style={{ padding: "var(--space-24)", overflowY: "auto", height: "100%" }}>
          {/* Header */}
          <Inline justify="between" align="start">
            <Stack gap={4}>
              <span style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                Dispute #{dispute.id.slice(0, 8)}
              </span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                Order {dispute.orderId} · {dispute.reason}
              </span>
            </Stack>
            <SlaCountdown initial={slaRemaining} />
          </Inline>

          {/* Buyer claim */}
          <ClaimBlock
            title="Buyer Claim"
            text={buyerClaim.text}
            meta={`Submitted ${formatDate(buyerClaim.submittedAt)} · Requesting ${buyerClaim.requestedResolution}`}
            side="buyer"
          />

          {/* Seller response */}
          {sellerResponse ? (
            <ClaimBlock
              title="Seller Response"
              text={sellerResponse.text}
              meta={`Submitted ${formatDate(sellerResponse.submittedAt)}`}
              side="seller"
            />
          ) : (
            <div style={{ padding: "var(--space-16)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border-default)", textAlign: "center" }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>No seller response yet</span>
            </div>
          )}

          {/* Evidence */}
          <section>
            <SectionTitle>Evidence ({evidence.length})</SectionTitle>
            <EvidenceList items={evidence} onAdd={onEvidenceAdd} />
          </section>

          {/* Decision */}
          <section>
            <SectionTitle>Resolution</SectionTitle>
            <div style={{ padding: "var(--space-16)", background: "var(--color-surface-raised)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-subtle)" }}>
              <DecisionPanel onDecision={onDecision} />
            </div>
          </section>
        </Stack>
      }
      secondary={
        <Stack gap={16} style={{ padding: "var(--space-24)", borderLeft: "1px solid var(--color-border-subtle)", height: "100%", overflowY: "auto", background: "var(--color-surface-raised)" }}>
          <SectionTitle>Dispute Timeline</SectionTitle>
          <EventTimeline events={timelineEvents} />
        </Stack>
      }
    />
  );
}
