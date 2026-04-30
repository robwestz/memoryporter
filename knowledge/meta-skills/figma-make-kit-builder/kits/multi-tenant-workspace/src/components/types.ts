/**
 * types.ts — shared domain types for multi-tenant-workspace
 * Used by: WorkspaceSwitcher, InviteMemberModal, RBACPermissionsMatrix,
 *           BillingPerWorkspacePanel, TeamListTable
 */

// ---- Workspace -------------------------------------------------------------

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  planId: string;
  createdAt: Date;
  lastAccessedAt?: Date;
};

// ---- RBAC ------------------------------------------------------------------

export type Role = "admin" | "editor" | "viewer" | string;

export type Resource =
  | "content"
  | "media"
  | "schemas"
  | "members"
  | "billing"
  | "api-keys"
  | "webhooks"
  | string;

export type Action = "read" | "write" | "delete" | "share";

export type RoleDefinition = {
  id: string;
  name: string;
  description?: string;
  permissions: Record<Resource, Partial<Record<Action, boolean>>>;
  isSystem?: boolean; // system roles can't be deleted
};

// ---- Members ---------------------------------------------------------------

export type MemberStatus = "active" | "invited" | "suspended";

export type Member = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: Role;
  status: MemberStatus;
  lastLoginAt?: Date;
  invitedAt?: Date;
};

export type MemberFilters = {
  role?: Role | "all";
  status?: MemberStatus | "all";
  search?: string;
};

export type MemberAction =
  | { type: "change-role"; memberId: string; newRole: Role }
  | { type: "remove"; memberId: string }
  | { type: "resend-invite"; memberId: string }
  | { type: "suspend"; memberId: string }
  | { type: "export"; memberIds: string[] };

export type BulkAction = "change-role" | "remove" | "export";

// ---- Invites ---------------------------------------------------------------

export type Invite = {
  email: string;
  role: Role;
  teamId?: string;
  message?: string;
};

// ---- Billing ---------------------------------------------------------------

export type Plan = {
  id: string;
  name: string;
  tier: "free" | "starter" | "pro" | "enterprise";
  pricePerSeat: number; // USD cents/month
  baseSeats: number;
  billingCycle: "monthly" | "annual";
};

export type UsageMetrics = {
  seats: { used: number; included: number };
  storage: { usedBytes: number; limitBytes: number };
  apiCalls: { used: number; limit: number };
  bandwidth?: { usedBytes: number; limitBytes: number };
};

export type Limits = {
  seats: number;
  storageBytes: number;
  apiCalls: number;
};

export type Invoice = {
  id: string;
  amount: number; // USD cents
  currency: string;
  dueDate: Date;
  period: { start: Date; end: Date };
  status: "upcoming" | "paid" | "overdue";
};

export type PaymentMethod = {
  type: "card" | "bank" | "paypal";
  last4?: string;
  brand?: string;
  expiresAt?: string;
};
