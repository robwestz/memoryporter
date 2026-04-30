// Domain types — marketplace-console
// All shared across the 5 headline components.

export type ListingStatus = "draft" | "active" | "paused" | "sold";

export type Listing = {
  id: string;
  title: string;
  status: ListingStatus;
  price: number;
  currency: string;
  inventory: number;
  views: number;
  conversionRate: number; // 0–1
  revenue7d: number;
  imageUrl?: string;
  category: string;
  updatedAt: Date;
};

export type ListingFilters = {
  status?: ListingStatus | ListingStatus[];
  lowStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  category?: string;
};

export type BulkAction = "pause" | "activate" | "adjust-price" | "duplicate" | "export" | "delete";

export type Metric = "views" | "conversion" | "revenue-7d" | "inventory";

export type ListingAction =
  | { type: "bulk"; action: BulkAction; ids: string[] }
  | { type: "single"; action: BulkAction; id: string }
  | { type: "edit"; id: string };

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "returned"
  | "refunded"
  | "cancelled";

export type OrderLineItem = {
  id: string;
  listingId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  customer: { name: string; email: string; id: string };
  lineItems: OrderLineItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod: string;
  shippingAddress: Address;
  shippingLabels?: ShippingLabel[];
};

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderEventType =
  | "created"
  | "paid"
  | "processing"
  | "label-created"
  | "shipped"
  | "in-transit"
  | "out-for-delivery"
  | "delivered"
  | "return-requested"
  | "returned"
  | "refunded"
  | "cancelled"
  | "note";

export type OrderEvent = {
  id: string;
  type: OrderEventType;
  timestamp: Date;
  description: string;
  actor?: string; // system | seller | buyer
  metadata?: Record<string, string>;
};

export type OrderAction =
  | "refund"
  | "reship"
  | "cancel"
  | "mark-shipped"
  | "contact-customer"
  | "download-label";

export type ShippingLabel = {
  id: string;
  carrier: string;
  trackingNumber: string;
  labelUrl: string;
  createdAt: Date;
};

// ─── Dispute ─────────────────────────────────────────────────────────────────

export type DisputeStatus =
  | "open"
  | "seller-responded"
  | "under-review"
  | "resolved-buyer"
  | "resolved-seller"
  | "escalated";

export type Dispute = {
  id: string;
  orderId: string;
  status: DisputeStatus;
  reason: string;
  openedAt: Date;
  slaDeadline: Date;
};

export type Claim = {
  text: string;
  submittedAt: Date;
  requestedResolution: "refund" | "replacement" | "partial-refund";
};

export type DisputeResponse = {
  text: string;
  submittedAt: Date;
};

export type EvidenceType = "screenshot" | "tracking" | "chat-log" | "document" | "photo";

export type Evidence = {
  id: string;
  type: EvidenceType;
  filename: string;
  url: string;
  uploadedBy: "buyer" | "seller";
  uploadedAt: Date;
  size: number; // bytes
};

export type DecisionType = "accept" | "contest" | "escalate" | "partial-refund";

export type Decision = {
  type: DecisionType;
  note?: string;
  refundAmount?: number;
};

export type Duration = {
  hours: number;
  minutes: number;
  seconds: number;
};

// ─── Payout ──────────────────────────────────────────────────────────────────

export type PayoutStatus = "pending" | "processing" | "completed" | "failed" | "on-hold";

export type PayoutMethod = "bank-transfer" | "paypal" | "stripe" | "check";

export type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: PayoutMethod;
  initiatedAt: Date;
  completedAt?: Date;
  orderIds: string[];
  reference: string;
};

export type PayoutFilters = {
  period?: "last-30-days" | "last-90-days" | "last-year" | "custom";
  dateFrom?: Date;
  dateTo?: Date;
  status?: PayoutStatus;
  method?: PayoutMethod;
};

export type ExportFormat = "csv" | "excel" | "pdf" | "json";

// ─── Review ──────────────────────────────────────────────────────────────────

export type ReviewStatus = "published" | "flagged" | "removed" | "pending";

export type Review = {
  id: string;
  listingId: string;
  listingTitle: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  submittedAt: Date;
  status: ReviewStatus;
  respondedAt?: Date;
  response?: string;
  helpfulCount: number;
};

export type ReviewFilters = {
  rating?: (1 | 2 | 3 | 4 | 5)[];
  respondedTo?: boolean;
  status?: ReviewStatus;
  dateFrom?: Date;
};
