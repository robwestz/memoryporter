/**
 * stubData.ts — Realistic preview data for Figma Make / local dev.
 */
import type { Workspace, Member, RoleDefinition, Plan, UsageMetrics, Limits, Invoice, PaymentMethod, Resource, Action } from "../components/types";

export const WORKSPACES: Workspace[] = [
  { id: "ws-1", name: "Acme Corp", slug: "acme-corp", planId: "pro", createdAt: new Date("2024-01-15"), lastAccessedAt: new Date() },
  { id: "ws-2", name: "Globex", slug: "globex", planId: "starter", createdAt: new Date("2024-03-22"), lastAccessedAt: new Date(Date.now() - 86400000) },
  { id: "ws-3", name: "Initech", slug: "initech", planId: "free", createdAt: new Date("2024-06-01"), lastAccessedAt: new Date(Date.now() - 3 * 86400000) },
];

export const MEMBERS: Member[] = [
  { id: "m1", email: "alice@acme.com", name: "Alice Chen", role: "admin", status: "active", lastLoginAt: new Date() },
  { id: "m2", email: "bob@acme.com", name: "Bob Smith", role: "editor", status: "active", lastLoginAt: new Date(Date.now() - 2 * 86400000) },
  { id: "m3", email: "carol@acme.com", name: "Carol White", role: "viewer", status: "invited", invitedAt: new Date(Date.now() - 86400000) },
  { id: "m4", email: "dave@acme.com", name: "Dave Kim", role: "editor", status: "suspended" },
  { id: "m5", email: "eve@external.com", role: "viewer", status: "invited", invitedAt: new Date() },
];

export const ROLE_DEF: RoleDefinition = {
  id: "editor",
  name: "Editor",
  description: "Can create and edit content, cannot manage members or billing.",
  permissions: {
    content: { read: true, write: true, delete: false, share: true },
    media: { read: true, write: true, delete: false, share: false },
    schemas: { read: true, write: false, delete: false, share: false },
    members: { read: true, write: false, delete: false, share: false },
    billing: { read: false, write: false, delete: false, share: false },
    "api-keys": { read: false, write: false, delete: false, share: false },
    webhooks: { read: false, write: false, delete: false, share: false },
  },
};

export const PLAN: Plan = {
  id: "pro", name: "Pro", tier: "pro",
  pricePerSeat: 1500, baseSeats: 5, billingCycle: "monthly",
};

export const USAGE: UsageMetrics = {
  seats: { used: 8, included: 10 },
  storage: { usedBytes: 4.2 * 1024 * 1024 * 1024, limitBytes: 10 * 1024 * 1024 * 1024 },
  apiCalls: { used: 82000, limit: 100000 },
};

export const LIMITS: Limits = { seats: 10, storageBytes: 10 * 1024 * 1024 * 1024, apiCalls: 100000 };

export const NEXT_INVOICE: Invoice = {
  id: "inv-042", amount: 13500, currency: "usd",
  dueDate: new Date(Date.now() + 12 * 86400000),
  period: { start: new Date(), end: new Date(Date.now() + 30 * 86400000) },
  status: "upcoming",
};

export const PAYMENT_METHOD: PaymentMethod = { type: "card", brand: "Visa", last4: "4242", expiresAt: "09/27" };

export const RESOURCES: Resource[] = ["content", "media", "schemas", "members", "billing", "api-keys", "webhooks"];
export const ACTIONS: Action[] = ["read", "write", "delete", "share"];
