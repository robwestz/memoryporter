import { useState, useMemo } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { Member, MemberFilters, MemberAction, BulkAction } from "../types";
import { StatusBadge, FilterRow, MemberRowActions, BulkBar } from "./TeamListTableParts";

function formatLastLogin(date?: Date): string {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export type TeamListTableProps = {
  members: Member[];
  filters?: MemberFilters;
  bulkActions?: BulkAction[];
  onMemberAction: (a: MemberAction) => void;
};

export function TeamListTable({
  members,
  filters = {},
  bulkActions = [],
  onMemberAction,
}: TeamListTableProps) {
  const [localFilters, setLocalFilters] = useState<MemberFilters>(filters);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (localFilters.status && localFilters.status !== "all" && m.status !== localFilters.status) return false;
      if (localFilters.role && localFilters.role !== "all" && m.role !== localFilters.role) return false;
      if (localFilters.search) {
        const q = localFilters.search.toLowerCase();
        if (!m.email.toLowerCase().includes(q) && !(m.name ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [members, localFilters]);

  const allSelected = filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const someSelected = filtered.some((m) => selected.has(m.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((m) => m.id)));
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleBulk(action: BulkAction) {
    const ids = [...selected];
    if (action === "export") {
      onMemberAction({ type: "export", memberIds: ids });
    } else if (action === "remove") {
      ids.forEach((id) => onMemberAction({ type: "remove", memberId: id }));
    } else if (action === "change-role") {
      ids.forEach((id) => onMemberAction({ type: "change-role", memberId: id, newRole: "viewer" }));
    }
    setSelected(new Set());
  }

  return (
    <Stack gap={0} style={{ height: "100%" }}>
      <div style={{ padding: "var(--space-12) var(--space-16)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
        <Inline justify="between" align="center">
          <FilterRow filters={localFilters} onFiltersChange={setLocalFilters} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {filtered.length} member{filtered.length !== 1 ? "s" : ""}
          </span>
        </Inline>
      </div>

      <BulkBar count={selected.size} actions={someSelected ? bulkActions : []} onBulk={handleBulk} onClear={() => setSelected(new Set())} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
          <thead>
            <tr style={{ background: "var(--color-surface-sunken)", borderBottom: "1px solid var(--color-border-default)" }}>
              <th style={{ width: "var(--space-48)", padding: "var(--space-12) var(--space-16)", textAlign: "center" }}>
                <input type="checkbox" checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }} onChange={toggleAll} style={{ width: "var(--space-16)", height: "var(--space-16)", accentColor: "var(--color-accent-default)" }} aria-label="Select all" />
              </th>
              {["Member", "Role", "Status", "Last login", ""].map((h) => (
                <th key={h} style={{ padding: "var(--space-12) var(--space-16)", textAlign: "left", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "var(--space-48)", textAlign: "center", color: "var(--color-text-tertiary)" }}>
                  No members match the current filters.
                </td>
              </tr>
            ) : filtered.map((member) => (
              <tr key={member.id} style={{ borderBottom: "1px solid var(--color-border-subtle)", background: selected.has(member.id) ? "var(--color-accent-subtle)" : "transparent" }}>
                <td style={{ padding: "var(--space-12) var(--space-16)", textAlign: "center" }}>
                  <input type="checkbox" checked={selected.has(member.id)} onChange={() => toggleRow(member.id)} style={{ width: "var(--space-16)", height: "var(--space-16)", accentColor: "var(--color-accent-default)" }} aria-label={`Select ${member.email}`} />
                </td>
                <td style={{ padding: "var(--space-12) var(--space-16)" }}>
                  <div style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{member.name ?? member.email}</div>
                  {member.name && <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{member.email}</div>}
                </td>
                <td style={{ padding: "var(--space-12) var(--space-16)", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>{member.role}</td>
                <td style={{ padding: "var(--space-12) var(--space-16)" }}><StatusBadge status={member.status} /></td>
                <td style={{ padding: "var(--space-12) var(--space-16)", color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>{formatLastLogin(member.lastLoginAt)}</td>
                <td style={{ padding: "var(--space-12) var(--space-16)", textAlign: "right" }}>
                  <MemberRowActions member={member} onAction={onMemberAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Stack>
  );
}
