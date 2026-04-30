import type { Resource, Action } from "../types";

const cellStyle: React.CSSProperties = {
  padding: "var(--space-8) var(--space-12)",
  textAlign: "center",
  borderBottom: "1px solid var(--color-border-subtle)",
};

const checkboxStyle: React.CSSProperties = {
  width: "var(--space-16)",
  height: "var(--space-16)",
  accentColor: "var(--color-accent-default)",
};

// ---- PermissionCell --------------------------------------------------------

export type PermissionCellProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
  resource: Resource;
  action: Action;
};

export function PermissionCell({ checked, onChange, disabled, resource, action }: PermissionCellProps) {
  return (
    <td style={cellStyle}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={`${action} on ${resource}`}
        style={{ ...checkboxStyle, cursor: disabled ? "not-allowed" : "pointer" }}
      />
    </td>
  );
}

// ---- ResourceRowActions ----------------------------------------------------

export type ResourceRowActionsProps = {
  resource: Resource;
  actions: Action[];
  permissions: Partial<Record<Action, boolean>>;
  onToggleAll: (resource: Resource, val: boolean) => void;
  disabled: boolean;
};

export function ResourceRowActions({ resource, actions, permissions, onToggleAll, disabled }: ResourceRowActionsProps) {
  const allChecked = actions.every((a) => !!permissions[a]);
  const someChecked = actions.some((a) => !!permissions[a]);

  return (
    <td style={cellStyle}>
      <input
        type="checkbox"
        checked={allChecked}
        ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
        disabled={disabled}
        onChange={(e) => onToggleAll(resource, e.target.checked)}
        aria-label={`Toggle all for ${resource}`}
        style={{ ...checkboxStyle, cursor: disabled ? "not-allowed" : "pointer" }}
      />
    </td>
  );
}
