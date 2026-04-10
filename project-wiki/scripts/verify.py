#!/usr/bin/env python3
"""Sanity-check a generated wiki — used by CI / smoke tests.

Works for both single-file (.html) and folder-mode outputs.
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

REQUIRED_KEYS = ("meta", "stats", "languages", "structure", "dependencies",
                 "git", "readme", "changelog", "symbols", "file_index")

REQUIRED_FOLDER_FILES = [
    "index.html", "data.json",
    "css/tokens.css", "css/base.css", "css/layout.css", "css/components.css",
    "css/charts.css", "css/prism.css", "css/themes/midnight.css",
    "js/app.js", "js/store.js", "js/router.js", "js/utils.js",
    "js/charts/donut.js", "js/charts/sunburst.js", "js/charts/force-graph.js",
    "icons/lucide.svg",
]


def verify(target: Path) -> int:
    if not target.exists():
        print(f"FAIL: {target} does not exist")
        return 2

    if target.is_file() and target.suffix == ".html":
        return verify_single(target)
    if target.is_dir():
        return verify_folder(target)
    print(f"FAIL: {target} is neither an .html file nor a directory")
    return 2


def verify_single(html_path: Path) -> int:
    errors = []
    try:
        html = html_path.read_text(encoding="utf-8")
    except OSError as e:
        print(f"FAIL: cannot read {html_path}: {e}")
        return 1

    # Structural checks
    if "<script id=\"wiki-data\"" not in html:
        errors.append("missing <script id=\"wiki-data\">")
    if "id=\"lucide-sprite\"" not in html:
        errors.append("missing icon sprite (#lucide-sprite)")
    if "<style data-source=" not in html:
        errors.append("no inlined <style data-source=…> blocks")
    if "(() => {" not in html:
        errors.append("missing IIFE wrapper in bundled JS")

    # Placeholder leak check (only outside the JSON region)
    data_start = html.find('<script id="wiki-data"')
    shell = html[:data_start] if data_start >= 0 else html
    if "__WIKI_DATA_PLACEHOLDER__" in shell:
        errors.append("__WIKI_DATA_PLACEHOLDER__ leaked into shell")
    if "__ICON_SPRITE_PLACEHOLDER__" in shell:
        errors.append("__ICON_SPRITE_PLACEHOLDER__ leaked into shell")

    # Parse data
    m = re.search(
        r'<script id="wiki-data" type="application/json">(.*?)</script>',
        html, re.DOTALL,
    )
    if not m:
        errors.append("could not extract data payload")
    else:
        try:
            payload = m.group(1).replace("<\\/", "</")
            data = json.loads(payload)
            for key in REQUIRED_KEYS:
                if key not in data:
                    errors.append(f"data missing key: {key}")
        except Exception as e:
            errors.append(f"data failed to parse: {e}")

    return _report(errors, html_path, mode="single", size_kb=html_path.stat().st_size // 1024)


def verify_folder(out_dir: Path) -> int:
    errors = []
    for rel in REQUIRED_FOLDER_FILES:
        if not (out_dir / rel).exists():
            errors.append(f"missing: {rel}")

    try:
        data = json.loads((out_dir / "data.json").read_text(encoding="utf-8"))
        for key in REQUIRED_KEYS:
            if key not in data:
                errors.append(f"data.json missing key: {key}")
    except Exception as e:
        errors.append(f"data.json failed to parse: {e}")

    try:
        html = (out_dir / "index.html").read_text(encoding="utf-8")
        data_start = html.find('<script id="wiki-data"')
        shell = html[:data_start] if data_start >= 0 else html
        if "__WIKI_DATA_PLACEHOLDER__" in shell:
            errors.append("index.html still contains the data placeholder")
    except OSError:
        pass

    return _report(errors, out_dir, mode="folder")


def _report(errors, path, mode, size_kb=None) -> int:
    if errors:
        print(f"FAIL ({mode}): {path}")
        for e in errors:
            print(f"  - {e}")
        return 1
    extra = f" ({size_kb} KB)" if size_kb is not None else ""
    print(f"OK ({mode}): {path}{extra}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: verify.py <output.html | output_dir>")
        sys.exit(2)
    sys.exit(verify(Path(sys.argv[1])))
