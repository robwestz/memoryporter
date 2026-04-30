# YouTube Extraction Scripts — Test Results

*Date: 2026-04-13 | Test video: https://www.youtube.com/watch?v=dQw4w9WgXcQ*

---

## Environment

| Item | Value |
|------|-------|
| Python | 3.14.3 |
| yt-dlp | 2026.03.17 |
| youtube-transcript-api | 1.2.4 |
| Platform | Windows 11 |

**Note:** `youtube-transcript-api` was not installed prior to this session. Installed via `pip install youtube-transcript-api`.

---

## Script: extract-metadata.py

**Command:**
```
python extract-metadata.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

**Status: PASS**

### Output summary

| Field | Value |
|-------|-------|
| `video_id` | `dQw4w9WgXcQ` |
| `title` | Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster) |
| `channel` | Rick Astley |
| `duration` | 213 seconds |
| `duration_string` | `3:33` |
| `publish_date` | `2009-10-25` |
| `view_count` | 1,762,022,281 |
| `like_count` | 18,934,401 |
| `tags` | 27 tags |
| `categories` | `["Music"]` |
| `chapters` | `[]` (no chapters on this video) |
| `has_subtitles` | `true` |
| `has_auto_captions` | `true` |
| `available_caption_langs` | 160+ languages |

### Notes

- `publish_date` correctly normalized from yt-dlp's `20091025` → `2009-10-25`
- `duration_string` correctly formatted from seconds
- Caption availability detection works: both manual subtitles and auto-captions detected
- No chapters on this video — `chapters: []` is correct, not an error

---

## Script: extract-transcript.py

**Command:**
```
python extract-transcript.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

**Status: PASS**

### Output summary

| Field | Value |
|-------|-------|
| `video_id` | `dQw4w9WgXcQ` |
| `transcript_source` | `manual` |
| `language` | `en` |
| `segments` | 61 |
| First segment | `{"text": "[♪♪♪]", "start": 1.36, "duration": 1.68, "timestamp": "0:01"}` |
| Last segment | `{"text": "♪ Never gonna tell a lie\nand hurt you ♪", "start": 207.92, "duration": 3.4, "timestamp": "3:27"}` |

### Notes

- Primary path (youtube-transcript-api) succeeded — `transcript_source: "manual"` confirms a human-authored English transcript was used, not auto-generated
- Each segment includes `text`, `start` (seconds), `duration` (seconds), and `timestamp` (human-readable)
- `full_text` key present: space-joined plain text of all segments

---

## API version gotcha — fixed during development

`youtube-transcript-api` changed its API between 0.x and 1.x:

| 0.x (old) | 1.x (current) |
|-----------|---------------|
| `YouTubeTranscriptApi.list_transcripts(id)` (class method) | `YouTubeTranscriptApi().list(id)` (instance method) |
| Transcript entries were dicts: `seg["text"]` | Entries are `FetchedTranscriptSnippet` objects: `seg.text` |

The script was corrected to use the 1.x instance API before first successful run. Both `.text`, `.start`, and `.duration` are attributes on `FetchedTranscriptSnippet`.

---

## Fallback path verification

The yt-dlp VTT fallback (`fetch_via_ytdlp`) was verified to work correctly during initial testing (before the transcript-api fix), producing valid timestamped segments from the VTT subtitle file. Key behaviors confirmed:

- VTT deduplication logic removes yt-dlp's overlapping-window artifact
- Inline timing tags (`<00:00:01.234>`) stripped from segment text
- `transcript_source` correctly set to `"auto-generated-vtt"` on fallback path

---

## Error handling — untested scenarios

The following error paths exist in the scripts but were not tested (they require inaccessible video types):

| Scenario | Expected output |
|----------|----------------|
| Private video | `{"error": "private_video", "message": "This video is private."}` |
| Deleted / unavailable video | `{"error": "unavailable", "message": "..."}` |
| Transcripts disabled | `{"error": "transcripts_disabled", "message": "..."}` |
| Invalid URL | `{"error": "invalid_url", "message": "..."}` |
| No subtitles at all | `{"error": "no_transcript", "message": "..."}` |

---

## Files created

```
knowledge/meta-skills/youtube-video-digest/scripts/
├── extract-metadata.py   — yt-dlp --dump-json → structured JSON
└── extract-transcript.py — youtube-transcript-api (primary) + yt-dlp VTT (fallback)
```
