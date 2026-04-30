# Attributions — ai-search-chat-shell

## Kit authorship

Built by Agent B2 as part of the figma-make-kit-builder multi-agent run.
Version 1.0.0 — April 2026.

## Dependencies

| Package | License | Notes |
|---------|---------|-------|
| React 18 | MIT | UI runtime |
| TypeScript | Apache-2.0 | Type safety |
| Vite 5 | MIT | Build tool |
| Tailwind CSS 3 | MIT | Utility classes (via postcss) |

## Optional future dependency

| Package | License | Notes |
|---------|---------|-------|
| react-markdown | MIT | Richer markdown rendering; swap out the inline `renderMarkdown()` in `StreamingAnswerPane.tsx` |
| remark-gfm | MIT | GFM tables/tasklists if react-markdown is added |

## Shared primitives (foundation-locked)

- Layout: `Stack`, `Inline`, `Grid`, `Split`, `Center` — from `@/lib/layout`
- Store: `createStore` — from `@/lib/store/createStore`
- Hook: `useKeyboardShortcut` — from `@/lib/hooks/useKeyboardShortcut`
- CSS tokens: `@/app/styles/index.css` — shared across all kits

## Streaming simulation

`StreamingAnswerPane` uses `setInterval` at 16ms tick (60fps) revealing
`CHARS_PER_TICK = 4` characters per tick. This is a UI simulation only.
Real streaming would accept Server-Sent Events and update `Answer.text`
incrementally; the component responds identically because it re-runs the
`useStreamingText` effect whenever `answer.text` changes.

## Design references

No third-party designs incorporated. All component APIs defined in
`guidelines/components.md` by Robin Westerlund.
