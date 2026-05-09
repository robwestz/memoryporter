"""Integration tests: full wapt init → add → list → remove flow.

mkcert and Caddy subprocess calls are mocked; everything else (registry,
stamper, config) runs against real files in tmp_path.
"""
from __future__ import annotations

import json
import subprocess

import httpx
import pytest
from typer.testing import CliRunner

from wapt.cli_core import app

runner = CliRunner()


class _Completed:
    def __init__(self, returncode=0, stdout="", stderr=""):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


@pytest.fixture
def isolated(monkeypatch, tmp_path):
    """Redirect every wapt write to tmp_path; mock mkcert + caddy."""
    home = tmp_path / "home"
    home.mkdir()
    config_path = home / ".wapt" / "config.toml"
    monkeypatch.setattr("wapt.cli_core.DEFAULT_CONFIG_PATH", config_path)

    monkeypatch.setattr(
        "wapt.mkcert_integration.shutil.which",
        lambda name: f"/fake/{name}" if name in {"mkcert", "openssl"} else None,
    )
    monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: "/fake/caddy")

    def fake_run(cmd, **kw):
        # mkcert -cert-file <c> -key-file <k> <domain>: write stub PEM files
        if cmd and cmd[0].endswith("mkcert"):
            try:
                from pathlib import Path as _P
                cert_idx = cmd.index("-cert-file")
                key_idx = cmd.index("-key-file")
                _P(cmd[cert_idx + 1]).write_text("CERT", encoding="utf-8")
                _P(cmd[key_idx + 1]).write_text("KEY", encoding="utf-8")
            except ValueError:
                pass
        return _Completed(returncode=0)

    monkeypatch.setattr(subprocess, "run", fake_run)

    # Caddy admin endpoint: pretend not running so reload is skipped
    def fake_get(*a, **kw):
        raise httpx.ConnectError("refused")

    monkeypatch.setattr(httpx, "get", fake_get)

    return {"config_path": config_path, "home": home, "tmp_path": tmp_path}


def _site_root(tmp_path):
    """Make a real directory for `wapt add` to accept."""
    root = tmp_path / "projects" / "ecc"
    root.mkdir(parents=True)
    (root / "index.html").write_text("<h1>ecc</h1>", encoding="utf-8")
    return root


def _patch_config_paths(isolated, tmp_path):
    """Rewrite the just-init'd config so all writes land inside tmp_path."""
    cfg_path = isolated["config_path"]
    new_text = (
        "[paths]\n"
        f'caddyfile = "{(tmp_path / "Caddyfile").as_posix()}"\n'
        f'sites_enabled = "{(tmp_path / "sites-enabled").as_posix()}"\n'
        f'registry = "{(tmp_path / "registry.json").as_posix()}"\n'
        f'snapshots = "{(tmp_path / "snapshots").as_posix()}"\n'
        "\n"
        "[caddy]\n"
        'admin_url = "http://localhost:2019"\n'
        'binary_path = "auto"\n'
        "\n"
        "[mkcert]\n"
        'ca_root = "auto"\n'
        "\n"
        "[features]\n"
        "target_ghpages = false\n"
        "target_heroku = false\n"
        "jetbrains_ext = false\n"
        "sentry_hook = false\n"
        "log_tail = false\n"
        "status_json_api = false\n"
        "vhost_codegen = false\n"
        "colored_output = true\n"
    )
    cfg_path.write_text(new_text, encoding="utf-8")


# ---------------------------------------------------------------------------


class TestInitFlow:
    def test_init_creates_config(self, isolated):
        result = runner.invoke(app, ["init"])
        assert result.exit_code == 0
        assert isolated["config_path"].exists()

    def test_init_idempotent(self, isolated):
        runner.invoke(app, ["init"])
        result = runner.invoke(app, ["init"])
        assert result.exit_code == 0
        assert "already exists" in result.output.lower()


class TestAddFlow:
    def test_add_with_default_localhost_domain(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        site = _site_root(tmp_path)

        result = runner.invoke(app, ["add", "ecc", str(site)])
        assert result.exit_code == 0, result.output
        assert "ecc.localhost" in result.output

    def test_add_creates_caddyfile_and_registry(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        site = _site_root(tmp_path)

        result = runner.invoke(app, ["add", "ecc", str(site)])
        assert result.exit_code == 0, result.output
        assert (tmp_path / "sites-enabled" / "ecc.caddy").exists()
        registry = tmp_path / "registry.json"
        assert registry.exists()
        data = json.loads(registry.read_text(encoding="utf-8"))
        assert "ecc" in data["sites"]

    def test_add_rejects_relative_path(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        result = runner.invoke(app, ["add", "ecc", "relative/path"])
        assert result.exit_code != 0
        assert "absolute" in result.output.lower()

    def test_add_rejects_missing_path(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        result = runner.invoke(app, ["add", "ecc", str(tmp_path / "nope")])
        assert result.exit_code != 0


class TestListFlow:
    def test_list_empty(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        result = runner.invoke(app, ["list"])
        assert result.exit_code == 0
        assert "no sites" in result.output.lower()

    def test_list_after_add(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        site = _site_root(tmp_path)
        runner.invoke(app, ["add", "ecc", str(site)])

        result = runner.invoke(app, ["list"])
        assert result.exit_code == 0
        assert "ecc" in result.output
        assert "ecc.localhost" in result.output

    def test_list_json_returns_valid_json(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        site = _site_root(tmp_path)
        runner.invoke(app, ["add", "ecc", str(site)])

        result = runner.invoke(app, ["--json", "list"])
        assert result.exit_code == 0
        parsed = json.loads(result.output)
        assert isinstance(parsed["sites"], list)
        assert len(parsed["sites"]) == 1
        assert parsed["sites"][0]["name"] == "ecc"


class TestRemoveFlow:
    def test_remove_existing(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        site = _site_root(tmp_path)
        runner.invoke(app, ["add", "ecc", str(site)])

        result = runner.invoke(app, ["remove", "ecc"])
        assert result.exit_code == 0
        assert not (tmp_path / "sites-enabled" / "ecc.caddy").exists()

    def test_remove_missing_raises(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        result = runner.invoke(app, ["remove", "never-added"])
        assert result.exit_code == 4  # SiteNotFound


class TestHealthFlow:
    def test_health_caddy_down(self, isolated, tmp_path):
        runner.invoke(app, ["init"])
        _patch_config_paths(isolated, tmp_path)
        result = runner.invoke(app, ["health"])
        assert result.exit_code == 0
        assert "not running" in result.output.lower()
