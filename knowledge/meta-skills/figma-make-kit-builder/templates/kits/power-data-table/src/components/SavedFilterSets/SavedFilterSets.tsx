import { useState, useRef, useEffect } from "react";
import { Stack, Inline } from "@/lib/layout";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import type { FilterSet } from "../types";

type SavedFilterSetsProps = {
  sets: FilterSet[];
  teamSets: FilterSet[];
  activeSetId: string | null;
  onApply: (id: string) => void;
  onSaveCurrent: () => void;
  onShare: (id: string) => void;
};

export function SavedFilterSets({
  sets,
  teamSets,
  activeSetId,
  onApply,
  onSaveCurrent,
  onShare,
}: SavedFilterSetsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSet =
    [...sets, ...teamSets].find((s) => s.id === activeSetId) ?? null;

  useKeyboardShortcut({ key: "Escape" }, () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    function onOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <Inline gap={8} align="center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          style={triggerStyle}
        >
          <FilterIcon />
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
            {activeSet ? activeSet.name : "Filter sets"}
          </span>
          <ChevronIcon />
        </button>

        <button
          type="button"
          onClick={onSaveCurrent}
          title="Save current filters as a set"
          style={iconButtonStyle}
        >
          <SaveIcon />
        </button>
      </Inline>

      {open && (
        <div
          role="listbox"
          aria-label="Saved filter sets"
          style={dropdownStyle}
        >
          <Stack gap={0}>
            {/* Personal sets */}
            {sets.length > 0 && (
              <>
                <SectionLabel>My filter sets</SectionLabel>
                {sets.map((set) => (
                  <FilterSetItem
                    key={set.id}
                    set={set}
                    active={set.id === activeSetId}
                    onApply={() => {
                      onApply(set.id);
                      setOpen(false);
                    }}
                    onShare={() => onShare(set.id)}
                    canShare
                  />
                ))}
              </>
            )}

            {/* Divider */}
            {sets.length > 0 && teamSets.length > 0 && (
              <div
                style={{
                  height: "1px",
                  background: "var(--color-border-subtle)",
                  marginBlock: "var(--space-4)",
                }}
              />
            )}

            {/* Team sets */}
            {teamSets.length > 0 && (
              <>
                <SectionLabel>Team filter sets</SectionLabel>
                {teamSets.map((set) => (
                  <FilterSetItem
                    key={set.id}
                    set={set}
                    active={set.id === activeSetId}
                    onApply={() => {
                      onApply(set.id);
                      setOpen(false);
                    }}
                    onShare={() => {}}
                    canShare={false}
                  />
                ))}
              </>
            )}

            {sets.length === 0 && teamSets.length === 0 && (
              <EmptyState onSave={onSaveCurrent} />
            )}
          </Stack>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--color-text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        padding: "var(--space-8) var(--space-12) var(--space-4)",
      }}
    >
      {children}
    </div>
  );
}

type FilterSetItemProps = {
  set: FilterSet;
  active: boolean;
  onApply: () => void;
  onShare: () => void;
  canShare: boolean;
};

function FilterSetItem({ set, active, onApply, onShare, canShare }: FilterSetItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onApply}
      onKeyDown={(e) => { if (e.key === "Enter") onApply(); }}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "var(--space-8)",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-8) var(--space-12)",
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--color-accent-subtle)" : "transparent",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: "var(--text-sm)",
          color: active
            ? "var(--color-accent-default)"
            : "var(--color-text-primary)",
          fontWeight: active ? 500 : 400,
        }}
      >
        {set.name}
        {active && (
          <span
            style={{
              marginLeft: "var(--space-8)",
              fontSize: "var(--text-xs)",
              color: "var(--color-accent-default)",
            }}
          >
            ✓
          </span>
        )}
      </span>
      <Inline gap={4}>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-tertiary)",
          }}
        >
          {set.filters.length} filter{set.filters.length !== 1 ? "s" : ""}
        </span>
        {canShare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            title="Share with team"
            style={{ ...iconButtonStyle, padding: "var(--space-4)" }}
          >
            <ShareIcon />
          </button>
        )}
      </Inline>
    </div>
  );
}

function EmptyState({ onSave }: { onSave: () => void }) {
  return (
    <div style={{ padding: "var(--space-24) var(--space-16)", textAlign: "center" }}>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-8)",
        }}
      >
        No saved filter sets yet.
      </p>
      <button type="button" onClick={onSave} style={primaryButtonStyle}>
        Save current filters
      </button>
    </div>
  );
}

// --- Inline icons (SVG, no hex) ---

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 2v4h4V2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="10" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="2" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 6.7l5 2.6M3.5 5.3l5-2.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

// --- Styles ---

const triggerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-8)",
  background: "var(--color-surface-raised)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-8) var(--space-12)",
  cursor: "pointer",
  color: "var(--color-text-primary)",
};

const iconButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  padding: "var(--space-8)",
  color: "var(--color-text-secondary)",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + var(--space-4))",
  left: 0,
  zIndex: "var(--z-dropdown)",
  background: "var(--color-surface-overlay)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--elev-2)",
  minWidth: "240px",
  maxHeight: "320px",
  overflowY: "auto",
  padding: "var(--space-4)",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "var(--color-accent-default)",
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-8) var(--space-16)",
  color: "var(--color-text-inverted)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
};
