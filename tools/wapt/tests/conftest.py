"""Shared pytest fixtures for all wapt tests."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest


@pytest.fixture()
def registry_path(tmp_path: Path) -> Path:
    """A fresh registry.json path inside a temp directory."""
    return tmp_path / "registry.json"


@pytest.fixture()
def populated_registry(registry_path: Path) -> Path:
    """A registry.json pre-populated with one 'demo' site entry."""
    data: dict[str, Any] = {
        "version": 1,
        "sites": {
            "demo": {
                "name": "demo",
                "domain": "demo.localhost",
                "root": "/projects/demo",
                "template": "site",
                "tls": "mkcert",
                "created_at": "2026-01-01T00:00:00Z",
                "targets": ["local"],
                "integrations": [],
            }
        },
    }
    registry_path.write_text(json.dumps(data), encoding="utf-8")
    return registry_path


@pytest.fixture()
def tmp_toml(tmp_path: Path):
    """Factory fixture: writes a .toml file and returns its Path."""

    def _write(content: str, name: str = "config.toml") -> Path:
        p = tmp_path / name
        p.write_text(content, encoding="utf-8")
        return p

    return _write


@pytest.fixture()
def wapt_home(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Override Path.home() so wapt uses a temp dir instead of ~/.wapt."""
    home = tmp_path / "fake_home"
    home.mkdir()
    monkeypatch.setattr(Path, "home", staticmethod(lambda: home))
    return home
