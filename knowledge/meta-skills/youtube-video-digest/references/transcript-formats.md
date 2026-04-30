# Transcript Formats

> **When to read this:** When `parse_srt()` in `extract_transcript.py` is producing garbled output, you need to add JSON3 support, or you are debugging why timestamps are off. Also read when adapting the parser to a new caption format.

## Contents

- [Format Overview](#format-overview)
- [SRT — SubRip Text](#srt--subrip-text)
- [VTT — WebVTT](#vtt--webvtt)
- [JSON3 — YouTube Native](#json3--youtube-native)
- [Format Selection Logic](#format-selection-logic)
- [Common Parsing Pitfalls](#common-parsing-pitfalls)

---

## Format Overview

| Format | Extension | Timing granularity | HTML tags | Source |
|--------|-----------|-------------------|-----------|--------|
| SRT | `.srt` | Line-level (~2-5 sec) | Sometimes (from VTT conversion) | yt-dlp default converted output |
| VTT | `.vtt` | Line-level (~2-5 sec) | Yes (`<c>`, `<b>`, font) | yt-dlp `--write-subs` raw output |
| JSON3 | `.json3` | Word-level (~0.1 sec) | Yes (inline in `utf8` field) | yt-dlp `--write-subs --sub-format json3` |

The script uses `--convert-subs srt` by default, which normalizes all formats to SRT. This sacrifices word-level timing from JSON3 but simplifies the parser significantly. If you need word-level timing (e.g., to highlight words as audio plays), switch to JSON3 and use the parser described below.

---

## SRT — SubRip Text

Standard subtitle format. yt-dlp produces this after conversion from VTT or JSON3.

### Structure

```
1
00:00:04,280 --> 00:00:07,920
Welcome to this lecture on distributed systems.

2
00:00:07,920 --> 00:00:12,140
Today we'll cover consensus algorithms,
specifically the Raft protocol.

3
00:00:12,140 --> 00:00:15,000
Let's start with the problem statement.
```

### Parsing rules

1. Split on double newlines (`\n\n`) to get blocks
2. First line of block: sequence number (ignore — not reliable for ordering)
3. Second line: `HH:MM:SS,mmm --> HH:MM:SS,mmm`
4. Remaining lines: text (may be multi-line — join with space)
5. Strip HTML tags (`<[^>]+>`) after joining — yt-dlp VTT→SRT conversion preserves some tags

### Timestamp regex

```python
r'(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})'
```

Note the comma separator between seconds and milliseconds (`,`) — VTT uses a dot (`.`). After `--convert-subs srt`, the output always uses a comma.

---

## VTT — WebVTT

Raw format produced by yt-dlp before conversion. Not used by default in this skill (we convert to SRT), but documented here if you need the raw format or if conversion fails.

### Structure

```
WEBVTT
Kind: captions
Language: en

00:00:04.280 --> 00:00:07.920 align:start position:0%
Welcome to <c> this lecture</c> on <c>distributed</c> systems.

00:00:07.920 --> 00:00:12.140 align:start position:0%
Today we'll cover <c>consensus algorithms,</c>
```

### Key differences from SRT

- File must begin with `WEBVTT` header
- Timestamp separator is `.` not `,`
- May include positioning annotations after the timestamp (`align:start position:0%`) — strip these
- Inline `<c>` tags appear frequently in auto-captions — strip all HTML tags
- No sequence numbers — cues are separated by blank lines

### When to use VTT directly

Only if `--convert-subs srt` is unavailable (older yt-dlp version) or if you need the positioning metadata for synchronized display. For Claude consumption, SRT is always preferable.

---

## JSON3 — YouTube Native

YouTube's internal caption format, accessible via yt-dlp with `--sub-format json3`. Not the default in this skill, but produces the highest-quality timing data.

### Structure

```json
{
  "events": [
    {
      "tStartMs": 4280,
      "dDurationMs": 3640,
      "segs": [
        {"utf8": "Welcome to "},
        {"utf8": "this", "tOffsetMs": 200},
        {"utf8": " lecture", "tOffsetMs": 400},
        {"utf8": " on distributed systems.", "tOffsetMs": 800}
      ]
    },
    {
      "tStartMs": 7920,
      "dDurationMs": 4220,
      "segs": [
        {"utf8": "Today we'll cover "},
        {"utf8": "consensus algorithms,", "tOffsetMs": 1100}
      ]
    }
  ]
}
```

### Parsing JSON3

```python
def parse_json3(data: dict) -> list:
    entries = []
    for event in data.get('events', []):
        start_ms = event.get('tStartMs', 0)
        duration_ms = event.get('dDurationMs', 0)
        segs = event.get('segs', [])
        text = ''.join(s.get('utf8', '') for s in segs).strip()
        text = re.sub(r'<[^>]+>', '', text).strip()
        if text and text != '\n':
            entries.append({
                'start_ms': start_ms,
                'end_ms': start_ms + duration_ms,
                'text': text,
            })
    return entries
```

### When to use JSON3

- When you need precise word-level boundaries for semantic chunking
- When building a synchronized transcript viewer
- When auto-segmentation quality is poor and you want finer boundary detection

To fetch JSON3 with yt-dlp, replace `--convert-subs srt` with `--sub-format json3` and remove the conversion flag.

---

## Format Selection Logic

The script's default path uses SRT (via `--convert-subs srt`) because it is simpler to parse uniformly. Use this table to decide if you need to change the format:

| Requirement | Format | Change needed |
|-------------|--------|--------------|
| Works reliably across all videos | SRT | Default — no change |
| Word-level timestamps | JSON3 | Replace `--convert-subs srt` with `--sub-format json3`; update parser |
| Display subtitle positioning | VTT | Remove `--convert-subs srt`; use VTT parser |
| Smallest file size | SRT | Default |
| Confidence scores per word | JSON3 | `accentMs` field if present; not always available |

---

## Common Parsing Pitfalls

| Symptom | Cause | Fix |
|---------|-------|-----|
| Text contains `<c>`, `<b>`, or color tags | HTML from auto-captions not stripped | Apply `re.sub(r'<[^>]+>', '', text)` after joining lines |
| Timestamps off by 1000x | Milliseconds treated as seconds | Verify `_to_ms()` function divides correctly; SRT uses ms, JSON3 uses ms already |
| Empty entries in parsed list | Blank text after HTML stripping | Filter with `if text:` check after cleaning |
| Duplicate consecutive lines | VTT cue overlap (yt-dlp quirk) | Deduplicate consecutive entries with identical text |
| Multi-line entries joined with newline instead of space | Joining with `'\n'.join()` instead of `' '.join()` | Use `' '.join(lines[i+1:])` when parsing SRT text blocks |
| Wrong encoding (é → é, etc.) | File opened without explicit encoding | Always use `encoding='utf-8'` in `Path.read_text()` |

---

## Related

- [SKILL.md](../SKILL.md) — Parent skill; Step 4 references this file
- [chunking-strategy.md](chunking-strategy.md) — How segments derived from parsed entries map to token budgets
- [youtube-api-patterns.md](youtube-api-patterns.md) — Alternative metadata source that also returns caption track info
