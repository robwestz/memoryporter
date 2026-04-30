<!-- [FIXED] Metrics dashboard — used in report-showcase Mode 1 output -->
<!-- Rule: [NO DATA] is explicit — never estimate, never leave a field blank without the tag -->
<!-- Source column: name the report file that contained this number -->

## Key Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Files created | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Files modified | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Files deleted | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Tests written | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Tests passing | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Tests failing | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Issues found | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Issues fixed | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Decisions made | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Commands succeeded | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Commands failed | <!-- [VARIABLE: N or [NO DATA]] --> | <!-- [VARIABLE: report file name] --> |
| Time span covered | <!-- [VARIABLE: YYYY-MM-DD to YYYY-MM-DD or [NO DATA]] --> | <!-- [VARIABLE: report files] --> |

<!-- [FIXED] ASCII chart section — only include rows where the value is NOT [NO DATA] -->
<!-- Compute bar: filled_blocks = round(value / max_value * 20), empty_blocks = 20 - filled_blocks -->
<!-- Use █ for filled, ░ for empty -->

```
<!-- [VARIABLE: Delete this entire block if all metrics are [NO DATA]] -->

Files: created vs modified vs deleted
Created  <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->
Modified <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->
Deleted  <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->

Tests: written vs passing vs failing
Written  <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->
Passing  <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->
Failing  <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->

Issues: found vs fixed
Found    <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->
Fixed    <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->

Commands: succeeded vs failed
OK       <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->
Failed   <!-- [VARIABLE: bar] --> <!-- [VARIABLE: N] -->
```

<!-- [FIXED] Example of a completed dashboard with real values from portable-kit project-wiki build -->
<!-- Use this as a reference for what a filled dashboard looks like -->
<!--
EXAMPLE (from project-wiki Phase A–D, 2026-04-10 to 2026-04-13):

| Metric | Value | Source |
|--------|-------|--------|
| Files created | 48 | docs/morning-report-2026-04-13.md |
| Files modified | 12 | docs/morning-report-2026-04-13.md |
| Files deleted | 0 | docs/morning-report-2026-04-13.md |
| Tests written | 0 | [NO DATA] |
| Tests passing | 0 | [NO DATA] |
| Tests failing | 0 | [NO DATA] |
| Issues found | 3 | docs/morning-report-2026-04-13.md |
| Issues fixed | 3 | docs/morning-report-2026-04-13.md |
| Decisions made | 5 | docs/forge-artifacts/showcase-design.md |
| Commands succeeded | 47 | docs/morning-report-2026-04-13.md |
| Commands failed | 4 | docs/morning-report-2026-04-13.md |
| Time span covered | 2026-04-10 to 2026-04-13 | All reports |

Files: created vs modified vs deleted
Created  ████████████████████  48
Modified █████░░░░░░░░░░░░░░░  12
Deleted  ░░░░░░░░░░░░░░░░░░░░   0

Issues: found vs fixed
Found    ███░░░░░░░░░░░░░░░░░   3
Fixed    ███░░░░░░░░░░░░░░░░░   3  ← 100% fix rate

Commands: succeeded vs failed
OK       ████████████████████  47
Failed   ██░░░░░░░░░░░░░░░░░░   4  ← 92% success rate
-->
