# Incremental SSE Parser with Frame Buffering

**Handle any chunk size, never lose a frame**

**Leverage:** Problem Eliminator

## What

SseParser.push() accepts arbitrary byte chunks, buffers until frame boundary (\n\n), extracts complete frames, leaves remainder for next chunk. Handles multi-line JSON data, ping filtering, and graceful finish().

## Why It Matters

Network chunking is unpredictable — you might get half a JSON object, or three frames at once. This parser handles every edge case without blocking or losing data.

## How To Use

Implement push(bytes) → Vec<Event> with internal buffer. Scan for \n\n boundaries. Parse event: and data: fields. Join multi-line data. Provide finish() for trailing data.

## Code Pattern

```rust
pub struct SseParser {
    buffer: Vec<u8>,
}

impl SseParser {
    pub fn push(&mut self, chunk: &[u8]) -> Vec<SseEvent> {
        self.buffer.extend_from_slice(chunk);
        let mut events = Vec::new();
        while let Some(pos) = find_frame_boundary(&self.buffer) {
            let frame = &self.buffer[..pos];
            if let Some(event) = parse_sse_frame(frame) {
                events.push(event);
            }
            self.buffer = self.buffer[pos + 2..].to_vec();
        }
        events
    }
    pub fn finish(&mut self) -> Vec<SseEvent> { /* flush remainder */ }
}
```
