"""Bootstrap a <repo>.wiki/ sidecar directory next to an existing repo."""
from __future__ import annotations
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = SCRIPT_DIR.parent / "assets" / "sidecar-template"


def bootstrap(repo: Path, force: bool = False) -> int:
    repo = repo.resolve()
    if not repo.is_dir():
        print(f"error: not a directory: {repo}", file=sys.stderr)
        return 2

    sidecar = repo.parent / f"{repo.name}.wiki"
    fresh = not sidecar.exists()

    if sidecar.exists() and not force:
        print(f"sidecar already exists at {sidecar}")
        print("use --force to refresh wiki.toml + README + cache (annotations are left alone)")
        return 1

    sidecar.mkdir(parents=True, exist_ok=True)

    # Always (re)written: wiki.toml template, README, cache dir
    if TEMPLATE_DIR.is_dir():
        (sidecar / "wiki.toml").write_text(
            (TEMPLATE_DIR / "wiki.toml").read_text(encoding="utf-8")
            .replace("{{REPO_NAME}}", repo.name),
            encoding="utf-8",
        )
        (sidecar / "README.md").write_text(
            (TEMPLATE_DIR / "README.md").read_text(encoding="utf-8")
            .replace("{{REPO_NAME}}", repo.name),
            encoding="utf-8",
        )

    (sidecar / "cache").mkdir(exist_ok=True)
    (sidecar / "cache" / ".gitkeep").touch(exist_ok=True)

    # Human-owned: don't overwrite if already there
    annotations = sidecar / "annotations"
    if not annotations.exists():
        annotations.mkdir()
        (annotations / "modules").mkdir()
        (annotations / "files").mkdir()
        (annotations / "overview.md").write_text(
            f"# {repo.name}\n\n"
            "Write a custom overview here. Anything you add replaces the auto-rendered README on the overview page.\n",
            encoding="utf-8",
        )

    theme_css = sidecar / "theme.css"
    if not theme_css.exists():
        if (TEMPLATE_DIR / "theme.css").exists():
            theme_css.write_text(
                (TEMPLATE_DIR / "theme.css").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
        else:
            theme_css.write_text(
                "/* project-specific overrides — set CSS variables here */\n",
                encoding="utf-8",
            )

    msg = "✅ sidecar created" if fresh else "✅ sidecar refreshed"
    print(f"{msg} at {sidecar}")
    print("   edit wiki.toml + add files under annotations/ — then re-run generate")
    return 0
