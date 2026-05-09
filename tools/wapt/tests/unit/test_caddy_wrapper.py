"""Unit tests for wapt.caddy_wrapper — subprocess + httpx mocked."""
from __future__ import annotations

import subprocess

import httpx
import pytest

from wapt.caddy_wrapper import CaddyWrapper, caddy_available
from wapt.error_library import AdminAPIError, CaddyNotFound, ReloadFailed


class _FakeCompleted:
    def __init__(self, returncode=0, stdout="", stderr=""):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


class _FakeResponse:
    def __init__(self, status_code=200, json_body=None, headers=None, text=""):
        self.status_code = status_code
        self._json = json_body if json_body is not None else {}
        self.headers = headers or {}
        self.text = text or ""

    def json(self):
        return self._json


@pytest.fixture
def caddyfile(tmp_path):
    p = tmp_path / "Caddyfile"
    p.write_text("# empty\n", encoding="utf-8")
    return p


@pytest.fixture
def wrapper(caddyfile, monkeypatch):
    monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: "/fake/caddy")
    return CaddyWrapper(caddyfile=caddyfile)


class TestBinaryDiscovery:
    def test_binary_resolves_via_which(self, caddyfile, monkeypatch):
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: "/x/caddy")
        w = CaddyWrapper(caddyfile=caddyfile)
        assert w.binary == "/x/caddy"

    def test_binary_explicit_path_used(self, caddyfile):
        w = CaddyWrapper(caddyfile=caddyfile, binary_path="/custom/caddy")
        assert w.binary == "/custom/caddy"

    def test_binary_missing_raises(self, caddyfile, monkeypatch):
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: None)
        w = CaddyWrapper(caddyfile=caddyfile)
        with pytest.raises(CaddyNotFound):
            _ = w.binary


class TestLifecycle:
    def test_start_invokes_caddy_start(self, wrapper, monkeypatch):
        seen = {}

        def fake_run(cmd, **kw):
            seen["cmd"] = cmd
            return _FakeCompleted()

        monkeypatch.setattr(subprocess, "run", fake_run)
        wrapper.start()
        assert seen["cmd"][1] == "start"
        assert "--config" in seen["cmd"]

    def test_start_failure_raises(self, wrapper, monkeypatch):
        monkeypatch.setattr(
            subprocess,
            "run",
            lambda *a, **kw: _FakeCompleted(returncode=1, stderr="boom"),
        )
        with pytest.raises(ReloadFailed) as exc:
            wrapper.start()
        assert "boom" in str(exc.value)

    def test_stop_invokes_caddy_stop(self, wrapper, monkeypatch):
        seen = {}

        def fake_run(cmd, **kw):
            seen["cmd"] = cmd
            return _FakeCompleted()

        monkeypatch.setattr(subprocess, "run", fake_run)
        wrapper.stop()
        assert seen["cmd"][1] == "stop"

    def test_reload_invokes_caddy_reload_with_config(self, wrapper, monkeypatch):
        seen = {}

        def fake_run(cmd, **kw):
            seen["cmd"] = cmd
            return _FakeCompleted()

        monkeypatch.setattr(subprocess, "run", fake_run)
        wrapper.reload()
        assert "reload" in seen["cmd"]
        assert "--config" in seen["cmd"]
        assert str(wrapper.caddyfile) in seen["cmd"]

    def test_reload_failure_raises(self, wrapper, monkeypatch):
        monkeypatch.setattr(
            subprocess,
            "run",
            lambda *a, **kw: _FakeCompleted(returncode=2, stderr="parse error"),
        )
        with pytest.raises(ReloadFailed):
            wrapper.reload()

    def test_validate(self, wrapper, monkeypatch):
        monkeypatch.setattr(subprocess, "run", lambda *a, **kw: _FakeCompleted())
        wrapper.validate()  # should not raise


class TestStatus:
    def test_status_returns_running_true_on_200(self, wrapper, monkeypatch):
        monkeypatch.setattr(
            httpx,
            "get",
            lambda *a, **kw: _FakeResponse(
                status_code=200, headers={"server": "Caddy/2.11.2 windows amd64"}
            ),
        )
        s = wrapper.status()
        assert s["running"] is True
        assert s["version"] == "2.11.2"
        assert s["error"] is None

    def test_status_returns_running_false_on_connection_error(self, wrapper, monkeypatch):
        def boom(*a, **kw):
            raise httpx.ConnectError("refused")

        monkeypatch.setattr(httpx, "get", boom)
        s = wrapper.status()
        assert s["running"] is False
        assert "refused" in s["error"]

    def test_status_handles_missing_server_header(self, wrapper, monkeypatch):
        monkeypatch.setattr(
            httpx, "get", lambda *a, **kw: _FakeResponse(status_code=200, headers={})
        )
        s = wrapper.status()
        assert s["version"] is None


class TestConfigDump:
    def test_returns_dict(self, wrapper, monkeypatch):
        monkeypatch.setattr(
            httpx,
            "get",
            lambda *a, **kw: _FakeResponse(status_code=200, json_body={"apps": {}}),
        )
        assert wrapper.config_dump() == {"apps": {}}

    def test_null_body_returns_empty_dict(self, wrapper, monkeypatch):
        monkeypatch.setattr(
            httpx,
            "get",
            lambda *a, **kw: _FakeResponse(status_code=200, json_body=None),
        )
        assert wrapper.config_dump() == {}

    def test_non_200_raises(self, wrapper, monkeypatch):
        monkeypatch.setattr(
            httpx,
            "get",
            lambda *a, **kw: _FakeResponse(status_code=500, text="oops"),
        )
        with pytest.raises(AdminAPIError):
            wrapper.config_dump()

    def test_connection_error_raises(self, wrapper, monkeypatch):
        def boom(*a, **kw):
            raise httpx.ConnectError("refused")

        monkeypatch.setattr(httpx, "get", boom)
        with pytest.raises(AdminAPIError):
            wrapper.config_dump()


class TestVersionExtraction:
    @pytest.mark.parametrize(
        "header, expected",
        [
            ("Caddy/2.11.2 windows amd64", "2.11.2"),
            ("Caddy/2.9.1", "2.9.1"),
            ("Caddy", None),
            ("", None),
            (None, None),
        ],
    )
    def test_extract(self, header, expected):
        assert CaddyWrapper._extract_version(header) == expected


class TestModuleHelpers:
    def test_caddy_available_true(self, monkeypatch):
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: "/x/caddy")
        assert caddy_available() is True

    def test_caddy_available_false(self, monkeypatch):
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: None)
        assert caddy_available() is False
