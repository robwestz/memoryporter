---
name: Build Streaming Markdown Renderer
description: Render streaming LLM output as formatted markdown in the terminal, with fence-aware buffering to prevent broken code blocks.
category: Streaming & SSE
trigger: When building a CLI that streams LLM output and needs clean terminal rendering.
type: skill
agnostic: true
---

# Build Streaming Markdown Renderer

Render streaming LLM output as formatted markdown in the terminal, with fence-aware buffering to prevent broken code blocks.

## When to Use

When building a CLI that streams LLM output and needs clean terminal rendering.

## Steps

1. Implement SSE parser with incremental buffering (push/finish lifecycle).
2. Create MarkdownStreamState with pending buffer.
3. Track code fence depth to detect inside/outside code blocks.
4. Only flush at safe boundaries (paragraph breaks outside fences).
5. Use pulldown-cmark for markdown parsing, syntect for syntax highlighting.
6. Render with ANSI escape codes for colors, bold, italic, underline.
7. Add spinner animation for tool execution feedback.

## Verification

- [ ] Code blocks never rendered incomplete.
- [ ] Syntax highlighting works for common languages.
- [ ] Spinner doesn't leave artifacts in terminal.
- [ ] Streaming output progressive (not batched to end).

