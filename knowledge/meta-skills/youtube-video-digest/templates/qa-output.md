<!-- ============================================================
     YOUTUBE VIDEO DIGEST — Q&A EXTRACTION TEMPLATE

     FIXED ZONES: Section headers, Q/A format, divider, Unanswered section.
     VARIABLE ZONES: Question text, answer text, timestamps.

     Mode: qa-extraction
     Claude's task:
       1. Read all structured segment blocks in the input
       2. Identify questions that are:
          a. Explicitly asked by the speaker ("The question is...", "How do we...")
          b. Implied by the speaker's framing ("This begs the question...")
          c. Likely asked by a viewer after watching this segment
       3. For each question, provide the answer from the transcript
       4. Attach [H:MM:SS] pointing to where the answer appears
       5. If a question is posed but not answered, move it to Unanswered Questions
       6. Aim for 5-15 Q&A pairs total — more is not better

     Anti-patterns:
       - Do NOT manufacture answers not supported by the transcript
       - Do NOT ask trivial questions ("What is the speaker's name?")
       - Do NOT skip the [H:MM:SS] timestamp — every answer needs a source anchor
       - Do NOT include the same question twice under different phrasing
     ============================================================ -->

<!-- [FIXED] Section header -->
## Questions & Answers

<!-- [FIXED] Q&A pair block.
     Repeat from **Q:** to the horizontal rule for each pair.
     Bold Q and A labels are FIXED. Text and timestamp are VARIABLE. -->

**Q:** [VARIABLE: Question text as a complete sentence ending with ?]

**A:** [VARIABLE: Answer drawn directly from transcript content, 1-3 sentences.] — [VARIABLE: [H:MM:SS]]

---

<!-- [FIXED] End of Q&A pair block. Repeat for each pair. -->

<!-- [FIXED] Unanswered Questions section.
     Include only if one or more questions were raised but not answered.
     Delete this entire section if all questions were answered. -->
## Unanswered Questions

<!-- [VARIABLE] List questions raised in the video that were not answered.
     Format: - [question text]
     These are valuable — they indicate gaps or things to follow up on. -->
- [VARIABLE: Question that was raised but not resolved in the video]
