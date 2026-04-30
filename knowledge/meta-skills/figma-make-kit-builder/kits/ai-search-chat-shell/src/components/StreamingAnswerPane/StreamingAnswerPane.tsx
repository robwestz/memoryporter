import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { Stack, Inline } from "@/lib/layout";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { renderMarkdown, DefaultToolCallCard, DefaultCodeBlock } from "./AnswerRenderer";
import type { Answer, ToolCall, CodeBlock } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

type StreamingAnswerPaneProps = {
  answer: Answer;
  onCitationClick: (sourceId: string) => void;
  onToolCallRender?: (call: ToolCall) => ReactNode;
  renderCodeBlock?: (block: CodeBlock) => ReactNode;
  copyable?: boolean;
};

// ─── Streaming simulation ─────────────────────────────────────────────────────
// Simulates token-by-token reveal using setInterval.
// Characters-per-tick chosen to feel natural at ~60fps.
// Real SSE: update answer.text progressively; this hook responds identically.

const CHARS_PER_TICK = 4;
const TICK_MS = 16;

function useStreamingText(answer: Answer): string {
  const [revealed, setRevealed] = useState(
    answer.status !== "streaming" ? answer.text : ""
  );
  const posRef = useRef(0);

  useEffect(() => {
    if (answer.status !== "streaming") {
      setRevealed(answer.text);
      return;
    }

    posRef.current = 0;
    setRevealed("");

    const id = setInterval(() => {
      posRef.current = Math.min(posRef.current + CHARS_PER_TICK, answer.text.length);
      setRevealed(answer.text.slice(0, posRef.current));
      if (posRef.current >= answer.text.length) clearInterval(id);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [answer.id, answer.text, answer.status]);

  return revealed;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StreamingAnswerPane({
  answer,
  onCitationClick,
  onToolCallRender,
  renderCodeBlock,
  copyable = true
}: StreamingAnswerPaneProps) {
  const displayText = useStreamingText(answer);
  const [copied, setCopied] = useState(false);

  const copyAnswer = useCallback(async () => {
    await navigator.clipboard.writeText(answer.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [answer.text]);

  useKeyboardShortcut({ key: "c", meta: true, shift: true }, copyAnswer, copyable);

  const isStreaming = answer.status === "streaming" && displayText.length < answer.text.length;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "var(--space-24) var(--space-32)", maxWidth: 720, margin: "0 auto" }}>
      <Stack gap={16}>
        {/* Tool calls (above answer) */}
        {answer.toolCalls.length > 0 && (
          <Stack gap={8}>
            {answer.toolCalls.map((call) =>
              onToolCallRender ? (
                <div key={call.id}>{onToolCallRender(call)}</div>
              ) : (
                <DefaultToolCallCard key={call.id} call={call} />
              )
            )}
          </Stack>
        )}

        {/* Rendered answer text */}
        <div>
          {renderMarkdown(displayText, answer.sourceIds, onCitationClick)}
          {isStreaming && (
            <span style={{ display: "inline-block", width: 2, height: "1em", background: "var(--color-accent-default)", marginLeft: 2, animation: "blink 0.7s step-end infinite", verticalAlign: "text-bottom" }} />
          )}
        </div>

        {/* Code blocks */}
        {answer.codeBlocks.map((block, idx) =>
          renderCodeBlock ? (
            <div key={idx}>{renderCodeBlock(block)}</div>
          ) : (
            <DefaultCodeBlock key={idx} block={block} />
          )
        )}

        {/* Footer: metadata + copy */}
        {answer.status === "complete" && (
          <Inline justify="between" align="center" style={{ paddingTop: "var(--space-8)", borderTop: "1px solid var(--color-border-subtle)" }}>
            <Inline gap={12}>
              {answer.model && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{answer.model}</span>}
              {answer.tokenCount !== undefined && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{answer.tokenCount.toLocaleString()} tokens</span>}
              {answer.sourceIds.length > 0 && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{answer.sourceIds.length} source{answer.sourceIds.length !== 1 ? "s" : ""}</span>}
            </Inline>
            {copyable && (
              <button
                onClick={copyAnswer}
                style={{ fontSize: "var(--text-xs)", padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", background: "transparent", color: copied ? "var(--color-success)" : "var(--color-text-secondary)", cursor: "pointer" }}
              >
                {copied ? "Copied!" : "Copy answer"}
              </button>
            )}
          </Inline>
        )}

        {answer.status === "error" && (
          <div style={{ padding: "var(--space-12) var(--space-16)", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", border: "1px solid var(--color-danger)" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-danger)" }}>{answer.errorMessage ?? "An error occurred generating this answer."}</span>
          </div>
        )}
      </Stack>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}
