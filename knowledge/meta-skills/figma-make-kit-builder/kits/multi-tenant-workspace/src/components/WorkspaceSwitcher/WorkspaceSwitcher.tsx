import { useState, useRef, useEffect } from "react";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import type { Workspace } from "../types";
import { WorkspaceAvatar, WorkspaceDropdown } from "./WorkspaceDropdown";

export type WorkspaceSwitcherProps = {
  current: Workspace;
  available: Workspace[];
  onSwitch: (id: string) => void;
  onCreateNew: () => void;
  shortcut?: string;
  recentFirst?: boolean;
};

export function WorkspaceSwitcher({
  current,
  available,
  onSwitch,
  onCreateNew,
  shortcut,
  recentFirst = true,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useKeyboardShortcut(
    { key: "k", meta: true },
    (e) => { e.preventDefault(); setOpen((v) => !v); },
    !!shortcut
  );

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch workspace"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-8)",
          padding: "var(--space-8) var(--space-12)",
          background: open ? "var(--color-surface-sunken)" : "transparent",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          cursor: "pointer",
          maxWidth: "240px",
        }}
      >
        <WorkspaceAvatar workspace={current} size={24} />
        <span style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current.name}
        </span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{open ? "▲" : "▾"}</span>
        {shortcut && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", padding: "0 var(--space-4)", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-sm)" }}>
            ⌘K
          </span>
        )}
      </button>

      {open && (
        <WorkspaceDropdown
          available={available}
          current={current}
          onSwitch={onSwitch}
          onCreateNew={onCreateNew}
          recentFirst={recentFirst}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
