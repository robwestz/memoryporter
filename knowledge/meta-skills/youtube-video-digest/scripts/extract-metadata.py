# extract-metadata.py — YouTube video metadata extractor
# Usage: python extract-metadata.py "https://youtube.com/watch?v=..."
# Requires: yt-dlp (mandatory) — no API key required
# Output: JSON to stdout with keys: video_id, title, channel, channel_url,
#         description, duration, duration_string, publish_date, upload_date,
#         view_count, like_count, tags, categories, chapters, thumbnail,
#         has_subtitles, has_auto_captions, url
# No API key required. Uses yt-dlp --dump-json (no video download).

import sys
import json
import re
import subprocess
import argparse


def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})",
        r"(?:embed/)([A-Za-z0-9_-]{11})",
        r"(?:shorts/)([A-Za-z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {url}")


def format_duration(seconds) -> str:
    if seconds is None:
        return "unknown"
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def parse_publish_date(raw: str | None) -> str | None:
    """Convert YYYYMMDD to YYYY-MM-DD."""
    if not raw or len(raw) != 8:
        return raw
    return f"{raw[:4]}-{raw[4:6]}-{raw[6:8]}"


def fetch_metadata(url: str) -> dict:
    cmd = [
        "yt-dlp",
        "--dump-json",
        "--skip-download",
        "--quiet",
        "--no-warnings",
        url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        stderr = result.stderr.strip()
        # Detect common error types
        if "private video" in stderr.lower() or "Private video" in result.stderr:
            return {"error": "private_video", "message": "This video is private."}
        if "not available" in stderr.lower() or "unavailable" in stderr.lower():
            return {"error": "unavailable", "message": "This video is unavailable."}
        if "does not exist" in stderr.lower():
            return {"error": "not_found", "message": "Video not found."}
        if "sign in" in stderr.lower():
            return {"error": "age_restricted", "message": "This video requires sign-in (age-restricted)."}
        return {"error": "ytdlp_failed", "message": stderr or "yt-dlp returned a non-zero exit code."}

    if not result.stdout.strip():
        return {"error": "empty_response", "message": "yt-dlp returned no data."}

    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError as e:
        return {"error": "parse_failed", "message": f"Could not parse yt-dlp output: {e}"}

    # Normalize chapters
    chapters = []
    raw_chapters = data.get("chapters") or []
    for ch in raw_chapters:
        chapters.append({
            "title": ch.get("title", ""),
            "start_time": ch.get("start_time"),
            "end_time": ch.get("end_time"),
            "timestamp": format_duration(ch.get("start_time")),
        })

    # Detect subtitle/caption availability
    subtitles = data.get("subtitles") or {}
    auto_captions = data.get("automatic_captions") or {}
    has_subtitles = bool(subtitles)
    has_auto_captions = bool(auto_captions)
    available_langs = sorted(set(list(subtitles.keys()) + list(auto_captions.keys())))

    duration_sec = data.get("duration")

    return {
        "video_id": data.get("id"),
        "title": data.get("title"),
        "channel": data.get("uploader") or data.get("channel"),
        "channel_id": data.get("channel_id") or data.get("uploader_id"),
        "channel_url": data.get("channel_url") or data.get("uploader_url"),
        "description": data.get("description"),
        "duration": duration_sec,
        "duration_string": format_duration(duration_sec),
        "publish_date": parse_publish_date(data.get("upload_date")),
        "view_count": data.get("view_count"),
        "like_count": data.get("like_count"),
        "tags": data.get("tags") or [],
        "categories": data.get("categories") or [],
        "chapters": chapters,
        "thumbnail": data.get("thumbnail"),
        "has_subtitles": has_subtitles,
        "has_auto_captions": has_auto_captions,
        "available_caption_langs": available_langs,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Extract YouTube video metadata as structured JSON."
    )
    parser.add_argument("url", help="YouTube video URL")
    args = parser.parse_args()

    try:
        video_id = extract_video_id(args.url)
    except ValueError as e:
        print(json.dumps({"error": "invalid_url", "message": str(e)}), flush=True)
        sys.exit(1)

    result = fetch_metadata(args.url)

    # Ensure url and video_id are always present in output
    if "error" not in result:
        output = {"url": args.url, **result}
    else:
        output = {"url": args.url, "video_id": video_id, **result}

    print(json.dumps(output, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
