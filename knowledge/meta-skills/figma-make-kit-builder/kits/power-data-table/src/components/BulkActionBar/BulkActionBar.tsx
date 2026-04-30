import { Inline } from "@/lib/layout";
import type { BulkAction } from "../types";

type BulkActionBarProps = {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (id: string) => void;
  onClearSelection: () => void;
};

export function BulkActionBar({
  selectedCount,
  actions,
  onAction,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label={`${selectedCount} rows selected`}
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--z-sticky)",
        background: "var(--color-accent-default)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-8) var(--space-16)",
        boxShadow: "var(--elev-2)",
        marginBottom: "var(--space-8)",
      }}
    >
      <Inline gap={8} align="center" justify="between">
        {/* Count + clear */}
        <Inline gap={8} align="center">
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-inverted)",
            }}
          >
            {selectedCount} selected
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Clear selection"
            style={clearButtonStyle}
          >
            Clear
          </button>
        </Inline>

        {/* Actions */}
        <Inline gap={8}>
          {actions.map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              onAction={onAction}
            />
          ))}
        </Inline>
      </Inline>
    </div>
  );
}

// --- Sub-component ---

type ActionButtonProps = {
  action: BulkAction;
  onAction: (id: string) => void;
};

function ActionButton({ action, onAction }: ActionButtonProps) {
  const isGated = !!action.requiresPlan;
  const isDisabled = !!action.disabledReason;

  const handleClick = () => {
    if (isDisabled) return;
    if (isGated) {
      // Surface upgrade prompt — in a real implementation, emit an event
      // that the parent handles to show an upgrade modal
      onAction(`__upgrade__:${action.id}`);
      return;
    }
    onAction(action.id);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        title={action.disabledReason}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          background: isGated
            ? "var(--color-accent-subtle)"
            : "var(--color-surface-overlay)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4) var(--space-12)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          color: isGated
            ? "var(--color-accent-default)"
            : "var(--color-text-primary)",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          transition: `background var(--motion-fast)`,
        }}
      >
        {action.icon && <action.icon size={14} />}
        {action.label}
        {isGated && (
          <ProBadge plan={action.requiresPlan ?? "pro"} />
        )}
      </button>
    </div>
  );
}

function ProBadge({ plan }: { plan: string }) {
  return (
    <span
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--color-accent-default)",
        background: "var(--color-accent-subtle)",
        borderRadius: "var(--radius-pill)",
        padding: "0 var(--space-4)",
        marginLeft: "var(--space-4)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {plan}
    </span>
  );
}

const clearButtonStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--color-border-strong)",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  fontSize: "var(--text-xs)",
  color: "var(--color-text-inverted)",
  padding: "var(--space-4) var(--space-8)",
};
