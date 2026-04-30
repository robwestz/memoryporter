<!-- ============================================================
     YOUTUBE VIDEO DIGEST — KEY POINTS TEMPLATE

     FIXED ZONES: Key Points H2, Sources line, theme group format.
     VARIABLE ZONES: Theme names, bullet text, timestamps.

     Mode: key-points
     Claude's task:
       1. Read all structured segment blocks in the input
       2. Extract factual claims, insights, recommendations, action items
       3. Group by theme (not by segment — themes cut across segments)
       4. Deduplicate — one point, one bullet, even if repeated in video
       5. Attach [H:MM:SS] source timestamp to each bullet (first occurrence)
       6. Aim for 15-25 total points across all themes

     Anti-patterns:
       - Do NOT create one theme per segment — that defeats grouping
       - Do NOT include trivial statements ("the speaker says hello")
       - Do NOT exceed 25 bullets total — force prioritization
       - Do NOT omit timestamps — every bullet needs a source anchor
     ============================================================ -->

<!-- [FIXED] Section header — always this exact heading -->
## Key Points

<!-- [FIXED] Theme group block.
     Each theme is an H3 with a descriptive label.
     Repeat from the H3 to the blank line for each theme.
     Typical number of themes: 3-7. -->

### [VARIABLE: Theme Name — noun phrase, e.g. "Core Argument", "Implementation Steps", "Risks and Caveats"]

<!-- [VARIABLE] Bullet list for this theme.
     Format: - [point text] — [H:MM:SS]
     Each bullet: one complete thought, max 20 words, with timestamp.
     Order within theme: most important first. -->
- [VARIABLE: Key point text] — [VARIABLE: [H:MM:SS]]
- [VARIABLE: Key point text] — [VARIABLE: [H:MM:SS]]

<!-- [FIXED] Blank line between themes -->

### [VARIABLE: Theme Name]

- [VARIABLE: Key point text] — [VARIABLE: [H:MM:SS]]

<!-- [FIXED] End of theme block. Repeat for each theme. -->

<!-- [FIXED] Sources line — always last, separated by horizontal rule -->
---
**Source segments:** [VARIABLE: Comma-separated list of segment titles used, e.g. "Introduction, Core Concepts, Q&A"]
