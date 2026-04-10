"""Discover and load the <repo>.wiki/ sidecar if it exists.

Returns a structured dict the renderer can merge with the rest of the data
payload. Returns {"present": False} if no sidecar — the wiki still works."""
from __future__ import annotations
import json
import re
from pathlib import Path


def parse_toml(text: str) -> dict:
    """Tiny TOML parser sufficient for sidecar wiki.toml.

    Supports [section.subsection] headers, key = value pairs where value is
    a quoted string, true/false, or an inline list of strings."""
    out: dict = {}
    section = None
    cur = out
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].rstrip()
        if not line.strip():
            continue
        m = re.match(r"^\[([\w\.]+)\]\s*$", line)
        if m:
            section = m.group(1)
            cur = out
            for part in section.split("."):
                cur = cur.setdefault(part, {})
            continue
        m = re.match(r"^\s*([\w_]+)\s*=\s*(.+)$", line)
        if not m:
            continue
        key, rhs = m.group(1), m.group(2).strip()
        if rhs in ("true", "false"):
            cur[key] = (rhs == "true")
        elif rhs.startswith('"') and rhs.endswith('"'):
            cur[key] = rhs.strip('"')
        elif rhs.startswith("[") and rhs.endswith("]"):
            inner = rhs.strip("[]").strip()
            cur[key] = [s.strip().strip('"').strip("'") for s in inner.split(",") if s.strip()]
        else:
            cur[key] = rhs
    return out


def run(repo_root: Path) -> dict:
    sidecar = repo_root.parent / f"{repo_root.name}.wiki"
    if not sidecar.is_dir():
        return {"present": False}

    out: dict = {"present": True, "path": str(sidecar)}

    # Config
    cfg_file = sidecar / "wiki.toml"
    if cfg_file.exists():
        try:
            out["config"] = parse_toml(cfg_file.read_text(encoding="utf-8"))
        except Exception as e:
            out["config_error"] = str(e)
            out["config"] = {}
    else:
        out["config"] = {}

    # Annotations
    annotations: dict = {"overview": None, "modules": {}, "files": {}}
    ann_dir = sidecar / "annotations"
    if ann_dir.exists():
        ov = ann_dir / "overview.md"
        if ov.exists():
            try:
                annotations["overview"] = ov.read_text(encoding="utf-8")
            except OSError:
                pass
        mod_dir = ann_dir / "modules"
        if mod_dir.exists():
            for f in mod_dir.glob("*.md"):
                try:
                    annotations["modules"][f.stem] = f.read_text(encoding="utf-8")
                except OSError:
                    continue
        file_dir = ann_dir / "files"
        if file_dir.exists():
            for f in file_dir.rglob("*.md"):
                try:
                    rel = f.relative_to(file_dir).as_posix().removesuffix(".md")
                    annotations["files"][rel] = f.read_text(encoding="utf-8")
                except OSError:
                    continue
    out["annotations"] = annotations

    # AI explanation cache
    ai_cache = sidecar / "cache" / "ai-explanations.json"
    if ai_cache.exists():
        try:
            out["ai_explanations"] = json.loads(ai_cache.read_text(encoding="utf-8"))
        except Exception:
            out["ai_explanations"] = {}
    else:
        out["ai_explanations"] = {}

    # Project-specific theme override CSS
    theme_css = sidecar / "theme.css"
    if theme_css.exists():
        try:
            out["theme_css"] = theme_css.read_text(encoding="utf-8")
        except OSError:
            pass

    return out
