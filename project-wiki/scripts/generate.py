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
from analyzers import (  # noqa: E402
    repo_stats, languages, structure, dependencies,
    git_log, readme, changelog, symbols, file_index, sidecar,
)
from render import render, bundle_single_file  # noqa: E402


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
        "stats": repo_stats.run(repo_root),
        "languages": languages.run(repo_root),
        "structure": structure.run(repo_root),
        "dependencies": dependencies.run(repo_root),
        "git": git_log.run(repo_root),
        "readme": readme.run(repo_root),
        "changelog": changelog.run(repo_root),
        "symbols": symbols.run(repo_root),
        "file_index": file_index.run(repo_root),
        "sidecar": sidecar.run(repo_root),
    }
    return data


def main() -> int:
    p = argparse.ArgumentParser(description="Generate a static wiki for a project repo.")
    p.add_argument("--repo", type=Path, help="Path to the project repository")
    p.add_argument("--output", type=Path, help="Where to write the generated wiki (file path for single mode, dir for folder mode)")
    p.add_argument("--mode", choices=["single", "folder"], default="single",
                   help="single = one self-contained .html file (default). folder = multi-file directory.")
    p.add_argument("--open", action="store_true", help="Open the result in the default browser")
    p.add_argument("--init-sidecar", type=Path, metavar="REPO",
                   help="Bootstrap a <repo>.wiki/ sidecar next to REPO and exit")
    p.add_argument("--force", action="store_true", help="With --init-sidecar: overwrite existing wiki.toml")
    args = p.parse_args()

    # Sidecar init mode — short-circuit before normal generation
    if args.init_sidecar is not None:
        from init_sidecar import bootstrap
        return bootstrap(args.init_sidecar, force=args.force)

    if not args.repo or not args.output:
        p.error("--repo and --output are required for generation (or use --init-sidecar)")

    repo = args.repo.resolve()
    if not repo.is_dir():
        print(f"error: repo path is not a directory: {repo}", file=sys.stderr)
        return 2

    print(f"[project-wiki] analyzing {repo}")
    data = gather_data(repo)
    print(f"[project-wiki] walked {data['meta']['file_count_walked']} files")

    template_dir = SCRIPT_DIR.parent / "assets" / "wiki-template"
    if not (template_dir / "index.html").exists():
        # Defensive fallback — should never trigger now that the template is in place
        print(f"[project-wiki] wiki-template/index.html not present — dumping data.json only", file=sys.stderr)
        args.output.mkdir(parents=True, exist_ok=True)
        out_json = args.output / "data.json"
        out_json.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[project-wiki] wrote {out_json}")
        return 0

    if args.mode == "single":
        # Decide output path: if it ends in .html use it; if it's a dir, write <repo>.html inside
        if args.output.suffix == ".html":
            out_html = args.output
        else:
            args.output.mkdir(parents=True, exist_ok=True)
            out_html = args.output / f"{repo.name}.html"
        bundle_single_file(data, template_dir, out_html)
        size_kb = out_html.stat().st_size // 1024
        print(f"[project-wiki] wrote single-file wiki to {out_html} ({size_kb} KB)")
        if args.open:
            import webbrowser
            webbrowser.open(out_html.as_uri())
    else:
        index_path = render(data, template_dir, args.output)
        print(f"[project-wiki] wrote folder-mode wiki to {args.output}")
        print(f"[project-wiki] open {index_path} in your browser")
        if args.open:
            import webbrowser
            webbrowser.open(index_path.as_uri())

    return 0


if __name__ == "__main__":
    sys.exit(main())
