# Markdown-Aware Stream Buffering

**Never break a code block mid-render**

**Leverage:** 10x Multiplier

## What

MarkdownStreamState accumulates streaming deltas and detects safe rendering boundaries. Tracks fence state (inside/outside code blocks). Only flushes at paragraph breaks outside fences, buffers everything inside fences.

## Why It Matters

Streaming output looks perfect every time. No half-rendered code blocks, no broken syntax highlighting. Users see clean, progressive output even at high token throughput.

## How To Use

Implement a stateful stream buffer with push(delta) and flush(). Track code fence depth. Find safe boundaries (empty lines outside fences). Render only complete chunks.

## Code Pattern

```rust
pub struct MarkdownStreamState {
    pending: String,
}

impl MarkdownStreamState {
    pub fn push(&mut self, delta: &str) -> Option<String> {
        self.pending.push_str(delta);
        // Find safe boundary: not inside code fence
        let in_fence = self.pending.matches("```").count() % 2 != 0;
        if in_fence { return None; }
        // Flush at paragraph break
        if let Some(pos) = self.pending.rfind("\n\n") {
            let chunk = self.pending[..pos + 2].to_string();
            self.pending = self.pending[pos + 2..].to_string();
            Some(render_markdown(&chunk))
        } else { None }
    }
}
```
