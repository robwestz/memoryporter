"""Unit tests for wapt.doctor_command — every dependency mocked."""
from __future__ import annotations

import socket
import subprocess

import httpx

from wapt.config_validation import (
    SiteEntry,
    default_config,
    utc_now_iso,
)
from wapt.doctor_command import (
    CheckResult,
    check_caddy_installed,
    check_caddy_running,
    check_cert_expiry,
    check_mkcert_ca_installed,
    check_mkcert_installed,
    check_port_free,
    check_registry_integrity,
    overall_exit_code,
    run_all_checks,
)
from wapt.site_registry import SiteRegistry


class _Completed:
    def __init__(self, returncode=0, stdout="", stderr=""):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


class _FakeResp:
    def __init__(self, status_code=200, headers=None):
        self.status_code = status_code
        self.headers = headers or {}


def _entry(name="ecc", domain="ecc.localhost"):
    return SiteEntry(name=name, domain=domain, root="/x", created_at=utc_now_iso())


# ---------------------------------------------------------------------------


class TestCheckCaddyInstalled:
    def test_present(self, monkeypatch):
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: "/x/caddy")
        r = check_caddy_installed()
        assert r.ok is True
        assert r.severity == "info"

    def test_missing(self, monkeypatch):
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: None)
        r = check_caddy_installed()
        assert r.ok is False
        assert r.severity == "error"


class TestCheckMkcertInstalled:
    def test_present(self, monkeypatch):
        monkeypatch.setattr(
            "wapt.mkcert_integration.shutil.which",
            lambda name: "/x/mkcert" if name == "mkcert" else None,
        )
        r = check_mkcert_installed()
        assert r.ok is True

    def test_missing(self, monkeypatch):
        monkeypatch.setattr("wapt.mkcert_integration.shutil.which", lambda _: None)
        r = check_mkcert_installed()
        assert r.ok is False
        assert r.severity == "error"


class TestCheckMkcertCaInstalled:
    def test_ok(self, monkeypatch, tmp_path):
        (tmp_path / "rootCA.pem").write_text("x", encoding="utf-8")
        (tmp_path / "rootCA-key.pem").write_text("x", encoding="utf-8")
        monkeypatch.setattr(
            "wapt.mkcert_integration.shutil.which", lambda _: "/x/mkcert"
        )
        monkeypatch.setattr(
            subprocess, "run", lambda *a, **kw: _Completed(stdout=str(tmp_path))
        )
        r = check_mkcert_ca_installed()
        assert r.ok is True

    def test_missing_files(self, monkeypatch, tmp_path):
        monkeypatch.setattr(
            "wapt.mkcert_integration.shutil.which", lambda _: "/x/mkcert"
        )
        monkeypatch.setattr(
            subprocess, "run", lambda *a, **kw: _Completed(stdout=str(tmp_path))
        )
        r = check_mkcert_ca_installed()
        assert r.ok is False
        assert r.severity == "error"


class TestCheckCaddyRunning:
    def test_running(self, monkeypatch, tmp_path):
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: "/x/caddy")
        monkeypatch.setattr(
            httpx,
            "get",
            lambda *a, **kw: _FakeResp(200, {"server": "Caddy/2.11.2"}),
        )
        r = check_caddy_running("http://localhost:2019", tmp_path / "Caddyfile", "auto")
        assert r.ok is True

    def test_down_is_warning_not_error(self, monkeypatch, tmp_path):
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: "/x/caddy")

        def boom(*a, **kw):
            raise httpx.ConnectError("refused")

        monkeypatch.setattr(httpx, "get", boom)
        r = check_caddy_running("http://localhost:2019", tmp_path / "Caddyfile", "auto")
        assert r.ok is False
        assert r.severity == "warning"


class TestCheckPortFree:
    def test_free_port(self, monkeypatch):
        class FakeSock:
            def __enter__(self):
                return self

            def __exit__(self, *a):
                return False

            def setsockopt(self, *a, **kw):
                pass

            def bind(self, addr):
                return None

        monkeypatch.setattr(socket, "socket", lambda *a, **kw: FakeSock())
        r = check_port_free(54321)
        assert r.ok is True

    def test_busy_port_is_warning(self, monkeypatch):
        class BusySock:
            def __enter__(self):
                return self

            def __exit__(self, *a):
                return False

            def setsockopt(self, *a, **kw):
                pass

            def bind(self, addr):
                raise OSError(48, "Address in use")

        monkeypatch.setattr(socket, "socket", lambda *a, **kw: BusySock())
        r = check_port_free(443)
        assert r.ok is False
        assert r.severity == "warning"


class TestCheckCertExpiry:
    def test_no_sites(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        r = check_cert_expiry(reg, tmp_path / "certs")
        assert r.ok is True

    def test_missing_cert_warns(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        reg.add_site(_entry())
        r = check_cert_expiry(reg, tmp_path / "certs")
        assert r.ok is False
        assert r.severity == "warning"
        assert "ecc" in r.message

    def test_far_future_cert_passes(self, monkeypatch, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        reg.add_site(_entry())
        certs = tmp_path / "certs"
        certs.mkdir()
        (certs / "ecc.localhost.pem").write_text("x", encoding="utf-8")
        monkeypatch.setattr(
            "wapt.doctor_command.is_near_expiry",
            lambda cert, threshold_days=30: False,
        )
        r = check_cert_expiry(reg, certs)
        assert r.ok is True


class TestRegistryIntegrity:
    def test_clean_registry(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        r = check_registry_integrity(reg)
        assert r.ok is True

    def test_corrupt_is_error(self, tmp_path):
        path = tmp_path / "registry.json"
        path.write_text("{not valid", encoding="utf-8")
        reg = SiteRegistry(path)
        r = check_registry_integrity(reg)
        assert r.ok is False
        assert r.severity == "error"


class TestExitCode:
    def test_no_errors_returns_0(self):
        results = [
            CheckResult(name="x", ok=True, severity="info", message=""),
            CheckResult(name="y", ok=False, severity="warning", message=""),
        ]
        assert overall_exit_code(results) == 0

    def test_any_error_returns_1(self):
        results = [
            CheckResult(name="x", ok=True, severity="info", message=""),
            CheckResult(name="y", ok=False, severity="error", message=""),
        ]
        assert overall_exit_code(results) == 1


class TestRunAllChecks:
    def test_smoke(self, monkeypatch, tmp_path):
        # All dependencies mocked; verify aggregator returns 8 results
        monkeypatch.setattr("wapt.caddy_wrapper.shutil.which", lambda _: "/x/caddy")
        monkeypatch.setattr(
            "wapt.mkcert_integration.shutil.which",
            lambda name: "/x/mkcert" if name == "mkcert" else None,
        )
        (tmp_path / "rootCA.pem").write_text("x", encoding="utf-8")
        (tmp_path / "rootCA-key.pem").write_text("x", encoding="utf-8")
        monkeypatch.setattr(
            subprocess, "run", lambda *a, **kw: _Completed(stdout=str(tmp_path))
        )
        monkeypatch.setattr(
            httpx, "get", lambda *a, **kw: _FakeResp(200, {"server": "Caddy/2.11.2"})
        )

        cfg = default_config()
        results = run_all_checks(
            config=cfg,
            caddyfile=tmp_path / "Caddyfile",
            registry_path=tmp_path / "registry.json",
            certs_dir=tmp_path / "certs",
        )
        assert len(results) == 8
