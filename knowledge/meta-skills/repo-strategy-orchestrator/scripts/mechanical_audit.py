#!/usr/bin/env python3
"""Validate the structural and content contract of a repo-strategy case workspace.

Modes:
  (default) structural  -- required files and headings exist
  --strict              -- also: each section has filled content (no blank
                           bullets), evidence tags appear across the case,
                           and options-matrix contains an Anti-simplification
                           review with filled answers. On success, advances
                           case.json stage from core-in-progress to
                           awaiting-user-choice.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
import sys

EXPECTED_SCHEMA_VERSION = 2

CORE_REQUIREMENTS = {
    'core/01-request-brief.md': ['## Objective', '## Repo target', '## Known facts', '## Open questions', '## Done criteria'],
    'core/02-repo-map.md': ['## Entry points', '## Key modules', '## Interfaces and dependencies', '## Build and runtime cues', '## Unknowns'],
    'core/03-constraint-map.md': ['## Hard constraints', '## Soft constraints', '## Epistemic constraints', '## Process constraints', '## Constraint rationale', '## What must not be simplified'],
    'core/04-purpose-chain.md': ['## User outcome', '## Intermediate effects', '## Step-to-step dependencies', '## Global success conditions', '## Local optimizations to avoid'],
    'core/05-failure-mode-atlas.md': ['## Likely failure modes', '## Existing safeguards', '## Missing safeguards', '## Verification ideas', '## False positive improvements to watch for'],
    'core/06-options-matrix.md': ['## Standard options', '## Comparison matrix', '## Recommendation posture', '## User-defined option slot', '## Anti-simplification review'],
}

BRANCH_REQUIREMENTS = {
    '01-branch-charter.md': ['## Branch objective', '## Why this branch', '## Inputs reused from core', '## Non-goals', '## Exit criteria'],
    '02-evidence-plan.md': ['## Claims to verify', '## Evidence sources', '## Gaps and assumptions', '## Required checks'],
    '03-validation-plan.md': ['## Success tests', '## Failure triggers', '## Rollback or containment', '## Demo artifacts'],
    '04-subskill-opportunities.md': ['## Repeatable pattern', '## Candidate subskills', '## Shared assets', '## Deferred opportunities'],
}

EVIDENCE_TAGS = ['[OBSERVED]', '[DERIVED]', '[ASSUMED]', '[OPEN-RISK]']
REQUIRED_EVIDENCE_TAGS = ['[OBSERVED]', '[ASSUMED]']

ANTI_SIMPLIFICATION_QUESTIONS = [
    '1. What existing safeguard',
    '2. Which output looks better',
    '3. Which assumption is being smuggled',
    '4. What would a false',
]

BULLET_RE = re.compile(r'^\s*(?:[-*]|\d+\.)\s+(.*)$')
HEADING_RE = re.compile(r'^(#{1,6})\s+(.*)$')


def read_text(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def split_sections(text: str) -> dict[str, list[str]]:
    """Return {heading_line: [content_lines]} for every ## heading.

    Guidance blocks after a heading (short paragraphs describing how to
    fill the section) are kept — the real test is whether bullets below
    have substantive content.
    """
    sections: dict[str, list[str]] = {}
    current: str | None = None
    buf: list[str] = []
    for line in text.split('\n'):
        m = HEADING_RE.match(line)
        if m and m.group(1) == '##':
            if current is not None:
                sections[current] = buf
            current = line.strip()
            buf = []
        else:
            if current is not None:
                buf.append(line)
    if current is not None:
        sections[current] = buf
    return sections


GUIDANCE_PREFIXES = ('tag each', 'answer each', 'leave no', 'drop the tag')


def section_has_filled_content(lines: list[str], min_chars: int = 10) -> bool:
    """True when the section contains at least one piece of substantive
    content: a filled bullet, a populated table row, or a non-trivial
    paragraph line. Evidence-tag prefixes and known guidance blurbs do
    not count toward the minimum.
    """
    for line in lines:
        m = BULLET_RE.match(line)
        if m:
            content = m.group(1).strip()
            for tag in EVIDENCE_TAGS:
                if content.startswith(tag):
                    content = content[len(tag):].strip()
                    break
            if len(content) >= min_chars:
                return True
    in_table = False
    for line in lines:
        if line.strip().startswith('|'):
            if '---' in line:
                in_table = True
                continue
            if in_table:
                cells = [c.strip() for c in line.strip().strip('|').split('|')]
                non_empty = [c for c in cells if c and c != '---']
                if len(non_empty) >= 2:
                    return True
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith(('#', '-', '*', '|')) or BULLET_RE.match(line):
            continue
        if stripped.lower().startswith(GUIDANCE_PREFIXES):
            continue
        if len(stripped) >= min_chars:
            return True
    return False


def check_file_structural(path: Path, headings: list[str]) -> list[str]:
    issues: list[str] = []
    if not path.exists():
        return [f'missing file: {path}']
    text = read_text(path)
    for heading in headings:
        if heading not in text:
            issues.append(f'missing heading {heading!r} in {path}')
    return issues


def check_file_strict(path: Path, headings: list[str]) -> list[str]:
    issues: list[str] = []
    if not path.exists():
        return []
    text = read_text(path)
    sections = split_sections(text)
    for heading in headings:
        if heading not in text:
            continue
        key = next((k for k in sections if k.strip() == heading), None)
        if key is None:
            continue
        if not section_has_filled_content(sections[key]):
            issues.append(
                f'section {heading!r} in {path.name} has no filled content '
                f'(need a bullet with >= 10 chars or a populated table row)'
            )
    return issues


def check_anti_simplification(options_matrix_path: Path) -> list[str]:
    issues: list[str] = []
    if not options_matrix_path.exists():
        return issues
    text = read_text(options_matrix_path)
    if '## Anti-simplification review' not in text:
        issues.append(
            f'missing anti-simplification review in {options_matrix_path.name} '
            f'(run bootstrap_case.py from schema_version 2+)'
        )
        return issues
    sections = split_sections(text)
    key = next((k for k in sections if k.strip() == '## Anti-simplification review'), None)
    if key is None:
        return issues
    block = '\n'.join(sections[key])
    for q in ANTI_SIMPLIFICATION_QUESTIONS:
        if q not in block:
            issues.append(
                f'anti-simplification review missing question starting '
                f'{q!r} in {options_matrix_path.name}'
            )
    sub_bullets = re.findall(r'^\s+-\s+[A-C]:\s*(.*)$', block, flags=re.MULTILINE)
    filled = [b for b in sub_bullets if len(b.strip()) >= 3]
    if len(filled) < 4:
        issues.append(
            f'anti-simplification review has only {len(filled)} filled '
            f'sub-answers in {options_matrix_path.name} (need >= 4 across '
            f'the four questions)'
        )
    return issues


def check_evidence_tags(case_dir: Path) -> list[str]:
    issues: list[str] = []
    combined = ''
    for rel in CORE_REQUIREMENTS:
        p = case_dir / rel
        if p.exists():
            combined += read_text(p)
    missing = [t for t in REQUIRED_EVIDENCE_TAGS if t not in combined]
    if missing:
        issues.append(
            f'core artifacts missing required evidence tags: {missing} '
            f'(every case must contain at least one [OBSERVED] and one '
            f'[ASSUMED] across the six core files)'
        )
    return issues


def advance_stage(case_dir: Path, issues: list[str]) -> tuple[bool, str]:
    manifest_path = case_dir / 'case.json'
    if not manifest_path.exists():
        return False, 'no case.json — cannot advance stage'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    current = manifest.get('stage', 'unknown')
    if issues:
        return False, f'audit failed; stage stays at {current!r}'
    if current == 'core-in-progress':
        manifest['stage'] = 'awaiting-user-choice'
        manifest['advanced_at'] = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
        return True, 'stage advanced: core-in-progress -> awaiting-user-choice'
    return False, f'stage already {current!r}; no advance'


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('case_dir', help='Path to a case workspace')
    parser.add_argument('--strict', action='store_true', help='Content-level checks and stage advancement')
    args = parser.parse_args()

    case_dir = Path(args.case_dir).resolve()
    if not case_dir.exists():
        print(f'ERROR: case directory does not exist: {case_dir}', file=sys.stderr)
        return 1

    manifest_path = case_dir / 'case.json'
    manifest: dict = {}
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
        except json.JSONDecodeError as exc:
            print(f'ERROR: case.json is not valid JSON: {exc}', file=sys.stderr)
            return 1
    schema_version = manifest.get('schema_version', 1)
    schema_warning: str | None = None
    if schema_version < EXPECTED_SCHEMA_VERSION:
        schema_warning = (
            f'case schema_version={schema_version} is older than expected '
            f'{EXPECTED_SCHEMA_VERSION}; strict-mode content checks may miss '
            f'new required sections (Anti-simplification review, evidence tags)'
        )

    issues: list[str] = []

    for rel_path, headings in CORE_REQUIREMENTS.items():
        issues.extend(check_file_structural(case_dir / rel_path, headings))

    branches_dir = case_dir / 'branches'
    if branches_dir.exists():
        for branch_dir in sorted(p for p in branches_dir.iterdir() if p.is_dir()):
            for rel_path, headings in BRANCH_REQUIREMENTS.items():
                issues.extend(check_file_structural(branch_dir / rel_path, headings))

    if not (case_dir / 'README.md').exists():
        issues.append(f'missing file: {case_dir / "README.md"}')
    if not (case_dir / 'case.json').exists():
        issues.append(f'missing file: {case_dir / "case.json"}')

    if args.strict:
        for rel_path, headings in CORE_REQUIREMENTS.items():
            issues.extend(check_file_strict(case_dir / rel_path, headings))
        if branches_dir.exists():
            for branch_dir in sorted(p for p in branches_dir.iterdir() if p.is_dir()):
                for rel_path, headings in BRANCH_REQUIREMENTS.items():
                    issues.extend(check_file_strict(branch_dir / rel_path, headings))
        if schema_version >= 2:
            issues.extend(check_anti_simplification(case_dir / 'core/06-options-matrix.md'))
            issues.extend(check_evidence_tags(case_dir))

    if issues:
        print('AUDIT FAILED')
        if schema_warning:
            print(f' ! {schema_warning}')
        for issue in issues:
            print(f' - {issue}')
        return 1

    mode = 'strict' if args.strict else 'structural'
    print(f'AUDIT PASSED ({mode})')
    if schema_warning:
        print(f' ! {schema_warning}')
    print(f'Checked case: {case_dir}')
    if args.strict and schema_version >= 2:
        advanced, msg = advance_stage(case_dir, issues)
        print(f' * {msg}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
