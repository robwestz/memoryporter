#!/usr/bin/env python3
"""project-wiki generator.

Usage:
    python generate.py --repo <path> --output <path> [--open]

Walks the target repo, runs all analyzers, and writes a self-contained
static HTML wiki to --output. The output opens via file:// — no server,
no build step, no install.
"""
from __future__ import annotations
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Make scripts/ importable when run directly
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from walker import walk  # noqa: E402


def gather_data(repo_root: Path) -> dict:
    """Run all analyzers and merge into a single payload."""
    files = list(walk(repo_root))
    data = {
        "meta": {
            "repo_name": repo_root.name,
            "repo_path": str(repo_root),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generator_version": "0.1.0",
            "file_count_walked": len(files),
        },
    }
    # Analyzers will be plugged in over the next tasks.
    return data


def main() -> int:
    p = argparse.ArgumentParser(description="Generate a static wiki for a project repo.")
    p.add_argument("--repo", required=True, type=Path, help="Path to the project repository")
    p.add_argument("--output", required=True, type=Path, help="Where to write the generated wiki")
    p.add_argument("--open", action="store_true", help="Open the result in the default browser")
    args = p.parse_args()

    repo = args.repo.resolve()
    if not repo.is_dir():
        print(f"error: repo path is not a directory: {repo}", file=sys.stderr)
        return 2

    print(f"[project-wiki] analyzing {repo}")
    data = gather_data(repo)
    print(f"[project-wiki] walked {data['meta']['file_count_walked']} files")

    # render.py lands in Task 10 — for now just dump the JSON.
    args.output.mkdir(parents=True, exist_ok=True)
    out_json = args.output / "data.json"
    out_json.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"[project-wiki] wrote {out_json}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
