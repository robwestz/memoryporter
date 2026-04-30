import { useState, useRef, useCallback } from "react";
import { Stack, Inline } from "@/lib/layout";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import type { Suggestion, RefineMode } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type FollowUpComposerProps = {
  threadId: string;
  suggestions?: Suggestion[];
  onSubmit: (query: string, mode?: RefineMode) => void;
  refineModes?: RefineMode[];
};

// ─── Refine mode labels ───────────────────────────────────────────────────────

const refineModeLabels: Record<RefineMode, string> = {
  "more-detail": "More detail",
  "shorter": "Shorter",
  "different-angle": "Different angle",
  "simpler": "Simpler",
  "examples": "Give examples"
};

// ─── Component ────────────────────────────────────────────────────────────────

export function FollowUpComposer({
  threadId: _threadId, // context-bound; included in submit payload if needed
  suggestions = [],
  onSubmit,
  refineModes = []
}: FollowUpComposerProps) {
  const [query, setQuery] = useState("");
  const [activeRefineMode, setActiveRefineMode] = useState<RefineMode | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSubmit(trimmed, activeRefineMode ?? undefined);
    setQuery("");
    setActiveRefineMode(null);
    textareaRef.current?.focus();
  }, [query, activeRefineMode, onSubmit]);

  // Enter to submit (Shift+Enter for newline)
  useKeyboardShortcut({ key: "Enter" }, (e) => {
    if (!e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }, document.activeElement === textareaRef.current);

  function handleSuggestion(text: string) {
    setQuery(text);
    textareaRef.current?.focus();
  }

  function toggleRefineMode(mode: RefineMode) {
    setActiveRefineMode((prev) => (prev === mode ? null : mode));
  }

  const hasInput = query.trim().length > 0;

  return (
    <Stack gap={12} style={{ padding: "var(--space-16) var(--space-24)", borderTop: "1px solid var(--color-border-subtle)", background: "var(--color-surface-raised)" }}>
      {/* Refine mode pills */}
      {refineModes.length > 0 && (
        <Inline gap={8}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", alignSelf: "center", flexShrink: 0 }}>
            Refine:
          </span>
          {refineModes.map((mode) => (
            <button
              key={mode}
              onClick={() => toggleRefineMode(mode)}
              style={{
                padding: "var(--space-4) var(--space-12)",
                fontSize: "var(--text-xs)",
                fontWeight: activeRefineMode === mode ? 600 : 400,
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${activeRefineMode === mode ? "var(--color-accent-default)" : "var(--color-border-default)"}`,
                background: activeRefineMode === mode ? "var(--color-accent-subtle)" : "transparent",
                color: activeRefineMode === mode ? "var(--color-text-accent)" : "var(--color-text-secondary)",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {refineModeLabels[mode]}
            </button>
          ))}
        </Inline>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Inline gap={8} style={{ flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSuggestion(s.text)}
              style={{
                padding: "var(--space-4) var(--space-12)",
                fontSize: "var(--text-xs)",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-border-default)",
                background: "var(--color-surface-base)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                maxWidth: 300,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "left"
              }}
            >
              {s.text}
            </button>
          ))}
        </Inline>
      )}

      {/* Composer input row */}
      <Inline gap={8} align="end">
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              activeRefineMode
                ? `Ask to "${refineModeLabels[activeRefineMode].toLowerCase()}"…`
                : "Ask a follow-up…"
            }
            rows={1}
            style={{
              width: "100%",
              padding: "var(--space-12) var(--space-16)",
              fontSize: "var(--text-sm)",
              lineHeight: "var(--lh-sm)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border-default)",
              background: "var(--color-surface-base)",
              color: "var(--color-text-primary)",
              resize: "none",
              fontFamily: "var(--font-sans)",
              outline: "none",
              transition: "border-color var(--motion-fast)",
              overflowY: "hidden"
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent-default)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border-default)"; }}
          />
          {activeRefineMode && (
            <span
              style={{
                position: "absolute",
                top: "var(--space-8)",
                right: "var(--space-12)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-accent)",
                fontWeight: 600,
                pointerEvents: "none"
              }}
            >
              {refineModeLabels[activeRefineMode]}
            </span>
          )}
        </div>
        <button
          onClick={submit}
          disabled={!hasInput}
          style={{
            padding: "var(--space-12) var(--space-16)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            borderRadius: "var(--radius-lg)",
            border: "none",
            background: hasInput ? "var(--color-accent-default)" : "var(--color-surface-sunken)",
            color: hasInput ? "var(--color-text-inverted)" : "var(--color-text-tertiary)",
            cursor: hasInput ? "pointer" : "default",
            transition: "background var(--motion-fast), color var(--motion-fast)",
            flexShrink: 0,
            height: 44
          }}
        >
          Send
        </button>
      </Inline>

      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textAlign: "center" }}>
        Enter to send · Shift+Enter for newline
      </span>
    </Stack>
  );
}
