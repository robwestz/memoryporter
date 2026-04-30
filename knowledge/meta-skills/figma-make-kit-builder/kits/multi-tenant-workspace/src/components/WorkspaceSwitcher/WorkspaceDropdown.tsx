import type { Workspace } from "../types";

export function WorkspaceAvatar({ workspace, size = 32 }: { workspace: Workspace; size?: number }) {
  if (workspace.logoUrl) {
    return (
      <img src={workspace.logoUrl} alt={workspace.name} style={{ width: size, height: size, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
    );
  }
  const initials = workspace.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: "var(--radius-md)",
        background: "var(--color-accent-subtle)",
        color: "var(--color-text-accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size > 24 ? "var(--text-sm)" : "var(--text-xs)",
        fontWeight: 700, flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

export type WorkspaceDropdownProps = {
  available: Workspace[];
  current: Workspace;
  onSwitch: (id: string) => void;
  onCreateNew: () => void;
  recentFirst: boolean;
  onClose: () => void;
};

export function WorkspaceDropdown({ available, current, onSwitch, onCreateNew, recentFirst, onClose }: WorkspaceDropdownProps) {
  const sorted = recentFirst
    ? [...available].sort((a, b) => (b.lastAccessedAt?.getTime() ?? 0) - (a.lastAccessedAt?.getTime() ?? 0))
    : available;

  return (
    <div style={{ position: "absolute", top: "calc(100% + var(--space-8))", left: 0, minWidth: "240px", background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-xl)", boxShadow: "var(--elev-3)", zIndex: "var(--z-dropdown)", overflow: "hidden" }}>
      <div style={{ padding: "var(--space-8) var(--space-16)", borderBottom: "1px solid var(--color-border-subtle)" }}>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Workspaces</span>
      </div>

      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {sorted.map((ws) => (
          <button
            key={ws.id}
            onClick={() => { onSwitch(ws.id); onClose(); }}
            style={{ width: "100%", padding: "var(--space-8) var(--space-16)", display: "flex", alignItems: "center", gap: "var(--space-12)", background: ws.id === current.id ? "var(--color-accent-subtle)" : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <WorkspaceAvatar workspace={ws} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: ws.id === current.id ? 600 : 400, color: ws.id === current.id ? "var(--color-text-accent)" : "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ws.name}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ws.slug}
              </div>
            </div>
            {ws.id === current.id && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-accent)" }}>✓</span>}
          </button>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--color-border-subtle)", padding: "var(--space-8)" }}>
        <button
          onClick={() => { onCreateNew(); onClose(); }}
          style={{ width: "100%", padding: "var(--space-8) var(--space-12)", fontSize: "var(--text-sm)", fontWeight: 500, border: "1px dashed var(--color-border-subtle)", borderRadius: "var(--radius-md)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", textAlign: "left" }}
        >
          + Create new workspace
        </button>
      </div>
    </div>
  );
}
