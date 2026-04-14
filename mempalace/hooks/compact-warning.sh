#!/usr/bin/env bash
# Soft-warning for context approaching compaction threshold.
# Hard trigger is handled by autoCompactWindow in settings.json.
# Assumes Opus 1M context; adjust thresholds if running smaller models.
set -uo pipefail

input=$(cat)
session_id=$(printf '%s' "$input" | python -c "import sys,json;print(json.load(sys.stdin).get('session_id',''))" 2>/dev/null)
[ -z "$session_id" ] && exit 0

transcript=$(find "$HOME/.claude/projects" -name "${session_id}.jsonl" -type f 2>/dev/null | head -1)
[ -z "$transcript" ] && exit 0
[ ! -f "$transcript" ] && exit 0

size=$(stat -c%s "$transcript" 2>/dev/null)
[ -z "$size" ] && exit 0

# Rough byte-to-token ratio ~4.5 for jsonl transcripts. 1M-token context ≈ 4.5M bytes.
# 75% ≈ 3.4M, 88% ≈ 4.0M. autoCompactWindow handles the actual hard trigger.
soft_threshold=3400000
hard_threshold=4000000

if [ "$size" -ge "$hard_threshold" ]; then
  echo '{"systemMessage":"Context approx 88%+ — auto-compact imminent. Run /compact now to control what is preserved."}'
elif [ "$size" -ge "$soft_threshold" ]; then
  echo '{"systemMessage":"Context approx 75% — wrap up soon or run /compact to stay in control."}'
fi

exit 0
