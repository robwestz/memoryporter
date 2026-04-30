# Components — ai-search-chat-shell

The shell for AI-native products: Perplexity-style search + follow-up,
Notion AI-style inline, enterprise chat over docs. Target user: professionals
using AI to answer work questions, not consumer chatbots.

## StreamingAnswerPane

**Usage** — Main answer surface. Renders a streaming LLM response token-by-
token with inline citation markers. Paired with `SourceBrowser` (right panel)
and `FollowUpComposer` (below).

**Semantic purpose** — A typed, structured answer — not just a text stream.
Markdown, citations, tool calls, and code blocks are first-class, not
post-processed.

**Examples**

Correct:

```tsx
<StreamingAnswerPane
  answer={streamingAnswer}
  onCitationClick={openSource}
  onToolCallRender={(call) => <ToolCallCard call={call} />}
  renderCodeBlock={(block) => <CodeBlock {...block} />}
  copyable
/>
```

Incorrect:

```tsx
<StreamingAnswerPane text={answerText} />
```

*Why wrong:* Flat text loses citations, tool calls, and code blocks. Users
can't verify sources; developers can't copy code cleanly. The component's
value is the structured rendering.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `answer` | `Answer` | yes | — | Streaming or complete structured answer |
| `onCitationClick` | `(sourceId: string) => void` | yes | — | Opens in SourceBrowser |
| `onToolCallRender` | `(c: ToolCall) => ReactNode` | no | — | Custom tool call UI |
| `renderCodeBlock` | `(b: CodeBlock) => ReactNode` | no | — | Custom code renderer |
| `copyable` | `boolean` | no | `true` | Enables copy-answer button |

---

## CitationCard

**Usage** — Inline card rendered at citation markers in `StreamingAnswerPane`.
On hover: source preview. On click: opens full source in `SourceBrowser`.

**Semantic purpose** — A verifiable link between a claim and its evidence.
Must preserve source URL, excerpt, confidence, and retrieval timestamp.

**Examples**

Correct:

```tsx
<CitationCard
  source={source}
  excerpt={relevantExcerpt}
  confidence={0.87}
  retrievedAt={timestamp}
  onOpen={() => openSource(source.id)}
/>
```

Incorrect:

```tsx
<CitationCard url={source.url} />
```

*Why wrong:* Just a URL = "trust me". The whole trust model depends on
showing *what was retrieved* and *when*.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `source` | `Source` | yes | — | Full source record |
| `excerpt` | `string` | yes | — | Retrieved passage |
| `confidence` | `number` | yes | — | 0–1 retrieval confidence |
| `retrievedAt` | `Date` | yes | — | When it was fetched |
| `onOpen` | `() => void` | yes | — | Opens full viewer |

---

## FollowUpComposer

**Usage** — Below the answer pane. Composer with three modes: free-text,
suggested follow-ups (chips), and "refine" (re-ask with modifications like
"more detail" / "shorter"). Preserves thread context.

**Semantic purpose** — Continuation. A follow-up inherits the previous
answer's context; the composer makes that contract explicit.

**Examples**

Correct:

```tsx
<FollowUpComposer
  threadId={threadId}
  suggestions={generatedSuggestions}
  onSubmit={sendFollowUp}
  refineModes={["more-detail", "shorter", "different-angle"]}
/>
```

Incorrect:

```tsx
<FollowUpComposer onSubmit={send} />
```

*Why wrong:* Bare text input loses the thread and the suggestion loop.
Power users ask 5-10 follow-ups per thread — suggestions cut that time in half.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `threadId` | `string` | yes | — | Continues this thread |
| `suggestions` | `Suggestion[]` | no | `[]` | Chips above input |
| `onSubmit` | `(q: string, mode?: RefineMode) => void` | yes | — | Send |
| `refineModes` | `RefineMode[]` | no | `[]` | Available refine options |

---

## SourceBrowser

**Usage** — Right-side drawer or panel. Shows all sources used in the current
answer: web pages, docs, files. Opening a source shows the full content with
the retrieved passage highlighted.

**Semantic purpose** — The evidence pane. Users verify claims by reading the
source, not by trusting the model.

**Examples**

Correct:

```tsx
<SourceBrowser
  sources={answerSources}
  activeSourceId={activeSource}
  onSourceSelect={setActiveSource}
  renderSource={(s) => <SourceViewer source={s} />}
/>
```

Incorrect:

```tsx
<SourceBrowser sources={sources} />
```

*Why wrong:* No active source state = can't deep-link to "citation 3". The
browser's value is per-source navigation, not a list.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `sources` | `Source[]` | yes | — | All sources for this answer |
| `activeSourceId` | `string \| null` | yes | — | Currently viewed |
| `onSourceSelect` | `(id: string) => void` | yes | — | Nav |
| `renderSource` | `(s: Source) => ReactNode` | yes | — | Source-type-aware renderer |

---

## ThreadHistorySidebar

**Usage** — Left sidebar. List of past threads with title, last-activity, and
pin. Virtualized for long histories. Filters: today / this week / pinned /
search.

**Semantic purpose** — Persistent memory. Users return to threads, don't
start fresh every session.

**Examples**

Correct:

```tsx
<ThreadHistorySidebar
  threads={userThreads}
  activeThreadId={currentThread}
  onThreadSelect={openThread}
  onPin={togglePin}
  filters={{ pinned: true }}
/>
```

Incorrect:

```tsx
<ThreadHistorySidebar threads={threads} />
```

*Why wrong:* No pin, no filter = flat list. 500 threads in, the sidebar is
unusable without structure.

**API**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `threads` | `Thread[]` | yes | — | User's history |
| `activeThreadId` | `string \| null` | yes | — | Current |
| `onThreadSelect` | `(id: string) => void` | yes | — | Open thread |
| `onPin` | `(id: string) => void` | yes | — | Toggle pin |
| `filters` | `ThreadFilters` | no | `{}` | Pinned/date/search |

---

## Monetization patterns enforced

- **Usage-visible billing** — `UsageMeter` showing queries-this-month vs plan
  limit; surfaces at answer generation time, not just settings
- **Advanced-mode toggles** — `ProFeatureCallout` on model picker (larger
  model = paid), on source types (enterprise docs = paid)
- **API/webhook access** — `ApiKeyManager` in settings, rate limit meter
- **Abandoned-state rescue** — `ResumeWizard` on re-login if last session
  had an unfinished thread
