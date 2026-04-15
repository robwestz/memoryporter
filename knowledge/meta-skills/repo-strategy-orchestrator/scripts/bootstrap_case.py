#!/usr/bin/env python3
"""Create a repo-strategy case workspace from bundled templates."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import re
import shutil
import sys

CORE_TEMPLATE_MAP = [
    ("templates/request-brief.md", "core/01-request-brief.md"),
    ("templates/repo-map.md", "core/02-repo-map.md"),
    ("templates/constraint-map.md", "core/03-constraint-map.md"),
    ("templates/purpose-chain.md", "core/04-purpose-chain.md"),
    ("templates/failure-mode-atlas.md", "core/05-failure-mode-atlas.md"),
    ("templates/options-matrix.md", "core/06-options-matrix.md"),
]

SCHEMA_VERSION = 2


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "case"


def render_template(template_path: Path, replacements: dict[str, str]) -> str:
    text = template_path.read_text(encoding="utf-8")
    for key, value in replacements.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case_slug", help="Case identifier; will be slugified")
    parser.add_argument("goal", help="Short statement of the repo goal")
    parser.add_argument("--repo", default="not-provided", help="Repo path, URL, or hint")
    parser.add_argument("--workspace", default="workspace", help="Workspace root")
    parser.add_argument("--force", action="store_true", help="Replace an existing case directory")
    args = parser.parse_args()

    skill_root = Path(__file__).resolve().parents[1]
    workspace_root = Path(args.workspace).resolve()
    case_slug = slugify(args.case_slug)
    case_dir = workspace_root / case_slug

    if case_dir.exists():
        if not args.force:
            print(f"ERROR: case directory already exists: {case_dir}", file=sys.stderr)
            return 1
        shutil.rmtree(case_dir)

    (case_dir / "core").mkdir(parents=True, exist_ok=True)
    (case_dir / "branches").mkdir(parents=True, exist_ok=True)

    created_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    replacements = {
        "CASE_SLUG": case_slug,
        "GOAL": args.goal,
        "REPO_HINT": args.repo,
        "CREATED_AT": created_at,
    }

    for src, dst in CORE_TEMPLATE_MAP:
        content = render_template(skill_root / src, replacements)
        output_path = case_dir / dst
        output_path.write_text(content, encoding="utf-8")

    readme = f"""# Case {case_slug}

Goal: {args.goal}

Repo hint: {args.repo}

## Workflow

1. Fill the six core artifacts in `core/`.
2. Run `scripts/mechanical_audit.py {case_dir}`.
3. Present options and wait for a user choice.
4. Scaffold the chosen branch in `branches/`.
5. Re-run the audit.
"""
    (case_dir / "README.md").write_text(readme, encoding="utf-8")

    manifest = {
        "schema_version": SCHEMA_VERSION,
        "case_slug": case_slug,
        "goal": args.goal,
        "repo_hint": args.repo,
        "created_at": created_at,
        "skill": "repo-strategy-orchestrator",
        "stage": "core-in-progress",
        "branches": [],
    }
    (case_dir / "case.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    index_path = workspace_root / "cases.jsonl"
    index_entry = {
        "event": "bootstrap",
        "at": created_at,
        "case_slug": case_slug,
        "goal": args.goal,
        "repo_hint": args.repo,
        "path": str(case_dir),
    }
    with index_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(index_entry) + "\n")

    print(f"OK: created case workspace at {case_dir}")
    for _, dst in CORE_TEMPLATE_MAP:
        print(f"  - {dst}")
    print(f"  - case.json (stage=core-in-progress, schema_version={SCHEMA_VERSION})")
    print(f"  - index updated: {index_path}")
    print()
    print("NEXT — the systematics:")
    print("  1. Fill core artifacts 01..06 in order; do not skip any.")
    print("  2. Tag bullets with [OBSERVED] / [DERIVED] / [ASSUMED] / [OPEN-RISK].")
    print("     Hard constraints must NOT be [ASSUMED].")
    print("  3. Options matrix must have >=3 options + user slot + filled")
    print("     Anti-simplification review (4 questions x options).")
    print("  4. Run mechanical_audit.py --strict. On pass, stage advances")
    print("     to awaiting-user-choice. That is the stop point — present")
    print("     options, wait for the user, then scaffold_branch.py.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
