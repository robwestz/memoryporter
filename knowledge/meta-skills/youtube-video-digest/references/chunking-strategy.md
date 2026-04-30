# Chunking Strategy

> **When to read this:** When processing a video longer than 3 hours, when a digest output exceeds Claude's context window, or when you need to estimate token count before deciding whether to run full-transcript vs summary mode.

## Contents

- [Token Estimation](#token-estimation)
- [Single-Pass vs Chunked Processing](#single-pass-vs-chunked-processing)
- [Chunking Implementation](#chunking-implementation)
- [Mode Recommendations by Video Length](#mode-recommendations-by-video-length)
- [Overlap Logic](#overlap-logic)

---

## Token Estimation

Before passing a digest to Claude, estimate the token count to avoid truncation.

### Rough estimates

| Video length | Estimated tokens (full transcript) | Notes |
|-------------|-----------------------------------|-------|
| ≤ 15 minutes | ~2,000–4,000 | Always single-pass safe |
| 30 minutes | ~5,000–8,000 | Single-pass safe |
| 1 hour | ~10,000–18,000 | Single-pass safe |
| 2 hours | ~20,000–35,000 | Single-pass safe (Claude 200k context) |
| 3 hours | ~30,000–55,000 | Single-pass safe — approaching limit |
| 4+ hours | ~40,000–75,000+ | Consider chunked or use summary mode |

Rule of thumb: **1 hour of typical spoken English ≈ 8,000–15,000 tokens** at full transcript verbosity. Technical lectures run higher (more density); casual conversation runs lower.

### Counting tokens without an API call

```python
def estimate_tokens(text: str) -> int:
    """
    Rough estimate: 1 word ≈ 1.3 tokens for English prose.
    Actual tokenization varies; treat this as a lower bound.
    """
    word_count = len(text.split())
    return int(word_count * 1.3)
```

Add ~500 tokens for the metadata header and template overhead.

### When to be concerned

| Token estimate | Action |
|---------------|--------|
| < 100,000 | Single-pass safe for Claude (200k context) |
| 100,000–160,000 | Safe but leaves limited room for Claude's response; consider summary mode |
| > 160,000 | Switch to chunked processing or reduce to summary mode before loading |

---

## Single-Pass vs Chunked Processing

For most videos (up to ~3 hours), single-pass is correct — load the full digest and let Claude process it in one context.

### Single-pass (default)

```
[full digest] → Claude → [output]
```

- Simple, no state management
- All context visible simultaneously — better synthesis, Q&A, cross-referencing
- Preferred for all modes when transcript fits in context

### Chunked processing (long videos only)

```
[chunk 1] → Claude → [partial output 1]
[chunk 2] → Claude → [partial output 2]
    ...
[partial outputs 1..N] → Claude → [final synthesized output]
```

- Required only when single-pass exceeds context limit
- Introduces synthesis step — more prompting required
- Only use `summary` or `key-points` mode for chunked runs (verbatim transcript across chunks is impractical)

---

## Chunking Implementation

When chunked processing is necessary, split by chapter or segment boundaries — never by character count or token count mid-segment.

### Chunk size target

Aim for ~60,000 tokens per chunk (leaves ~140k for Claude's working context and response). This corresponds to roughly 45–90 minutes of video per chunk.

### Algorithm

```python
def chunk_segments(segments: list, max_tokens: int = 60000) -> list:
    """
    Group segments into chunks, each under max_tokens.
    Never splits a segment across chunks.
    Returns list of lists: [[seg1, seg2, ...], [seg5, seg6, ...], ...]
    """
    chunks = []
    current_chunk = []
    current_tokens = 0

    for seg in segments:
        seg_text = ' '.join(e['text'] for e in seg['entries'])
        seg_tokens = estimate_tokens(seg_text)

        if current_tokens + seg_tokens > max_tokens and current_chunk:
            chunks.append(current_chunk)
            current_chunk = []
            current_tokens = 0

        current_chunk.append(seg)
        current_tokens += seg_tokens

    if current_chunk:
        chunks.append(current_chunk)

    return chunks
```

### Prompting for chunked summary

For each chunk, use the summary template with this prefix:

```
This is chunk {N} of {total} from the video "{title}".
Summarize each segment below. You will synthesize all chunks later.
```

After all chunks, run a final synthesis:

```
Below are summaries of {total} chunks from "{title}" ({duration} total).
Write a single cohesive summary of the entire video.
```

---

## Mode Recommendations by Video Length

| Video length | Recommended mode | Reason |
|-------------|-----------------|--------|
| ≤ 30 min | Any mode | Fits easily; use what the user needs |
| 30–90 min | `full-transcript` or `summary` | Full transcript still practical |
| 90 min–3 hr | `summary` or `key-points` | Full transcript gets unwieldy for Q&A |
| 3–6 hr | `summary` (chunked if needed) | Single-pass may exceed context |
| > 6 hr | `key-points` with chunked processing | Only high-signal extraction is practical |

For `qa-extraction`: always works within a single chapter/session — run per-chapter for long videos rather than processing the full video at once.

---

## Overlap Logic

When using chunked processing, include the last segment of the previous chunk as the first segment of the next chunk (read-only context, not re-processed). This prevents information loss at chunk boundaries.

```python
def chunks_with_overlap(chunks: list) -> list:
    """
    Add the last segment of each chunk as a context-only header
    in the next chunk.
    """
    result = []
    for i, chunk in enumerate(chunks):
        if i == 0:
            result.append({'context': [], 'segments': chunk})
        else:
            result.append({'context': [chunks[i-1][-1]], 'segments': chunk})
    return result
```

In the prompt, present the overlap segment under a `## Context (from previous chunk)` header, instructing Claude not to summarize it again — only use it for continuity.

---

## Related

- [SKILL.md](../SKILL.md) — Parent skill; Step 5 (segmentation) and Step 6 (mode selection) reference this file
- [transcript-formats.md](transcript-formats.md) — The parsed entries that feed into token estimation
- [youtube-api-patterns.md](youtube-api-patterns.md) — Duration from the API is used for up-front length estimates
