<!-- ============================================================
     YOUTUBE VIDEO DIGEST — SUMMARY TEMPLATE

     FIXED ZONES: Overall Summary section, segment header format,
                  divider between overall and per-segment.
     VARIABLE ZONES: Summary text, segment titles, timestamps.

     Mode: summary
     Claude's task:
       1. Read all structured segment blocks in the input
       2. Write an Overall Summary (3-5 sentences covering the full video)
       3. For each segment, write a 1-3 sentence synthesis
       4. Preserve [Chapter]/[Auto-segmented] labels and timestamps

     Anti-patterns:
       - Do NOT copy transcript text verbatim into the summary
       - Do NOT editorialize or add opinions ("the speaker brilliantly...")
       - Do NOT invent content not supported by the transcript
       - Do NOT omit segments — every segment gets at least one sentence
     ============================================================ -->

<!-- [FIXED] Overall Summary section — always first, always this header -->
## Overall Summary

<!-- [VARIABLE] 3-5 sentences. Cover: main thesis, key arguments, and conclusion.
     Write for someone who has not watched the video. Be specific — avoid
     vague phrases like "the speaker discusses many topics". Name topics. -->
[VARIABLE: 3-5 sentence synthesis of the complete video. State the main thesis
or purpose, the key arguments or demonstrations, and the conclusion or takeaway.]

<!-- [FIXED] Divider between overall summary and per-segment summaries -->
---

<!-- [FIXED] Per-segment summary block.
     Repeat from here to the blank line for each segment.
     Header format matches full-transcript: LABEL TITLE TIMESTAMP -->

## [VARIABLE: [Chapter] or [Auto-segmented]] [VARIABLE: Segment Title] [VARIABLE: [H:MM:SS]]

<!-- [VARIABLE] 1-3 sentences for this segment.
     Include: the key claim or topic, supporting evidence or example
     if notable, and the transition or conclusion if the segment sets
     up the next. Be concrete — name the thing being discussed. -->
[VARIABLE: 1-3 sentence synthesis of this segment.]

<!-- [FIXED] Blank line between segments -->

<!-- [FIXED] End of segment block. Repeat for each segment. -->
