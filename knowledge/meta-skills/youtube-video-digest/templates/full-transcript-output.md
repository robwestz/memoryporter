<!-- ============================================================
     YOUTUBE VIDEO DIGEST — FULL TRANSCRIPT TEMPLATE

     FIXED ZONES: Segment header format, timestamp format.
     VARIABLE ZONES: Segment label, title, timestamps, text.

     Mode: full-transcript
     Claude's task: emit all segment text verbatim with timestamps.
     No summarization. No selection. No reduction.

     Usage: append this block after metadata-header.md, repeating
     the segment block once per segment.
     ============================================================ -->

<!-- [FIXED] Mode label comment — always present for full-transcript -->
<!-- Mode: full-transcript — verbatim transcript with timestamps -->

<!-- [FIXED] Segment block pattern.
     Repeat from here to the blank line for each segment.
     The H2 header format is: LABEL TITLE TIMESTAMP — never reorder these. -->

## [VARIABLE: [Chapter] or [Auto-segmented]] [VARIABLE: Segment Title] [VARIABLE: [H:MM:SS]]

<!-- [VARIABLE] One line per transcript entry.
     Format: [H:MM:SS] text
     No blank lines between entries within a segment.
     Do NOT summarize, paraphrase, or omit entries in this mode. -->
[VARIABLE: [H:MM:SS] transcript entry text]
[VARIABLE: [H:MM:SS] transcript entry text]
[VARIABLE: [H:MM:SS] transcript entry text]

<!-- [FIXED] Blank line between segments — required for markdown rendering -->

<!-- [FIXED] End of segment block. Repeat above block for each segment. -->
