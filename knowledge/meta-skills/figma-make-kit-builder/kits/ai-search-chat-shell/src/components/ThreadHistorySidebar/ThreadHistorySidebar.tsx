import { useState, useMemo } from "react";
import { Stack } from "@/lib/layout";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { SectionGroup, isToday, isThisWeek } from "./ThreadWidgets";
import type { Thread, ThreadFilters } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type ThreadHistorySidebarProps = {
  threads: Thread[];
  activeThreadId: string | null;
  onThreadSelect: (id: string) => void;
  onPin: (id: string) => void;
  filters?: ThreadFilters;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ThreadHistorySidebar({
  threads,
  activeThreadId,
  onThreadSelect,
  onPin,
  filters = {}
}: ThreadHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");

  // Cmd/Ctrl+K → focus search
  useKeyboardShortcut({ key: "k", meta: true }, () => {
    document.getElementById("thread-search")?.focus();
  });

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (filters.pinned && !t.pinned) return false;
      const q = searchQuery.toLowerCase();
      if (q && !t.title.toLowerCase().includes(q) && !t.preview.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [threads, filters.pinned, searchQuery]);

  const pinned = filtered.filter((t) => t.pinned);
  const today = filtered.filter((t) => !t.pinned && isToday(t.lastActivity));
  const thisWeek = filtered.filter((t) => !t.pinned && !isToday(t.lastActivity) && isThisWeek(t.lastActivity));
  const older = filtered.filter((t) => !t.pinned && !isThisWeek(t.lastActivity));

  return (
    <Stack gap={0} style={{ height: "100%", overflow: "hidden" }}>
      {/* Search */}
      <div style={{ padding: "var(--space-12)", borderBottom: "1px solid var(--color-border-subtle)" }}>
        <input
          id="thread-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search threads… ⌘K"
          style={{ width: "100%", padding: "var(--space-8) var(--space-12)", fontSize: "var(--text-sm)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", background: "var(--color-surface-base)", color: "var(--color-text-primary)", outline: "none" }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ padding: "var(--space-4) var(--space-8)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", gap: "var(--space-4)" }}>
        {(["All", "Pinned"] as const).map((f) => {
          const active = f === "Pinned" ? !!filters.pinned : !filters.pinned;
          return (
            <span
              key={f}
              style={{ fontSize: "var(--text-xs)", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius-md)", background: active ? "var(--color-accent-subtle)" : "transparent", color: active ? "var(--color-text-accent)" : "var(--color-text-secondary)", fontWeight: active ? 600 : 400, cursor: "pointer" }}
            >
              {f}
            </span>
          );
        })}
      </div>

      {/* Thread list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-8)" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "var(--space-32) var(--space-16)", textAlign: "center" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>No threads found.</span>
          </div>
        ) : (
          <Stack gap={16}>
            <SectionGroup title="Pinned" threads={pinned} activeThreadId={activeThreadId} onSelect={onThreadSelect} onPin={onPin} />
            <SectionGroup title="Today" threads={today} activeThreadId={activeThreadId} onSelect={onThreadSelect} onPin={onPin} />
            <SectionGroup title="This week" threads={thisWeek} activeThreadId={activeThreadId} onSelect={onThreadSelect} onPin={onPin} />
            <SectionGroup title="Older" threads={older} activeThreadId={activeThreadId} onSelect={onThreadSelect} onPin={onPin} />
          </Stack>
        )}
      </div>
    </Stack>
  );
}
