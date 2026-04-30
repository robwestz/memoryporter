import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { RoleDefinition, Resource, Action } from "../types";
import { PermissionCell, ResourceRowActions } from "./MatrixParts";

export type RBACPermissionsMatrixProps = {
  role: RoleDefinition;
  resources: Resource[];
  actions: Action[];
  onChange: (role: RoleDefinition) => void;
  onSave: (role: RoleDefinition) => Promise<void>;
  dirty: boolean;
};

export function RBACPermissionsMatrix({
  role,
  resources,
  actions,
  onChange,
  onSave,
  dirty,
}: RBACPermissionsMatrixProps) {
  const [saving, setSaving] = useState(false);
  const isReadOnly = !!role.isSystem;

  function togglePermission(resource: Resource, action: Action, value: boolean) {
    onChange({
      ...role,
      permissions: {
        ...role.permissions,
        [resource]: { ...role.permissions[resource], [action]: value },
      },
    });
  }

  function toggleAll(resource: Resource, value: boolean) {
    const allPerms = Object.fromEntries(actions.map((a) => [a, value])) as Partial<Record<Action, boolean>>;
    onChange({ ...role, permissions: { ...role.permissions, [resource]: allPerms } });
  }

  async function handleSave() {
    setSaving(true);
    try { await onSave(role); } finally { setSaving(false); }
  }

  return (
    <Stack gap={0} style={{ height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "var(--space-16) var(--space-24)", borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
        <Inline justify="between" align="center">
          <div>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>{role.name}</div>
            {role.description && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-4)" }}>{role.description}</div>
            )}
            {isReadOnly && (
              <div style={{ marginTop: "var(--space-8)", fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", padding: "var(--space-4) var(--space-8)", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-pill)", display: "inline-block" }}>
                System role — read only
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!dirty || saving || isReadOnly}
            style={{
              padding: "var(--space-8) var(--space-24)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              border: "none",
              borderRadius: "var(--radius-md)",
              background: dirty && !isReadOnly ? "var(--color-accent-default)" : "var(--color-surface-sunken)",
              color: dirty && !isReadOnly ? "var(--color-text-inverted)" : "var(--color-text-tertiary)",
              cursor: dirty && !isReadOnly ? "pointer" : "not-allowed",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save role"}
          </button>
        </Inline>
      </div>

      {/* Matrix */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-24)" }}>
        <div style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr style={{ background: "var(--color-surface-sunken)", borderBottom: "1px solid var(--color-border-default)" }}>
                <th style={{ padding: "var(--space-12) var(--space-16)", textAlign: "left", fontWeight: 600, color: "var(--color-text-primary)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Resource
                </th>
                <th style={{ padding: "var(--space-12) var(--space-12)", textAlign: "center", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", width: "var(--space-64)" }}>
                  All
                </th>
                {actions.map((a) => (
                  <th key={a} style={{ padding: "var(--space-12) var(--space-12)", textAlign: "center", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", width: "var(--space-64)" }}>
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => {
                const perms = role.permissions[resource] ?? {};
                return (
                  <tr key={resource} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <td style={{ padding: "var(--space-12) var(--space-16)", fontWeight: 500, color: "var(--color-text-primary)", textTransform: "capitalize" }}>
                      {resource}
                    </td>
                    <ResourceRowActions resource={resource} actions={actions} permissions={perms} onToggleAll={toggleAll} disabled={isReadOnly} />
                    {actions.map((a) => (
                      <PermissionCell key={a} checked={!!perms[a]} onChange={(v) => togglePermission(resource, a, v)} disabled={isReadOnly} resource={resource} action={a} />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Stack>
  );
}
