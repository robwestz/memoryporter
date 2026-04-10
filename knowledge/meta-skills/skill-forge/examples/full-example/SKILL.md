---
name: status-report-generator
description: |
  Generate structured project status reports from Git history, issue trackers, and
  conversation context. Use when someone asks "what happened this week", "write a
  status update", "sprint report", "stakeholder update", or needs a summary of
  recent project activity for any audience (team, management, client). Supports
  multiple report templates for different audiences.
author: Example Author
version: 1.0.0
---

# Status Report Generator

## Purpose

Turn scattered project activity (commits, issues, conversations, decisions) into
polished status reports tailored to the audience. Same data, different lens.

## When to Use

- End of sprint or week — writing a team status update
- Client check-in — summarizing progress for non-technical stakeholders
- Management report — highlighting risks, blockers, and milestones
- Handoff — documenting what happened for the next person

## When NOT to Use

- Post-mortem analysis (use a dedicated incident review skill)
- Planning (this reports on what happened, not what will happen)

## Process

### Step 1: Gather Activity

| Source | How to gather | What to extract |
|--------|--------------|----------------|
| Git log | `git log --since="1 week ago" --oneline` | Commits grouped by area |
| Issues/PRs | Read issue tracker or `gh pr list --state merged` | Completed, in-progress, blocked |
| Conversations | Search MemPalace or conversation history | Decisions made, questions raised |
| Meetings | Check meeting notes or panning-for-gold outputs | Action items, stakeholder feedback |

### Step 2: Select Template

Choose the template matching the audience:

| Audience | Template | Tone | Detail level |
|----------|----------|------|-------------|
| Team | `templates/team-status.md` | Direct, technical | High — code refs OK |
| Management | `templates/management-status.md` | Summary, risk-focused | Medium — no code |
| Client | `templates/client-status.md` | Professional, outcome-focused | Low — business terms |

Read the selected template from `templates/`. Follow its Fixed/Variable zones.

### Step 3: Draft the Report

Fill the template's Variable zones with gathered activity. Rules:

| Rule | Why |
|------|-----|
| Lead with the most important update | Reader's attention is highest at the start |
| Quantify progress | "Completed 4 of 7 tasks" not "made good progress" |
| State blockers explicitly | Hidden blockers don't get unblocked |
| Separate facts from opinion | "Deployment delayed 2 days" (fact) vs "I think we can catch up" (opinion) |
| Use past tense for completed, present for in-progress | Consistent temporal framing |

**Anti-pattern:** Do not inflate progress. "80% complete" without evidence is worse
than "3 of 5 tasks done, 2 in progress with dependencies."

### Step 4: Verify

- [ ] All activity sources checked (git, issues, conversations)
- [ ] Template Fixed zones preserved
- [ ] No technical jargon in client/management reports
- [ ] Blockers listed with owner and expected resolution
- [ ] Dates are specific, not "soon" or "shortly"

## Output

A markdown status report following the selected template, saved to
`docs/status/YYYY-MM-DD-[audience]-status.md`.

## Notes

- Templates in `templates/` are the starting points — never write from scratch
- For recurring reports, compare with the previous report to highlight changes
- This skill gathers and formats — it does not make up activity
