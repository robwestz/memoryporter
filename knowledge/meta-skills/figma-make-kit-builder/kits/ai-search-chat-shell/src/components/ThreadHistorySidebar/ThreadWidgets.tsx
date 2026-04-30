// Kit-local sub-components for ThreadHistorySidebar.

import { useState } from "react";
import { Stack, Inline } from "@/lib/layout";
import type { Thread } from "../types";

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function isThisWeek(d: Date): boolean {
  return d >= new Date(Date.now() - 7 * 86400000);
}

export function formatRelative(d: Date): string {
  if (isToday(d)) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (isThisWeek(d)) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Thread item ──────────────────────────────────────────────────────────────

export function ThreadItem({
  thread,
  active,
  onSelect,
  onPin
}: {
  thread: Thread;
  active: boolean;
  onSelect: () => void;
  onPin: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      style={{ display: "flex", alignItems: "center", gap: "var(--space-8)", padding: "var(--space-8) var(--space-12)", borderRadius: "var(--radius-md)", background: active ? "var(--color-accent-subtle)" : hovered ? "var(--color-surface-sunken)" : "transparent", cursor: "pointer", transition: "background var(--motion-fast)" }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onPin(); }}
        title={thread.pinned ? "Unpin" : "Pin"}
        style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: thread.pinned ? "var(--color-accent-default)" : hovered ? "var(--color-text-tertiary)" : "transparent", cursor: "pointer", fontSize: "var(--text-xs)", flexShrink: 0, padding: 0 }}
      >
        {thread.pinned ? "📌" : "⊙"}
      </button>
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Inline justify="between" align="center">
          <span style={{ fontSize: "var(--text-sm)", fontWeight: active ? 600 : 400, color: active ? "var(--color-text-accent)" : "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {thread.title}
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", flexShrink: 0, marginLeft: "var(--space-4)" }}>
            {formatRelative(thread.lastActivity)}
          </span>
        </Inline>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {thread.preview}
        </span>
      </Stack>
    </div>
  );
}

// ─── Section group ────────────────────────────────────────────────────────────

export function SectionGroup({ title, threads, activeThreadId, onSelect, onPin }: {
  title: string;
  threads: Thread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onPin: (id: string) => void;
}) {
  if (threads.length === 0) return null;
  return (
    <Stack gap={4}>
      <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 var(--space-12)" }}>
        {title}
      </span>
      {threads.map((t) => (
        <ThreadItem key={t.id} thread={t} active={t.id === activeThreadId} onSelect={() => onSelect(t.id)} onPin={() => onPin(t.id)} />
      ))}
    </Stack>
  );
}
