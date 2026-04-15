#!/usr/bin/env python3
"""Create a branch workspace for a chosen repo strategy path."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import re
import shutil
import sys

BRANCH_TEMPLATE_MAP = [
    ("templates/branch-charter.md", "01-branch-charter.md"),
    ("templates/evidence-plan.md", "02-evidence-plan.md"),
    ("templates/validation-plan.md", "03-validation-plan.md"),
    ("templates/subskill-opportunities.md", "04-subskill-opportunities.md"),
]

KNOWN_BRANCHES = {
    "upgrade-existing": "upgrade existing system",
    "extract-subsystem": "extract reusable subsystem",
    "build-adjacent": "build adjacent or precursor system",
    "specialize-capability": "specialize an existing capability",
    "research-spike": "research spike",
    "custom": "custom path",
}

EXPECTED_SCHEMA_VERSION = 2
ALLOWED_STAGES_FOR_BRANCHING = {"awaiting-user-choice", "branch-active"}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "branch"


def render_template(template_path: Path, replacements: dict[str, str]) -> str:
    text = template_path.read_text(encoding="utf-8")
    for key, value in replacements.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case_dir", help="Path to a case workspace created by bootstrap_case.py")
    parser.add_argument("branch_key", help="Standard branch key or custom label")
    parser.add_argument("--name", help="Optional output branch folder name")
    parser.add_argument("--force", action="store_true", help="Replace an existing branch directory")
    args = parser.parse_args()

    skill_root = Path(__file__).resolve().parents[1]
    case_dir = Path(args.case_dir).resolve()
    if not case_dir.exists():
        print(f"ERROR: case directory does not exist: {case_dir}", file=sys.stderr)
        return 1

    manifest_path = case_dir / "case.json"
    case_slug = case_dir.name
    manifest: dict = {}
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        case_slug = manifest.get("case_slug", case_slug)

    schema_version = manifest.get("schema_version", 1)
    if schema_version < EXPECTED_SCHEMA_VERSION:
        print(
            f"WARNING: case schema_version={schema_version} is older than "
            f"expected {EXPECTED_SCHEMA_VERSION}; rerun bootstrap_case.py "
            f"or update case.json by hand.",
            file=sys.stderr,
        )

    stage = manifest.get("stage", "unknown")
    if stage not in ALLOWED_STAGES_FOR_BRANCHING and not args.force:
        print(
            f"ERROR: case stage is {stage!r}. Branch scaffolding requires "
            f"stage to be one of {sorted(ALLOWED_STAGES_FOR_BRANCHING)}. "
            f"Run mechanical_audit.py --strict to advance the stage once "
            f"the core artifacts are populated, or pass --force to override.",
            file=sys.stderr,
        )
        return 1

    branch_key = slugify(args.branch_key)
    branch_name = slugify(args.name or branch_key)
    branch_dir = case_dir / "branches" / branch_name
    if branch_dir.exists():
        if not args.force:
            print(f"ERROR: branch directory already exists: {branch_dir}", file=sys.stderr)
            return 1
        shutil.rmtree(branch_dir)
    branch_dir.mkdir(parents=True, exist_ok=True)

    display_key = KNOWN_BRANCHES.get(branch_key, "custom path")
    created_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    replacements = {
        "CASE_SLUG": case_slug,
        "BRANCH_NAME": branch_name,
        "BRANCH_KEY": branch_key,
        "BRANCH_LABEL": display_key,
        "CREATED_AT": created_at,
    }

    for src, dst in BRANCH_TEMPLATE_MAP:
        content = render_template(skill_root / src, replacements)
        (branch_dir / dst).write_text(content, encoding="utf-8")

    branch_manifest = {
        "case_slug": case_slug,
        "branch_key": branch_key,
        "branch_label": display_key,
        "branch_name": branch_name,
        "created_at": created_at,
    }
    (branch_dir / "branch.json").write_text(json.dumps(branch_manifest, indent=2) + "\n", encoding="utf-8")

    manifest["stage"] = "branch-active"
    branches = manifest.setdefault("branches", [])
    if not any(b.get("branch_name") == branch_name for b in branches):
        branches.append({
            "branch_name": branch_name,
            "branch_key": branch_key,
            "branch_label": display_key,
            "created_at": created_at,
        })
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    workspace_root = case_dir.parent
    index_path = workspace_root / "cases.jsonl"
    index_entry = {
        "event": "scaffold_branch",
        "at": created_at,
        "case_slug": case_slug,
        "branch_name": branch_name,
        "branch_key": branch_key,
        "branch_label": display_key,
        "path": str(branch_dir),
    }
    with index_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(index_entry) + "\n")

    print(f"OK: created branch workspace at {branch_dir}")
    for _, dst in BRANCH_TEMPLATE_MAP:
        print(f"  - {dst}")
    print(f"  - case.json (stage=branch-active)")
    print(f"  - index updated: {index_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
