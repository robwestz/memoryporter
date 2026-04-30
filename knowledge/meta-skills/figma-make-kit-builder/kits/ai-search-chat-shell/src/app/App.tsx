import { useState, useCallback } from "react";
import { Split, Stack, Inline } from "@/lib/layout";
import { createStore } from "@/lib/store/createStore";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { StreamingAnswerPane } from "../components/StreamingAnswerPane";
import { CitationCard } from "../components/CitationCard";
import { FollowUpComposer } from "../components/FollowUpComposer";
import { SourceBrowser } from "../components/SourceBrowser";
import { ThreadHistorySidebar } from "../components/ThreadHistorySidebar";
import type {
  Answer,
  Source,
  Thread,
  Suggestion,
  RefineMode
} from "../components/types";

// ─── App store ────────────────────────────────────────────────────────────────

type AppState = {
  activeThreadId: string | null;
  activeSourceId: string | null;
  showSources: boolean;
  showSidebar: boolean;
};

const appStore = createStore<AppState>({
  activeThreadId: "t1",
  activeSourceId: null,
  showSources: true,
  showSidebar: true
});

// ─── Stub data ────────────────────────────────────────────────────────────────

const SOURCES: Source[] = [
  {
    id: "s1",
    url: "https://example.com/docs/vector-search",
    title: "Vector Search — Technical Documentation",
    domain: "example.com",
    type: "doc",
    excerpt: "Vector search uses embedding representations of data to find semantically similar items, rather than exact keyword matches. This enables retrieval of conceptually related content even when exact terms differ.",
    confidence: 0.94,
    retrievedAt: new Date(Date.now() - 45000),
    fullContent: "Full documentation content here…"
  },
  {
    id: "s2",
    url: "https://arxiv.org/abs/2303.08774",
    title: "GPT-4 Technical Report",
    domain: "arxiv.org",
    type: "web",
    excerpt: "GPT-4 is a large multimodal model that can accept image and text inputs and produce text outputs. It exhibits human-level performance on various professional and academic benchmarks.",
    confidence: 0.87,
    retrievedAt: new Date(Date.now() - 120000),
    fullContent: "Technical report content here…"
  },
  {
    id: "s3",
    url: "https://internal.example.com/wiki/search-architecture",
    title: "Internal Search Architecture Wiki",
    domain: "internal.example.com",
    type: "doc",
    excerpt: "Our search stack uses a hybrid approach: BM25 for keyword matching combined with FAISS vector index for semantic search. Re-ranking is performed by a cross-encoder model.",
    confidence: 0.76,
    retrievedAt: new Date(Date.now() - 60000),
    fullContent: "Internal wiki content here…"
  }
];

const STREAMING_ANSWER_TEXT = `## Vector Search Architecture

Vector search is a retrieval paradigm that represents both **queries and documents** as dense vectors in a high-dimensional space [^1]. Rather than matching keywords, it identifies semantically similar content.

### How it works

The core idea is simple: embed everything. Documents are embedded at index time using a model like \`text-embedding-3-large\`. At query time, the query is embedded with the same model, then the index finds the nearest neighbors by cosine similarity [^2].

### Hybrid approaches

Production systems rarely use pure vector search. A common architecture combines:

- **BM25** for exact keyword recall
- **FAISS/HNSW** for semantic vector retrieval
- **Cross-encoder re-ranking** to blend and re-score [^3]

This gives you recall from both paradigms. The re-ranker has full query-document attention, which is expensive but applied only to the top-K candidates.`;

const COMPLETE_ANSWER: Answer = {
  id: "a1",
  threadId: "t1",
  text: STREAMING_ANSWER_TEXT,
  status: "complete",
  sourceIds: ["s1", "s2", "s3"],
  toolCalls: [
    { id: "tc1", name: "search_docs", input: { query: "vector search architecture" }, output: "Found 3 relevant documents", status: "completed", durationMs: 312 },
    { id: "tc2", name: "search_web", input: { query: "hybrid search BM25 FAISS" }, output: "Found 5 web results", status: "completed", durationMs: 891 }
  ],
  codeBlocks: [],
  createdAt: new Date(Date.now() - 5000),
  completedAt: new Date(),
  tokenCount: 342,
  model: "claude-sonnet-4-6"
};

// A "streaming" version of the same answer, simulated by status flag
const STREAMING_ANSWER: Answer = {
  ...COMPLETE_ANSWER,
  id: "a1-streaming",
  status: "streaming",
  completedAt: undefined,
  tokenCount: undefined
};

const THREADS: Thread[] = [
  { id: "t1", title: "Vector search architecture", lastActivity: new Date(), pinned: true, queryCount: 4, preview: "How does vector search work at scale?" },
  { id: "t2", title: "TypeScript generics best practices", lastActivity: new Date(Date.now() - 3600000), pinned: false, queryCount: 7, preview: "Explain the difference between T extends and infer" },
  { id: "t3", title: "Postgres query optimization", lastActivity: new Date(Date.now() - 86400000), pinned: false, queryCount: 12, preview: "Why is my index scan slower than seq scan?" },
  { id: "t4", title: "React suspense boundaries", lastActivity: new Date(Date.now() - 2 * 86400000), pinned: false, queryCount: 3, preview: "When should I use Suspense vs error boundaries?" },
  { id: "t5", title: "LLM context window strategies", lastActivity: new Date(Date.now() - 8 * 86400000), pinned: true, queryCount: 9, preview: "How does KV cache work across requests?" }
];

const SUGGESTIONS: Suggestion[] = [
  { id: "sq1", text: "How does HNSW compare to flat FAISS?" },
  { id: "sq2", text: "What's the tradeoff between recall and latency?" },
  { id: "sq3", text: "Show me a Python example with LangChain" }
];

// ─── Source viewer (default renderer) ────────────────────────────────────────

function DefaultSourceViewer({ source }: { source: Source }) {
  return (
    <Stack gap={16}>
      <div
        style={{
          padding: "var(--space-12) var(--space-16)",
          background: "var(--color-accent-subtle)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-subtle)"
        }}
      >
        <Stack gap={4}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Retrieved excerpt
          </span>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--lh-base)", color: "var(--color-text-primary)" }}>
            "{source.excerpt}"
          </p>
        </Stack>
      </div>
      {source.fullContent && (
        <div style={{ fontSize: "var(--text-sm)", lineHeight: "var(--lh-base)", color: "var(--color-text-secondary)" }}>
          {source.fullContent}
        </div>
      )}
      <div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "var(--text-sm)", color: "var(--color-text-accent)" }}
        >
          Open original source →
        </a>
      </div>
    </Stack>
  );
}

// ─── Usage meter (monetization pattern: usage-visible billing) ────────────────

function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct > 80 ? "var(--color-warning)" : "var(--color-accent-default)";

  return (
    <Inline gap={8} align="center">
      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
        {used}/{limit} queries
      </span>
      <div style={{ width: 64, height: 4, borderRadius: "var(--radius-pill)", background: "var(--color-surface-sunken)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "var(--radius-pill)" }} />
      </div>
      {pct > 80 && (
        <button
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            padding: "2px var(--space-8)",
            borderRadius: "var(--radius-pill)",
            border: "none",
            background: "var(--color-accent-default)",
            color: "var(--color-text-inverted)",
            cursor: "pointer"
          }}
        >
          Upgrade
        </button>
      )}
    </Inline>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { activeThreadId, activeSourceId, showSources, showSidebar } = appStore.use((s) => s);
  const [demoMode, setDemoMode] = useState<"complete" | "streaming">("complete");
  const [threads, setThreads] = useState<Thread[]>(THREADS);

  const currentAnswer = demoMode === "streaming" ? STREAMING_ANSWER : COMPLETE_ANSWER;

  // Keyboard shortcuts
  useKeyboardShortcut({ key: "\\", meta: true }, () => appStore.setState((s) => ({ showSidebar: !s.showSidebar })));
  useKeyboardShortcut({ key: "/", meta: true }, () => appStore.setState((s) => ({ showSources: !s.showSources })));

  const handleCitationClick = useCallback((sourceId: string) => {
    appStore.setState({ activeSourceId: sourceId, showSources: true });
  }, []);

  function handleFollowUp(query: string, mode?: RefineMode) {
    console.log("Follow-up submitted:", { query, mode, threadId: activeThreadId });
    // In real app: send to API, create new answer, stream back
  }

  function handlePin(threadId: string) {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, pinned: !t.pinned } : t))
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--color-surface-base)" }}>
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-surface-raised)",
          boxShadow: "var(--elev-1)",
          zIndex: "var(--z-sticky)",
          flexShrink: 0
        }}
      >
        <Inline justify="between" align="center" style={{ padding: "0 var(--space-24)", height: 52 }}>
          <Inline gap={8} align="center">
            <span style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>AI Search</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
              ⌘\ sidebar · ⌘/ sources
            </span>
          </Inline>
          <Inline gap={12} align="center">
            {/* Demo mode toggle */}
            <Inline gap={8} align="center">
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Mode:</span>
              {(["complete", "streaming"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setDemoMode(m)}
                  style={{
                    padding: "var(--space-4) var(--space-8)",
                    fontSize: "var(--text-xs)",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${demoMode === m ? "var(--color-accent-default)" : "var(--color-border-default)"}`,
                    background: demoMode === m ? "var(--color-accent-subtle)" : "transparent",
                    color: demoMode === m ? "var(--color-text-accent)" : "var(--color-text-secondary)",
                    cursor: "pointer"
                  }}
                >
                  {m}
                </button>
              ))}
            </Inline>
            <UsageMeter used={87} limit={100} />
          </Inline>
        </Inline>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {/* Left sidebar — thread history */}
        {showSidebar && (
          <div
            style={{
              width: 260,
              flexShrink: 0,
              borderRight: "1px solid var(--color-border-subtle)",
              overflowY: "auto",
              background: "var(--color-surface-raised)"
            }}
          >
            <ThreadHistorySidebar
              threads={threads}
              activeThreadId={activeThreadId}
              onThreadSelect={(id) => appStore.setState({ activeThreadId: id })}
              onPin={handlePin}
              filters={{}}
            />
          </div>
        )}

        {/* Center — answer + composer */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Answer pane */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <StreamingAnswerPane
              answer={currentAnswer}
              onCitationClick={handleCitationClick}
              copyable
            />
          </div>

          {/* Citation cards row (above composer) */}
          {SOURCES.slice(0, 3).length > 0 && (
            <div
              style={{
                padding: "var(--space-8) var(--space-24)",
                borderTop: "1px solid var(--color-border-subtle)",
                background: "var(--color-surface-base)",
                display: "flex",
                gap: "var(--space-12)",
                overflowX: "auto",
                flexShrink: 0
              }}
            >
              {SOURCES.map((s) => (
                <CitationCard
                  key={s.id}
                  source={s}
                  excerpt={s.excerpt}
                  confidence={s.confidence}
                  retrievedAt={s.retrievedAt}
                  onOpen={() => handleCitationClick(s.id)}
                />
              ))}
            </div>
          )}

          {/* Follow-up composer */}
          <FollowUpComposer
            threadId={activeThreadId ?? "new"}
            suggestions={SUGGESTIONS}
            onSubmit={handleFollowUp}
            refineModes={["more-detail", "shorter", "different-angle", "examples"]}
          />
        </div>

        {/* Right panel — source browser */}
        {showSources && (
          <div
            style={{
              width: 480,
              flexShrink: 0,
              borderLeft: "1px solid var(--color-border-subtle)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div
              style={{
                padding: "var(--space-8) var(--space-16)",
                borderBottom: "1px solid var(--color-border-subtle)",
                background: "var(--color-surface-raised)"
              }}
            >
              <Inline justify="between" align="center">
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Sources</span>
                <button
                  onClick={() => appStore.setState({ showSources: false })}
                  style={{ fontSize: "var(--text-xs)", border: "none", background: "transparent", color: "var(--color-text-tertiary)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </Inline>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <SourceBrowser
                sources={SOURCES}
                activeSourceId={activeSourceId}
                onSourceSelect={(id) => appStore.setState({ activeSourceId: id })}
                renderSource={(s) => <DefaultSourceViewer source={s} />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
