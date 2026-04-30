import { useState, useRef, useEffect } from "react";
import { Stack, Inline } from "@/lib/layout";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import type { SavedView } from "../types";

type SavedViewsDropdownProps = {
  views: SavedView[];
  activeViewId: string | null;
  onSelect: (id: string) => void;
  onSaveCurrent: () => void;
  onDelete: (id: string) => void;
};

export function SavedViewsDropdown({
  views,
  activeViewId,
  onSelect,
  onSaveCurrent,
  onDelete,
}: SavedViewsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeView = views.find((v) => v.id === activeViewId) ?? null;

  useKeyboardShortcut({ key: "Escape" }, () => {
    setOpen(false);
    setConfirmDelete(null);
  }, open);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(null);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
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
          <ViewIcon />
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activeView ? activeView.name : "Views"}
          </span>
          <ChevronIcon />
        </button>

        <button
          type="button"
          onClick={onSaveCurrent}
          title="Save current state as a view"
          aria-label="Save current view"
          style={iconButtonStyle}
        >
          <SaveIcon />
        </button>
      </Inline>

      {open && (
        <div
          role="listbox"
          aria-label="Saved views"
          style={dropdownStyle}
        >
          <Stack gap={0}>
            <div
              style={{
                padding: "var(--space-8) var(--space-12)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Saved views
            </div>

            {views.length === 0 && (
              <EmptyViewsState onSave={() => { onSaveCurrent(); setOpen(false); }} />
            )}

            {views.map((view) => (
              <ViewItem
                key={view.id}
                view={view}
                active={view.id === activeViewId}
                confirmingDelete={confirmDelete === view.id}
                onSelect={() => {
                  onSelect(view.id);
                  setOpen(false);
                }}
                onRequestDelete={() =>
                  setConfirmDelete((prev) =>
                    prev === view.id ? null : view.id
                  )
                }
                onConfirmDelete={() => {
                  onDelete(view.id);
                  setConfirmDelete(null);
                  if (view.id === activeViewId) setOpen(false);
                }}
                onCancelDelete={() => setConfirmDelete(null)}
              />
            ))}

            {/* Save current action */}
            <div
              style={{
                borderTop: "1px solid var(--color-border-subtle)",
                padding: "var(--space-8) var(--space-12)",
              }}
            >
              <button
                type="button"
                onClick={() => { onSaveCurrent(); setOpen(false); }}
                style={fullWidthGhostStyle}
              >
                + Save current state
              </button>
            </div>
          </Stack>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

type ViewItemProps = {
  view: SavedView;
  active: boolean;
  confirmingDelete: boolean;
  onSelect: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

function ViewItem({
  view,
  active,
  confirmingDelete,
  onSelect,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: ViewItemProps) {
  return (
    <div
      style={{
        padding: "var(--space-8) var(--space-12)",
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--color-accent-subtle)" : "transparent",
      }}
    >
      {confirmingDelete ? (
        <Inline gap={8} align="center" justify="between">
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-danger)",
            }}
          >
            Delete "{view.name}"?
          </span>
          <Inline gap={4}>
            <button type="button" onClick={onConfirmDelete} style={dangerChipStyle}>
              Delete
            </button>
            <button type="button" onClick={onCancelDelete} style={ghostChipStyle}>
              Cancel
            </button>
          </Inline>
        </Inline>
      ) : (
        <Inline gap={8} align="center" justify="between">
          <button
            type="button"
            role="option"
            aria-selected={active}
            onClick={onSelect}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              flex: 1,
              textAlign: "left",
              padding: 0,
            }}
          >
            <Inline gap={8} align="center">
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: active
                    ? "var(--color-accent-default)"
                    : "var(--color-text-primary)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {view.name}
              </span>
              {active && (
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-accent-default)",
                  }}
                >
                  ✓
                </span>
              )}
            </Inline>
          </button>
          <button
            type="button"
            onClick={onRequestDelete}
            aria-label={`Delete view ${view.name}`}
            style={deleteIconButtonStyle}
          >
            ×
          </button>
        </Inline>
      )}
    </div>
  );
}

function EmptyViewsState({ onSave }: { onSave: () => void }) {
  return (
    <div
      style={{
        padding: "var(--space-24) var(--space-16)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-12)",
        }}
      >
        No saved views yet. Save the current layout, filters, and time range.
      </p>
      <button type="button" onClick={onSave} style={primaryButtonStyle}>
        Save current state
      </button>
    </div>
  );
}

// --- Icons ---

function ViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
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
  maxHeight: "360px",
  overflowY: "auto",
  padding: "var(--space-4)",
};

const fullWidthGhostStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "var(--text-sm)",
  color: "var(--color-text-secondary)",
  textAlign: "left",
  padding: "var(--space-4) 0",
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

const dangerChipStyle: React.CSSProperties = {
  background: "var(--color-danger)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-4) var(--space-8)",
  fontSize: "var(--text-xs)",
  fontWeight: 500,
  color: "var(--color-text-inverted)",
  cursor: "pointer",
};

const ghostChipStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-4) var(--space-8)",
  fontSize: "var(--text-xs)",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
};

const deleteIconButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "var(--text-lg)",
  color: "var(--color-text-tertiary)",
  padding: "0 var(--space-4)",
  lineHeight: 1,
};
