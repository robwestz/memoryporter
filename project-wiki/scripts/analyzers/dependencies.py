"""Parse common dependency manifests across ecosystems.

Supported manifests (parsed inline, no third-party libs):
- package.json (npm/yarn/pnpm)
- pyproject.toml (Python — naive parser, sufficient for [project] dependencies and [tool.poetry])
- requirements.txt
- Cargo.toml (Rust)
- go.mod (Go)
- Gemfile (Ruby — detected, not parsed)
- pom.xml (Java — detected, not parsed)
- composer.json (PHP)
"""
from __future__ import annotations
import json
import re
from pathlib import Path

from walker import IGNORE_DIRS

MANIFEST_NAMES = {
    "package.json", "pyproject.toml", "requirements.txt", "Cargo.toml",
    "go.mod", "Gemfile", "pom.xml", "composer.json",
}


def find_manifests(repo_root: Path, max_depth: int = 4) -> list[Path]:
    found: list[Path] = []

    def recurse(d: Path, depth: int) -> None:
        if depth > max_depth:
            return
        try:
            for entry in d.iterdir():
                if entry.is_dir():
                    if entry.name in IGNORE_DIRS or entry.name.startswith("."):
                        continue
                    recurse(entry, depth + 1)
                elif entry.name in MANIFEST_NAMES:
                    found.append(entry)
        except OSError:
            return

    recurse(repo_root, 0)
    return found


def parse_package_json(p: Path) -> dict:
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"ecosystem": "npm", "packages": []}
    pkgs = []
    for kind in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        for name, ver in (data.get(kind) or {}).items():
            pkgs.append({"name": name, "version": str(ver), "kind": kind})
    return {"ecosystem": "npm", "packages": pkgs, "project_name": data.get("name")}


def parse_cargo_toml(p: Path) -> dict:
    """Tiny TOML parser tailored for [dependencies] / [dev-dependencies] / [build-dependencies]."""
    pkgs = []
    section = None
    project_name = None
    try:
        for raw in p.read_text(encoding="utf-8").splitlines():
            line = raw.split("#", 1)[0].strip()
            if not line:
                continue
            if line.startswith("[") and line.endswith("]"):
                section = line[1:-1]
                continue
            if section == "package":
                m = re.match(r'^name\s*=\s*"([^"]+)"', line)
                if m:
                    project_name = m.group(1)
            if section in ("dependencies", "dev-dependencies", "build-dependencies"):
                m = re.match(r'^([\w\-]+)\s*=\s*(.+)$', line)
                if m:
                    name, rhs = m.group(1), m.group(2).strip()
                    if rhs.startswith('"') and rhs.endswith('"'):
                        ver = rhs.strip('"')
                    else:
                        # Inline table form: { version = "1.0", features = [...] }
                        vm = re.search(r'version\s*=\s*"([^"]+)"', rhs)
                        ver = vm.group(1) if vm else "*"
                    pkgs.append({"name": name, "version": ver, "kind": section})
    except OSError:
        pass
    return {"ecosystem": "cargo", "packages": pkgs, "project_name": project_name}


def parse_pyproject(p: Path) -> dict:
    """Naive parser for [project] dependencies, [tool.poetry], and [tool.poetry.dependencies]."""
    pkgs = []
    section = None
    in_deps = False
    project_name = None
    try:
        for raw in p.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if line.startswith("[") and line.endswith("]"):
                section = line[1:-1]
                in_deps = False
                continue
            if section == "project":
                m = re.match(r'^name\s*=\s*"([^"]+)"', line)
                if m:
                    project_name = m.group(1)
                if line.startswith("dependencies"):
                    in_deps = True
                    continue
            if in_deps:
                if line.startswith("]"):
                    in_deps = False
                    continue
                m = re.match(r'^"([^"]+)"', line)
                if m:
                    spec = m.group(1)
                    name = re.split(r'[<>=~!\s]', spec, 1)[0]
                    ver = spec[len(name):].lstrip()
                    pkgs.append({"name": name, "version": ver or "*", "kind": "dependencies"})
            if section == "tool.poetry":
                m = re.match(r'^name\s*=\s*"([^"]+)"', line)
                if m:
                    project_name = m.group(1)
            if section == "tool.poetry.dependencies":
                m = re.match(r'^([\w\-]+)\s*=\s*"([^"]+)"', line)
                if m:
                    pkgs.append({"name": m.group(1), "version": m.group(2), "kind": "dependencies"})
    except OSError:
        pass
    return {"ecosystem": "python", "packages": pkgs, "project_name": project_name}


def parse_requirements_txt(p: Path) -> dict:
    pkgs = []
    try:
        for raw in p.read_text(encoding="utf-8").splitlines():
            line = raw.split("#", 1)[0].strip()
            if not line or line.startswith("-"):
                continue
            name = re.split(r'[<>=~!\s]', line, 1)[0]
            ver = line[len(name):].strip() or "*"
            pkgs.append({"name": name, "version": ver, "kind": "dependencies"})
    except OSError:
        pass
    return {"ecosystem": "python", "packages": pkgs}


def parse_go_mod(p: Path) -> dict:
    pkgs = []
    in_block = False
    project_name = None
    try:
        for raw in p.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if line.startswith("module "):
                project_name = line[len("module "):].strip()
                continue
            if line.startswith("require ("):
                in_block = True
                continue
            if in_block and line == ")":
                in_block = False
                continue
            if in_block or line.startswith("require "):
                payload = line.replace("require ", "").strip()
                m = re.match(r'^(\S+)\s+(\S+)', payload)
                if m:
                    pkgs.append({"name": m.group(1), "version": m.group(2), "kind": "dependencies"})
    except OSError:
        pass
    return {"ecosystem": "go", "packages": pkgs, "project_name": project_name}


def parse_composer_json(p: Path) -> dict:
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"ecosystem": "php", "packages": []}
    pkgs = []
    for kind in ("require", "require-dev"):
        for name, ver in (data.get(kind) or {}).items():
            pkgs.append({"name": name, "version": str(ver), "kind": kind})
    return {"ecosystem": "php", "packages": pkgs, "project_name": data.get("name")}


PARSERS = {
    "package.json": parse_package_json,
    "Cargo.toml": parse_cargo_toml,
    "pyproject.toml": parse_pyproject,
    "requirements.txt": parse_requirements_txt,
    "go.mod": parse_go_mod,
    "composer.json": parse_composer_json,
    # Gemfile / pom.xml are detected but parsed as empty stubs for v0.1.0
}


def run(repo_root: Path) -> dict:
    manifests = find_manifests(repo_root)
    out = []
    for m in manifests:
        parser = PARSERS.get(m.name)
        if parser is None:
            out.append({
                "manifest_path": m.relative_to(repo_root).as_posix(),
                "ecosystem": "unknown",
                "packages": [],
            })
            continue
        parsed = parser(m)
        parsed["manifest_path"] = m.relative_to(repo_root).as_posix()
        out.append(parsed)
    return {"manifests": out}
