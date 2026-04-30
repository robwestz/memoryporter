# Components — marketplace-console

Seller/operator ops console for a marketplace (two-sided platform). Target
user: merchants managing listings, orders, disputes, payouts, reviews.
Not the buyer-facing site.

## ListingsManager

**Usage** — Primary surface at `/listings`. Virtualized table of all listings
with status (draft/active/paused/sold), price, inventory, views, conversion.
Composes `PowerDataTable` primitives with listing-specific inline editors.

**Semantic purpose** — The operator's inventory view. One row per listing,
columns are the operator's decision dimensions (is it selling? is it in
stock? is it priced right?).

**Examples**

Correct:

```tsx
<ListingsManager
  listings={listings}
  filters={{ status: "active", lowStock: true }}
  bulkActions={["pause", "adjust-price", "duplicate", "export"]}
  onListingAction={handleListingAction}
  showMetrics={["views", "conversion", "revenue-7d"]}
/>
```

Incorrect:

```tsx
<ListingsManager listings={listings} />
```

*Why wrong:* Sellers with 500+ listings need status/stock filters and bulk
price adjustment. Without those, the table is decorative.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `listings` | `Listing[]` | yes | — | Full list |
| `filters` | `ListingFilters` | no | `{}` | Status, stock, price range |
| `bulkActions` | `BulkAction[]` | no | `[]` | Multi-select ops |
| `onListingAction` | `(a: ListingAction) => void` | yes | — | Handler |
| `showMetrics` | `Metric[]` | no | `[]` | Optional metric columns |

---

## OrderDetail

**Usage** — At `/orders/:id`. Full order view with timeline, line items,
customer contact, shipping status, payment status, fulfillment actions. Pairs
with `OrderTimeline` (left) and `OrderActionsPanel` (right).

**Semantic purpose** — The authoritative order record. Shows state (paid,
fulfilled, shipped, delivered, returned), not just static contents.

**Examples**

Correct:

```tsx
<OrderDetail
  order={order}
  timeline={orderEvents}
  availableActions={computeActions(order)}
  onAction={handleOrderAction}
  shippingLabels={shippingLabels}
/>
```

Incorrect:

```tsx
<OrderDetail orderId={id} />
```

*Why wrong:* No timeline, no actions, no state awareness = read-only receipt.
The operator needs the full context *and* the ability to act on it (refund,
reship, contact customer).

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `order` | `Order` | yes | — | Full order record |
| `timeline` | `OrderEvent[]` | yes | — | Chronological event log |
| `availableActions` | `OrderAction[]` | yes | — | Computed per state |
| `onAction` | `(a: OrderAction) => void` | yes | — | Handler |
| `shippingLabels` | `ShippingLabel[]` | no | `[]` | Attached labels |

---

## DisputeResolutionPanel

**Usage** — At `/disputes/:id`. Two-sided view: buyer's claim + seller's
response + mediator timeline. Evidence upload (screenshots, tracking, chat
logs). Decision buttons (accept, contest, escalate).

**Semantic purpose** — A dispute is a structured disagreement with a defined
resolution path. The panel surfaces both sides + evidence + the state
machine, not just a free-form chat.

**Examples**

Correct:

```tsx
<DisputeResolutionPanel
  dispute={dispute}
  buyerClaim={buyerClaim}
  sellerResponse={sellerResponse}
  evidence={evidence}
  onEvidenceAdd={uploadEvidence}
  onDecision={submitDecision}
  slaRemaining={slaRemaining}
/>
```

Incorrect:

```tsx
<DisputeResolutionPanel disputeId={id} />
```

*Why wrong:* Disputes require evidence handling and SLA visibility. Without
the deadline and evidence panel, operators miss response windows.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `dispute` | `Dispute` | yes | — | Full record |
| `buyerClaim` | `Claim` | yes | — | Buyer's side |
| `sellerResponse` | `Response \| null` | yes | — | Seller's side (may be null) |
| `evidence` | `Evidence[]` | yes | — | Attached proofs |
| `onEvidenceAdd` | `(e: File) => Promise<void>` | yes | — | Uploader |
| `onDecision` | `(d: Decision) => void` | yes | — | Submit resolution |
| `slaRemaining` | `Duration` | yes | — | For countdown |

---

## PayoutsLedger

**Usage** — At `/payouts`. Table of all payouts (date, amount, status, method).
Per-row expansion shows the orders rolled into that payout. Export for
accounting.

**Semantic purpose** — The financial truth between platform and seller. Every
row is an auditable transaction.

**Examples**

Correct:

```tsx
<PayoutsLedger
  payouts={payouts}
  filters={{ period: "last-90-days", status: "completed" }}
  onExport={exportForAccounting}
  onRowExpand={showOrdersInPayout}
/>
```

Incorrect:

```tsx
<PayoutsLedger payouts={payouts} />
```

*Why wrong:* No period filter = unusable at 200+ payouts. No export = sellers
re-type data into accounting. Both are daily operator needs.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `payouts` | `Payout[]` | yes | — | Full list |
| `filters` | `PayoutFilters` | no | `{}` | Period, status, method |
| `onExport` | `(format: ExportFormat) => void` | yes | — | Accounting export |
| `onRowExpand` | `(payoutId: string) => void` | yes | — | Show included orders |

---

## ReviewManagerTable

**Usage** — At `/reviews`. Incoming reviews with star rating, text, date,
product. Per-row actions: respond, flag, request edit. Pairs with
`ReviewResponseEditor`.

**Semantic purpose** — Reviews as operator responsibility, not passive display.
Responding to low-star reviews is a retention tool.

**Examples**

Correct:

```tsx
<ReviewManagerTable
  reviews={reviews}
  filters={{ rating: [1, 2, 3], respondedTo: false }}
  onRespond={openResponseEditor}
  onFlag={flagInappropriate}
/>
```

Incorrect:

```tsx
<ReviewManagerTable reviews={reviews} />
```

*Why wrong:* No filter on unresponded / low-rated = operators don't know
where to focus. The table is the triage surface.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `reviews` | `Review[]` | yes | — | Full list |
| `filters` | `ReviewFilters` | no | `{}` | Rating, responded, date |
| `onRespond` | `(id: string) => void` | yes | — | Opens editor |
| `onFlag` | `(id: string, reason: string) => void` | yes | — | Flag inappropriate |

---

## Monetization patterns enforced

- **Social/trust signals** — `ReviewManagerTable`, `RatingAggregateCard`,
  `VerificationBadge` on listings
- **Data export / portability** — `PayoutsLedger` export, listings export,
  orders export (accounting-format)
- **Abandoned-state rescue** — `AbandonedStateTile` on dashboard for
  unfinished listing drafts
- **Workspace/brand-per-customer** — brand customization for seller's storefront
  (white-label under paid tier)
