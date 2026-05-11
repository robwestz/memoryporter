#!/usr/bin/env python3
"""Drift detector for AGENT_MAP.md and conventions/MANIFEST.json.

Run from repo root:
    python tools/validate_agent_map.py

Exits 1 if drift detected, 0 otherwise.

Two checks:
  1. Every non-ignored top-level mapp is mentioned somewhere in AGENT_MAP.md
  2. Every README.md / CLAUDE.md / SKILL.md / START_HERE.md / AGENTS.md found
     in the repo (max depth 4, excluding ignored trees) appears as a path in
     MANIFEST.json's resources array.

Add new subsystems to AGENT_MAP.md and MANIFEST.json to keep this green.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

IGNORED_TOPLEVEL = {
    ".git", ".venv", ".ruff_cache", ".pytest_cache",
    "node_modules", "__pycache__", "target",
    ".non-active-projects",  # archived by user
    # Empty placeholder dirs — documented in AGENT_MAP §6 instead of tracked individually:
    ".benchmarks", ".experiments", ".sort-or-delete",
    ".we-want-new-purpose", "archived",
}

IGNORED_SUBTREES = {
    ".git", ".venv", ".ruff_cache", ".pytest_cache", "node_modules",
    "__pycache__", "target", ".non-active-projects", "eval-viewer",
    "assets", "examples", "benchmarks",  # internal to subprojects
}

ENTRY_FILENAMES = {"README.md", "CLAUDE.md", "SKILL.md", "START_HERE.md", "AGENTS.md"}

MAX_DEPTH = 4


def list_toplevel_dirs() -> list[str]:
    return sorted(
        p.name for p in REPO.iterdir()
        if p.is_dir() and p.name not in IGNORED_TOPLEVEL
    )


def find_entry_docs() -> list[str]:
    """Find every entry-doc file up to MAX_DEPTH, return repo-relative paths."""
    found: list[str] = []
    for path in REPO.rglob("*"):
        if not path.is_file() or path.name not in ENTRY_FILENAMES:
            continue
        rel = path.relative_to(REPO)
        parts = rel.parts
        if len(parts) > MAX_DEPTH:
            continue
        if any(part in IGNORED_SUBTREES for part in parts):
            continue
        found.append(rel.as_posix())
    return sorted(set(found))


def load_manifest_paths() -> set[str]:
    manifest_path = REPO / "conventions" / "MANIFEST.json"
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    paths: set[str] = set()
    for r in data.get("resources", []):
        p = r.get("path", "").strip()
        if p:
            paths.add(p.rstrip("/"))
    return paths


def load_agent_map_text() -> str:
    return (REPO / "AGENT_MAP.md").read_text(encoding="utf-8")


def main() -> int:
    if not (REPO / "AGENT_MAP.md").exists():
        print("FAIL: AGENT_MAP.md is missing at repo root.", file=sys.stderr)
        return 1
    if not (REPO / "conventions" / "MANIFEST.json").exists():
        print("FAIL: conventions/MANIFEST.json is missing.", file=sys.stderr)
        return 1

    agent_map = load_agent_map_text()
    manifest_paths = load_manifest_paths()

    drift = False

    # Check 1: every top-level mapp is mentioned in AGENT_MAP.md as a path token.
    # Accept any of: `d/`, `d`, ` d/`, /d/, `d/<sub>` (open backtick + slash)
    missing_in_map: list[str] = []
    for d in list_toplevel_dirs():
        needles = (f"`{d}/`", f"`{d}`", f" {d}/", f"/{d}/", f"`{d}/")
        if not any(n in agent_map for n in needles):
            missing_in_map.append(d)

    if missing_in_map:
        drift = True
        print("DRIFT - AGENT_MAP.md does not mention these top-level dirs:")
        for d in missing_in_map:
            print(f"  - {d}/")
        print()

    # Check 2: every entry-doc is covered by MANIFEST.
    # Coverage rules (any one suffices):
    #   a) exact path match
    #   b) any ancestor dir listed as a path (e.g., "docs/showcases/" covers any
    #      file deeper in the tree, "knowledge-base/meta-skills/" covers SKILL.md
    #      two levels down)
    #   c) sibling: any manifest path lives inside the same parent dir
    #      (sibling SKILL.md counts as covering README.md in the same folder)
    missing_in_manifest: list[str] = []
    for entry in find_entry_docs():
        if entry in manifest_paths:
            continue
        parts = entry.split("/")
        # Walk up ancestor dirs and check if any is listed in MANIFEST as dir-entry
        ancestors = ["/".join(parts[:i]) for i in range(len(parts) - 1, 0, -1)]
        if any(a in manifest_paths for a in ancestors):
            continue
        parent = ancestors[0] if ancestors else ""
        if parent and any(p.startswith(parent + "/") for p in manifest_paths):
            continue
        missing_in_manifest.append(entry)

    if missing_in_manifest:
        drift = True
        print("DRIFT - MANIFEST.json missing entries for these doc files:")
        for e in missing_in_manifest:
            print(f"  - {e}")
        print()

    if drift:
        print("FAIL: drift detected. Add missing items to AGENT_MAP.md and conventions/MANIFEST.json.", file=sys.stderr)
        return 1

    print("OK: AGENT_MAP.md mentions all top-level dirs and MANIFEST.json covers all entry docs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
