# Status Report Generator

> Generate structured project status reports from Git history, issues, and conversations — tailored to the audience.

## What It Does

Gathers project activity from multiple sources (git, issues, conversations, meetings), selects the appropriate report template for the audience (team, management, client), and produces a polished status report. Same data, different presentation.

## Supported Clients

- Claude Code (primary)
- Any AI client with git access and file writing

## Prerequisites

- A project with git history
- Optional: issue tracker access, MemPalace for conversation context

## Installation

```bash
cp -r status-report-generator/ ~/.claude/skills/status-report-generator/
```

## Trigger Conditions

- "What happened this week"
- "Write a status update"
- "Sprint report" or "stakeholder update"
- End-of-sprint or end-of-week summaries

## Expected Outcome

A markdown status report saved to `docs/status/`, following the audience-appropriate template with quantified progress, explicit blockers, and specific dates.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill — 4-step process |
| `README.md` | This file |
| `metadata.json` | Package metadata |
| `templates/team-status.md` | Template for team updates (technical, detailed) |
| `templates/management-status.md` | Template for management (summary, risk-focused) |
| `templates/client-status.md` | Template for clients (professional, outcome-focused) |

## Troubleshooting

**Issue:** Report feels thin — not enough activity to report.
**Solution:** Check all 4 sources in Step 1. Conversations and meetings often contain decisions and context that git log misses.

**Issue:** Client report too technical.
**Solution:** Re-read `templates/client-status.md`. Replace code references with business outcomes. "Implemented caching" becomes "Improved page load speed by 40%."
