#!/usr/bin/env python3
"""Generate a showcase-presenter brief for a repo-strategy case.

Reads the core artifacts (and any scaffolded branches), writes a
self-contained prompt block at <case-dir>/presentation-brief.md that the
showcase-presenter skill can ingest in Demo mode. The brief embeds file
paths, goal, stage, and audit status so the showcase run stays grounded
in what actually exists on disk instead of paraphrasing from memory.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

CORE_ARTIFACTS = [
    ('Request brief', 'core/01-request-brief.md'),
    ('Repo map', 'core/02-repo-map.md'),
    ('Constraint map', 'core/03-constraint-map.md'),
    ('Purpose chain', 'core/04-purpose-chain.md'),
    ('Failure mode atlas', 'core/05-failure-mode-atlas.md'),
    ('Options matrix', 'core/06-options-matrix.md'),
]

BRANCH_ARTIFACTS = [
    ('Branch charter', '01-branch-charter.md'),
    ('Evidence plan', '02-evidence-plan.md'),
    ('Validation plan', '03-validation-plan.md'),
    ('Subskill opportunities', '04-subskill-opportunities.md'),
]


def run_audit(case_dir: Path) -> tuple[int, str]:
    script = Path(__file__).with_name('mechanical_audit.py')
    result = subprocess.run(
        [sys.executable, str(script), str(case_dir), '--strict'],
        capture_output=True,
        text=True,
    )
    return result.returncode, result.stdout + result.stderr


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('case_dir', help='Path to a case workspace')
    parser.add_argument('--skip-audit', action='store_true', help='Do not run the strict audit before writing the brief')
    args = parser.parse_args()

    case_dir = Path(args.case_dir).resolve()
    if not case_dir.exists():
        print(f'ERROR: case directory does not exist: {case_dir}', file=sys.stderr)
        return 1

    manifest_path = case_dir / 'case.json'
    manifest: dict = {}
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))

    case_slug = manifest.get('case_slug', case_dir.name)
    goal = manifest.get('goal', '(goal not recorded)')
    stage = manifest.get('stage', 'unknown')
    repo_hint = manifest.get('repo_hint', '(not provided)')

    audit_status = 'skipped'
    audit_output = ''
    if not args.skip_audit:
        code, audit_output = run_audit(case_dir)
        audit_status = 'passed' if code == 0 else 'failed'

    core_rows: list[str] = []
    for title, rel in CORE_ARTIFACTS:
        p = case_dir / rel
        exists = p.exists()
        lines = len(p.read_text(encoding='utf-8').splitlines()) if exists else 0
        badge = '[OK]' if exists and lines > 0 else '[BROKEN]'
        core_rows.append(f'| {title} | `{rel}` | {lines} | {badge} |')

    branch_sections: list[str] = []
    branches_dir = case_dir / 'branches'
    if branches_dir.exists():
        for branch_dir in sorted(p for p in branches_dir.iterdir() if p.is_dir()):
            rows = []
            for title, fname in BRANCH_ARTIFACTS:
                p = branch_dir / fname
                exists = p.exists()
                lines = len(p.read_text(encoding='utf-8').splitlines()) if exists else 0
                badge = '[OK]' if exists and lines > 0 else '[BROKEN]'
                rows.append(f'| {title} | `branches/{branch_dir.name}/{fname}` | {lines} | {badge} |')
            branch_sections.append(
                f'### Branch: {branch_dir.name}\n\n'
                f'| Artifact | Path | Lines | Status |\n'
                f'|---|---|---|---|\n' + '\n'.join(rows)
            )

    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    brief = f"""# Showcase brief — {case_slug}

Generated: {generated_at}
Stage: `{stage}`
Audit (strict): `{audit_status}`

## Prompt for showcase-presenter (Demo mode)

Run `/showcase-presenter` with this prompt:

> Produce a Demo-mode showcase for the case at `{case_dir}`. The case is
> a repo-strategy-orchestrator output — treat each of the six core
> artifacts and every branch folder as a capability card. Attach a real
> file to every claim. Badge any artifact whose file is missing, empty,
> or still contains template placeholders with `[BROKEN]` or
> `[INCOMPLETE]`. Do not paraphrase artifacts whose files are missing.

## Case context

- Goal: {goal}
- Repo hint: {repo_hint}
- Workspace: `{case_dir}`

## Core artifacts

| Artifact | Path | Lines | Status |
|---|---|---|---|
{chr(10).join(core_rows)}

## Branches

{chr(10).join(branch_sections) if branch_sections else '_No branches scaffolded yet._'}

## Audit output

```
{audit_output.strip() or '(audit skipped)'}
```
"""

    brief_path = case_dir / 'presentation-brief.md'
    brief_path.write_text(brief, encoding='utf-8')
    print(f'OK: wrote {brief_path}')
    print(f'  stage={stage}  audit={audit_status}')
    print(f'  next: hand the brief to /showcase-presenter')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
