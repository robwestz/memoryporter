# YouTube API Patterns

> **When to read this:** When you want to enrich metadata beyond what yt-dlp provides (e.g., view counts, like counts, full chapter data, caption track list), or when yt-dlp is being rate-limited and you need an authenticated alternative for metadata fetching.

## Contents

- [When to Use the API vs yt-dlp](#when-to-use-the-api-vs-yt-dlp)
- [Setup and Authentication](#setup-and-authentication)
- [Key Endpoints](#key-endpoints)
- [Fetching Video Metadata](#fetching-video-metadata)
- [Fetching Caption Tracks](#fetching-caption-tracks)
- [Rate Limits and Quota](#rate-limits-and-quota)
- [Error Handling](#error-handling)

---

## When to Use the API vs yt-dlp

| Need | yt-dlp | YouTube Data API v3 |
|------|--------|---------------------|
| Transcript text | Yes — primary | No (captions endpoint returns metadata only; content requires OAuth) |
| Basic metadata (title, channel, duration) | Yes — no key needed | Yes — requires API key |
| Chapter data | Yes (when available) | Yes — `chapters` in `contentDetails` |
| View/like counts, statistics | No | Yes — `statistics` part |
| Full caption track list (language codes) | Partial (`--list-subs`) | Yes — `captions.list` endpoint |
| Batch metadata for many videos | Slow — one at a time | Yes — up to 50 video IDs per request |
| Works without API key | Yes | No |
| Rate-limited | Yes (throttled aggressively) | No (generous quota) |

**Default:** use yt-dlp. Switch to the API only when you need statistics, batch metadata, or are hitting yt-dlp rate limits at scale.

---

## Setup and Authentication

The YouTube Data API v3 uses API key authentication for read-only public data. No OAuth is required for video metadata or caption track lists.

### Get an API key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. Enable "YouTube Data API v3"
4. Create credentials → API key
5. Optionally restrict the key to YouTube Data API v3

### Pass the key to the script

```bash
python scripts/extract_transcript.py <VIDEO_ID> --api-key YOUR_KEY_HERE
```

Or set the environment variable:

```bash
export YOUTUBE_API_KEY=YOUR_KEY_HERE
python scripts/extract_transcript.py <VIDEO_ID>
```

The script checks `--api-key` first, then `os.environ.get('YOUTUBE_API_KEY')`.

---

## Key Endpoints

| Endpoint | Base URL | Purpose |
|----------|----------|---------|
| `videos.list` | `https://www.googleapis.com/youtube/v3/videos` | Full video metadata including chapters, statistics |
| `captions.list` | `https://www.googleapis.com/youtube/v3/captions` | List caption tracks (language, kind, last updated) |
| `captions.download` | `https://www.googleapis.com/youtube/v3/captions/{id}` | Download caption content (requires OAuth — not used here) |

---

## Fetching Video Metadata

### Request

```python
import requests

def fetch_metadata_api(video_id: str, api_key: str) -> dict:
    url = 'https://www.googleapis.com/youtube/v3/videos'
    params = {
        'id': video_id,
        'key': api_key,
        'part': 'snippet,contentDetails,statistics',
    }
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    if not data.get('items'):
        raise ValueError(f"Video not found or private: {video_id}")

    return data['items'][0]
```

### Relevant fields in the response

| Field path | Content | Notes |
|------------|---------|-------|
| `snippet.title` | Video title | — |
| `snippet.channelTitle` | Channel name | — |
| `snippet.publishedAt` | ISO 8601 datetime | Convert to `YYYY-MM-DD` |
| `snippet.description` | Full description | Use for chapter-from-description parsing |
| `contentDetails.duration` | ISO 8601 duration (e.g., `PT1H23M45S`) | Parse with `isodate` or regex |
| `statistics.viewCount` | View count as string | Cast to int |
| `statistics.likeCount` | Like count as string | May be hidden (absent if so) |

### Parsing ISO 8601 duration

```python
import re

def parse_iso_duration(iso: str) -> int:
    """Convert PT1H23M45S to seconds."""
    match = re.match(
        r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso
    )
    if not match:
        return 0
    h = int(match.group(1) or 0)
    m = int(match.group(2) or 0)
    s = int(match.group(3) or 0)
    return h * 3600 + m * 60 + s
```

### Batch metadata (up to 50 videos)

```python
params = {
    'id': ','.join(video_ids),  # comma-separated, max 50
    'key': api_key,
    'part': 'snippet,contentDetails',
}
```

---

## Fetching Caption Tracks

`captions.list` returns the list of available tracks (language, kind, etc.) but **not the caption content**. Downloading content requires OAuth (not supported in this skill). Use this endpoint to know which language tracks exist before attempting yt-dlp download.

### Request

```python
def list_caption_tracks(video_id: str, api_key: str) -> list:
    url = 'https://www.googleapis.com/youtube/v3/captions'
    params = {'videoId': video_id, 'key': api_key, 'part': 'snippet'}
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json().get('items', [])
```

### Response fields

| Field | Values | Meaning |
|-------|--------|---------|
| `snippet.language` | BCP-47 code (`en`, `en-US`, `ja`) | Language of the track |
| `snippet.trackKind` | `standard`, `asr`, `forced` | `standard` = manual; `asr` = auto-generated |
| `snippet.name` | Human-readable label | Often empty for auto-captions |
| `snippet.isCC` | boolean | True if closed captions |
| `snippet.isAutoSynced` | boolean | Auto-synced from manual transcript |

Use `trackKind == 'standard'` to confirm manual captions exist before telling users they have high-quality transcripts.

---

## Rate Limits and Quota

| Operation | Quota cost | Daily free quota |
|-----------|-----------|-----------------|
| `videos.list` (1 video) | 1 unit | 10,000 units/day |
| `videos.list` (50 videos) | 1 unit | — |
| `captions.list` | 50 units | — |
| `captions.download` (OAuth) | 200 units | — |

At 1 unit per `videos.list` call, the free tier supports 10,000 metadata fetches per day — far more than yt-dlp can handle before throttling.

**Never use `captions.download`** in this skill — it requires OAuth, costs 200 units, and yt-dlp provides the same content without authentication.

---

## Error Handling

| HTTP status | Cause | Action |
|-------------|-------|--------|
| 400 | Bad request / invalid video ID | Validate video ID before calling |
| 403 | Invalid API key or quota exceeded | Check key validity; check daily quota in Cloud Console |
| 404 | Video not found | Treat as private/deleted |
| 429 | Rate limited | Back off; this is rare with API key auth |

```python
try:
    response.raise_for_status()
except requests.HTTPError as e:
    if e.response.status_code == 403:
        raise RuntimeError("YouTube API quota exceeded or key invalid") from e
    raise
```

---

## Related

- [SKILL.md](../SKILL.md) — Parent skill; Step 2 mentions API key as optional enhancement
- [transcript-formats.md](transcript-formats.md) — The transcript content still comes from yt-dlp even when using the API for metadata
- [chunking-strategy.md](chunking-strategy.md) — Duration from the API feeds the token estimation logic
