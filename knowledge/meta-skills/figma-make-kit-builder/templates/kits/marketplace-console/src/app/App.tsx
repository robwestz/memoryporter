import { useState } from "react";
import { Stack, Inline, Split } from "@/lib/layout";
import { createStore } from "@/lib/store/createStore";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { ListingsManager } from "../components/ListingsManager";
import { OrderDetail } from "../components/OrderDetail";
import { DisputeResolutionPanel } from "../components/DisputeResolutionPanel";
import { PayoutsLedger } from "../components/PayoutsLedger";
import { ReviewManagerTable } from "../components/ReviewManagerTable";
import type {
  Listing,
  Order,
  OrderEvent,
  Dispute,
  Claim,
  DisputeResponse,
  Evidence,
  Payout,
  Review,
  Duration,
  ListingAction,
  OrderAction,
  Decision,
  ExportFormat
} from "../components/types";

// ─── App store ────────────────────────────────────────────────────────────────

type AppState = {
  activeTab: "listings" | "orders" | "disputes" | "payouts" | "reviews";
};

const appStore = createStore<AppState>({ activeTab: "listings" });

// ─── Stub data ────────────────────────────────────────────────────────────────

const LISTINGS: Listing[] = [
  { id: "l1", title: "Handcrafted Leather Wallet", status: "active", price: 79.99, currency: "USD", inventory: 12, views: 1840, conversionRate: 0.032, revenue7d: 319.96, category: "Accessories", updatedAt: new Date("2026-04-10") },
  { id: "l2", title: "Ceramic Pour-Over Coffee Set", status: "active", price: 124.00, currency: "USD", inventory: 3, views: 2310, conversionRate: 0.018, revenue7d: 496.00, category: "Kitchen", updatedAt: new Date("2026-04-12") },
  { id: "l3", title: "Vintage Denim Jacket — M", status: "paused", price: 155.00, currency: "USD", inventory: 1, views: 980, conversionRate: 0.010, revenue7d: 0, category: "Clothing", updatedAt: new Date("2026-04-08") },
  { id: "l4", title: "Artisan Candle Bundle", status: "draft", price: 34.99, currency: "USD", inventory: 25, views: 0, conversionRate: 0, revenue7d: 0, category: "Home", updatedAt: new Date("2026-04-14") },
  { id: "l5", title: "Mechanical Keyboard — TKL", status: "sold", price: 249.00, currency: "USD", inventory: 0, views: 5420, conversionRate: 0.004, revenue7d: 0, category: "Tech", updatedAt: new Date("2026-03-30") }
];

const ORDER_EVENTS: OrderEvent[] = [
  { id: "e1", type: "created", timestamp: new Date("2026-04-12T09:00:00"), description: "Order placed by customer", actor: "buyer" },
  { id: "e2", type: "paid", timestamp: new Date("2026-04-12T09:01:30"), description: "Payment confirmed via Stripe", actor: "system" },
  { id: "e3", type: "processing", timestamp: new Date("2026-04-12T10:00:00"), description: "Order is being prepared", actor: "system" },
  { id: "e4", type: "label-created", timestamp: new Date("2026-04-13T08:00:00"), description: "Shipping label created — USPS Priority", actor: "seller" },
  { id: "e5", type: "shipped", timestamp: new Date("2026-04-13T14:30:00"), description: "Package dropped at post office", actor: "seller" }
];

const SAMPLE_ORDER: Order = {
  id: "ord-001",
  number: "MC-00421",
  status: "shipped",
  customer: { name: "Sarah Johnson", email: "sarah@example.com", id: "cust-42" },
  lineItems: [
    { id: "li1", listingId: "l1", title: "Handcrafted Leather Wallet", quantity: 1, unitPrice: 79.99 },
    { id: "li2", listingId: "l2", title: "Ceramic Pour-Over Coffee Set", quantity: 1, unitPrice: 124.00 }
  ],
  subtotal: 203.99,
  tax: 16.32,
  shipping: 9.99,
  total: 230.30,
  currency: "USD",
  createdAt: new Date("2026-04-12T09:00:00"),
  updatedAt: new Date("2026-04-13T14:30:00"),
  paymentMethod: "Visa ····4242",
  shippingAddress: { line1: "123 Main St", city: "Portland", state: "OR", postalCode: "97201", country: "US" },
  shippingLabels: []
};

const SAMPLE_DISPUTE: Dispute = {
  id: "dsp-00091",
  orderId: "ord-001",
  status: "seller-responded",
  reason: "Item not as described",
  openedAt: new Date("2026-04-14T10:00:00"),
  slaDeadline: new Date("2026-04-17T10:00:00")
};

const BUYER_CLAIM: Claim = {
  text: "The wallet I received has visible scratches on the leather and the stitching is uneven. This does not match the product photos. I'm requesting a full refund.",
  submittedAt: new Date("2026-04-14T10:00:00"),
  requestedResolution: "refund"
};

const SELLER_RESPONSE: DisputeResponse = {
  text: "The scratches mentioned are part of the natural leather texture shown in photos 3 and 4. Stitching is hand-done and slight variation is expected — all items are quality-checked before shipping. I'm happy to offer a $15 partial refund as goodwill.",
  submittedAt: new Date("2026-04-14T18:30:00")
};

const EVIDENCE: Evidence[] = [
  { id: "ev1", type: "screenshot", filename: "buyer-photo-received-item.jpg", url: "#", uploadedBy: "buyer", uploadedAt: new Date("2026-04-14T10:05:00"), size: 482000 },
  { id: "ev2", type: "photo", filename: "seller-listing-photos-original.zip", url: "#", uploadedBy: "seller", uploadedAt: new Date("2026-04-14T18:35:00"), size: 1240000 }
];

const SLA_REMAINING: Duration = { hours: 47, minutes: 23, seconds: 11 };

const PAYOUTS: Payout[] = [
  { id: "pay1", amount: 1240.50, currency: "USD", status: "completed", method: "bank-transfer", initiatedAt: new Date("2026-04-01"), completedAt: new Date("2026-04-03"), orderIds: ["ord-001", "ord-002", "ord-003"], reference: "PAY-2604-0001" },
  { id: "pay2", amount: 890.00, currency: "USD", status: "completed", method: "stripe", initiatedAt: new Date("2026-03-15"), completedAt: new Date("2026-03-17"), orderIds: ["ord-004", "ord-005"], reference: "PAY-2603-0015" },
  { id: "pay3", amount: 320.00, currency: "USD", status: "processing", method: "bank-transfer", initiatedAt: new Date("2026-04-14"), orderIds: ["ord-006"], reference: "PAY-2604-0014" },
  { id: "pay4", amount: 55.00, currency: "USD", status: "failed", method: "paypal", initiatedAt: new Date("2026-04-10"), orderIds: ["ord-007"], reference: "PAY-2604-0010" }
];

const REVIEWS: Review[] = [
  { id: "rev1", listingId: "l1", listingTitle: "Handcrafted Leather Wallet", authorName: "Mark T.", rating: 2, text: "Stitching came undone after 2 weeks. Expected better quality for the price.", submittedAt: new Date("2026-04-13"), status: "published", helpfulCount: 3 },
  { id: "rev2", listingId: "l2", listingTitle: "Ceramic Pour-Over Coffee Set", authorName: "Emily R.", rating: 5, text: "Absolutely beautiful! Makes a perfect gift. The glazing is gorgeous.", submittedAt: new Date("2026-04-12"), status: "published", respondedAt: new Date("2026-04-12"), response: "Thank you, Emily! So glad you love it.", helpfulCount: 12 },
  { id: "rev3", listingId: "l1", listingTitle: "Handcrafted Leather Wallet", authorName: "Anonymous", rating: 1, text: "Buy me cheap watch for cheap price. Click link.", submittedAt: new Date("2026-04-11"), status: "flagged", helpfulCount: 0 }
];

// ─── Navigation ───────────────────────────────────────────────────────────────

const TABS: Array<{ id: AppState["activeTab"]; label: string; badge?: number }> = [
  { id: "listings", label: "Listings" },
  { id: "orders", label: "Orders" },
  { id: "disputes", label: "Disputes", badge: 1 },
  { id: "payouts", label: "Payouts" },
  { id: "reviews", label: "Reviews", badge: 1 }
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const activeTab = appStore.use((s) => s.activeTab);

  // Keyboard nav: 1–5 to jump between tabs
  useKeyboardShortcut({ key: "1", alt: true }, () => appStore.setState({ activeTab: "listings" }));
  useKeyboardShortcut({ key: "2", alt: true }, () => appStore.setState({ activeTab: "orders" }));
  useKeyboardShortcut({ key: "3", alt: true }, () => appStore.setState({ activeTab: "disputes" }));
  useKeyboardShortcut({ key: "4", alt: true }, () => appStore.setState({ activeTab: "payouts" }));
  useKeyboardShortcut({ key: "5", alt: true }, () => appStore.setState({ activeTab: "reviews" }));

  function handleListingAction(action: ListingAction) {
    console.log("Listing action:", action);
  }

  function handleOrderAction(action: OrderAction) {
    console.log("Order action:", action);
  }

  async function handleEvidenceAdd(file: File) {
    console.log("Uploading evidence:", file.name);
    await new Promise((r) => setTimeout(r, 1000));
  }

  function handleDecision(decision: Decision) {
    console.log("Dispute decision:", decision);
  }

  function handleExport(format: ExportFormat) {
    console.log("Export payouts as:", format);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--color-surface-base)" }}>
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-surface-raised)",
          boxShadow: "var(--elev-1)",
          zIndex: "var(--z-sticky)"
        }}
      >
        <Inline justify="between" align="center" style={{ padding: "0 var(--space-24)", height: 56 }}>
          <span style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Seller Console
          </span>
          <Inline gap={4}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => appStore.setState({ activeTab: tab.id })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  padding: "var(--space-8) var(--space-16)",
                  fontSize: "var(--text-sm)",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: activeTab === tab.id ? "var(--color-accent-subtle)" : "transparent",
                  color: activeTab === tab.id ? "var(--color-text-accent)" : "var(--color-text-secondary)",
                  cursor: "pointer"
                }}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 700,
                      padding: "2px var(--space-4)",
                      borderRadius: "var(--radius-pill)",
                      background: "var(--color-danger)",
                      color: "var(--color-text-inverted)",
                      lineHeight: 1
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </Inline>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            Alt+1–5 to navigate
          </span>
        </Inline>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "listings" && (
          <ListingsManager
            listings={LISTINGS}
            filters={{ status: undefined }}
            bulkActions={["pause", "activate", "adjust-price", "duplicate", "export", "delete"]}
            onListingAction={handleListingAction}
            showMetrics={["views", "conversion", "revenue-7d"]}
          />
        )}

        {activeTab === "orders" && (
          <OrderDetail
            order={SAMPLE_ORDER}
            timeline={ORDER_EVENTS}
            availableActions={["contact-customer", "download-label", "refund"]}
            onAction={handleOrderAction}
            shippingLabels={[{ id: "sl1", carrier: "USPS Priority", trackingNumber: "9400111899223452685246", labelUrl: "#", createdAt: new Date("2026-04-13") }]}
          />
        )}

        {activeTab === "disputes" && (
          <DisputeResolutionPanel
            dispute={SAMPLE_DISPUTE}
            buyerClaim={BUYER_CLAIM}
            sellerResponse={SELLER_RESPONSE}
            evidence={EVIDENCE}
            onEvidenceAdd={handleEvidenceAdd}
            onDecision={handleDecision}
            slaRemaining={SLA_REMAINING}
          />
        )}

        {activeTab === "payouts" && (
          <PayoutsLedger
            payouts={PAYOUTS}
            filters={{ period: "last-90-days" }}
            onExport={handleExport}
            onRowExpand={(id) => console.log("Expand payout:", id)}
          />
        )}

        {activeTab === "reviews" && (
          <ReviewManagerTable
            reviews={REVIEWS}
            filters={{ respondedTo: false }}
            onRespond={(id) => console.log("Open respond editor:", id)}
            onFlag={(id, reason) => console.log("Flag review:", id, reason)}
          />
        )}
      </div>
    </div>
  );
}
