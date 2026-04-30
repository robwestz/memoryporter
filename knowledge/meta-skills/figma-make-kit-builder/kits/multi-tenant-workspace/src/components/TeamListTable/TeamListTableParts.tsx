import { useState } from "react";
import { Inline } from "@/lib/layout";
import type { Member, MemberStatus, MemberFilters, MemberAction, BulkAction } from "../types";

// ---- StatusBadge -----------------------------------------------------------

export function StatusBadge({ status }: { status: MemberStatus }) {
  const config: Record<MemberStatus, { label: string; bg: string; color: string }> = {
    active: { label: "Active", bg: "var(--color-success)", color: "var(--color-text-inverted)" },
    invited: { label: "Invited", bg: "var(--color-warning)", color: "var(--color-text-inverted)" },
    suspended: { label: "Suspended", bg: "var(--color-danger)", color: "var(--color-text-inverted)" },
  };
  const { label, bg, color } = config[status];
  return (
    <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius-pill)", background: bg, color, textTransform: "capitalize" }}>
      {label}
    </span>
  );
}

// ---- FilterRow -------------------------------------------------------------

export type FilterRowProps = { filters: MemberFilters; onFiltersChange: (f: MemberFilters) => void };

export function FilterRow({ filters, onFiltersChange }: FilterRowProps) {
  const statuses: Array<MemberStatus | "all"> = ["all", "active", "invited", "suspended"];
  return (
    <Inline gap={8} align="center">
      <input
        value={filters.search ?? ""}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        placeholder="Search members…"
        style={{ padding: "var(--space-8) var(--space-12)", fontSize: "var(--text-sm)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", width: "200px" }}
      />
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => onFiltersChange({ ...filters, status: s === "all" ? undefined : s })}
          style={{
            padding: "var(--space-4) var(--space-12)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-pill)",
            background: (s === "all" && !filters.status) || filters.status === s ? "var(--color-accent-subtle)" : "var(--color-surface-raised)",
            color: (s === "all" && !filters.status) || filters.status === s ? "var(--color-text-accent)" : "var(--color-text-secondary)",
            cursor: "pointer",
          }}
        >
          {s}
        </button>
      ))}
    </Inline>
  );
}

// ---- MemberRowActions ------------------------------------------------------

const menuItemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "var(--space-8) var(--space-16)",
  fontSize: "var(--text-sm)",
  border: "none",
  background: "transparent",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  textAlign: "left",
  borderBottom: "1px solid var(--color-border-subtle)",
};

export type MemberRowActionsProps = { member: Member; onAction: (a: MemberAction) => void };

export function MemberRowActions({ member, onAction }: MemberRowActionsProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen((v) => !v)} style={{ padding: "var(--space-4) var(--space-8)", fontSize: "var(--text-sm)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", background: "var(--color-surface-base)", color: "var(--color-text-secondary)", cursor: "pointer" }} aria-label="Member actions">
        •••
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + var(--space-4))", background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", boxShadow: "var(--elev-2)", zIndex: "var(--z-dropdown)", minWidth: "160px", overflow: "hidden" }}>
          {member.status === "invited" && (
            <button onClick={() => { onAction({ type: "resend-invite", memberId: member.id }); setOpen(false); }} style={menuItemStyle}>Resend invite</button>
          )}
          <button onClick={() => { onAction({ type: "change-role", memberId: member.id, newRole: "viewer" }); setOpen(false); }} style={menuItemStyle}>Change role</button>
          {member.status !== "suspended" && (
            <button onClick={() => { onAction({ type: "suspend", memberId: member.id }); setOpen(false); }} style={{ ...menuItemStyle, color: "var(--color-warning)" }}>Suspend</button>
          )}
          <button onClick={() => { onAction({ type: "remove", memberId: member.id }); setOpen(false); }} style={{ ...menuItemStyle, color: "var(--color-danger)" }}>Remove</button>
        </div>
      )}
    </div>
  );
}

// ---- BulkBar ---------------------------------------------------------------

export type BulkBarProps = {
  count: number;
  actions: BulkAction[];
  onBulk: (a: BulkAction) => void;
  onClear: () => void;
};

export function BulkBar({ count, actions, onBulk, onClear }: BulkBarProps) {
  if (count === 0) return null;
  return (
    <div style={{ padding: "var(--space-8) var(--space-16)", background: "var(--color-accent-subtle)", borderBottom: "1px solid var(--color-border-subtle)" }}>
      <Inline gap={8} align="center">
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-accent)" }}>{count} selected</span>
        {actions.map((a) => (
          <button key={a} onClick={() => onBulk(a)} style={{ padding: "var(--space-4) var(--space-12)", fontSize: "var(--text-xs)", fontWeight: 500, border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", background: "var(--color-surface-overlay)", color: a === "remove" ? "var(--color-danger)" : "var(--color-text-primary)", cursor: "pointer", textTransform: "capitalize" }}>
            {a}
          </button>
        ))}
        <button onClick={onClear} style={{ marginLeft: "auto", fontSize: "var(--text-xs)", border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>Clear</button>
      </Inline>
    </div>
  );
}
