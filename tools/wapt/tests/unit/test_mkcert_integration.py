"""Unit tests for wapt.mkcert_integration — subprocess fully mocked."""
from __future__ import annotations

import datetime as _dt
import subprocess

import pytest

from wapt import mkcert_integration as mki
from wapt.error_library import CertExpired, MkcertNotFound


class _Completed:
    def __init__(self, returncode=0, stdout="", stderr=""):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


@pytest.fixture
def fake_mkcert(monkeypatch):
    """Pretend mkcert is on PATH at /fake/mkcert."""
    monkeypatch.setattr(
        "wapt.mkcert_integration.shutil.which",
        lambda name: "/fake/mkcert" if name == "mkcert" else None,
    )


class TestMkcertBinary:
    def test_resolves_when_present(self, fake_mkcert):
        assert mki.mkcert_binary() == "/fake/mkcert"

    def test_raises_when_missing(self, monkeypatch):
        monkeypatch.setattr("wapt.mkcert_integration.shutil.which", lambda _: None)
        with pytest.raises(MkcertNotFound):
            mki.mkcert_binary()


class TestCaroot:
    def test_returns_path_from_subprocess(self, fake_mkcert, monkeypatch, tmp_path):
        monkeypatch.setattr(
            subprocess,
            "run",
            lambda *a, **kw: _Completed(stdout=str(tmp_path) + "\n"),
        )
        assert mki.caroot() == tmp_path

    def test_failure_raises(self, fake_mkcert, monkeypatch):
        monkeypatch.setattr(
            subprocess,
            "run",
            lambda *a, **kw: _Completed(returncode=1, stderr="ohno"),
        )
        with pytest.raises(MkcertNotFound):
            mki.caroot()


class TestInstallCaCheck:
    def test_ok_when_files_present(self, fake_mkcert, monkeypatch, tmp_path):
        (tmp_path / "rootCA.pem").write_text("x", encoding="utf-8")
        (tmp_path / "rootCA-key.pem").write_text("x", encoding="utf-8")
        monkeypatch.setattr(
            subprocess, "run", lambda *a, **kw: _Completed(stdout=str(tmp_path))
        )
        result = mki.install_ca_check()
        assert result["ok"] is True
        assert result["caroot"] == tmp_path

    def test_fail_when_files_missing(self, fake_mkcert, monkeypatch, tmp_path):
        monkeypatch.setattr(
            subprocess, "run", lambda *a, **kw: _Completed(stdout=str(tmp_path))
        )
        result = mki.install_ca_check()
        assert result["ok"] is False
        assert "Run: mkcert -install" in result["message"]

    def test_fail_when_mkcert_missing(self, monkeypatch):
        monkeypatch.setattr("wapt.mkcert_integration.shutil.which", lambda _: None)
        result = mki.install_ca_check()
        assert result["ok"] is False
        assert result["caroot"] is None


class TestEnsureCert:
    def test_returns_existing_certs_without_subprocess(self, fake_mkcert, monkeypatch, tmp_path):
        certs = tmp_path / "certs"
        certs.mkdir()
        (certs / "ecc.localhost.pem").write_text("cert", encoding="utf-8")
        (certs / "ecc.localhost-key.pem").write_text("key", encoding="utf-8")

        called = {"ran": False}

        def fake_run(*a, **kw):
            called["ran"] = True
            return _Completed()

        monkeypatch.setattr(subprocess, "run", fake_run)
        cert, key = mki.ensure_cert("ecc.localhost", certs)
        assert cert.name == "ecc.localhost.pem"
        assert key.name == "ecc.localhost-key.pem"
        assert called["ran"] is False

    def test_runs_mkcert_when_missing(self, fake_mkcert, monkeypatch, tmp_path):
        certs = tmp_path / "certs"
        seen = {}

        def fake_run(cmd, **kw):
            seen["cmd"] = cmd
            (certs / "ecc.localhost.pem").write_text("c", encoding="utf-8")
            (certs / "ecc.localhost-key.pem").write_text("k", encoding="utf-8")
            return _Completed()

        monkeypatch.setattr(subprocess, "run", fake_run)
        cert, _ = mki.ensure_cert("ecc.localhost", certs)
        assert "ecc.localhost" in seen["cmd"]
        assert "-cert-file" in seen["cmd"]
        assert cert.exists()

    def test_mkcert_failure_raises(self, fake_mkcert, monkeypatch, tmp_path):
        monkeypatch.setattr(
            subprocess, "run", lambda *a, **kw: _Completed(returncode=2, stderr="bad")
        )
        with pytest.raises(MkcertNotFound):
            mki.ensure_cert("ecc.localhost", tmp_path / "certs")


class TestCheckExpiry:
    def test_missing_file_raises(self, tmp_path):
        with pytest.raises(CertExpired):
            mki.check_expiry(tmp_path / "missing.pem")

    def test_no_openssl_returns_sentinel(self, monkeypatch, tmp_path):
        cert = tmp_path / "ecc.pem"
        cert.write_text("x", encoding="utf-8")
        monkeypatch.setattr("wapt.mkcert_integration.shutil.which", lambda _: None)
        assert mki.check_expiry(cert) == _dt.timedelta(days=999)

    def test_parses_openssl_output(self, monkeypatch, tmp_path):
        cert = tmp_path / "ecc.pem"
        cert.write_text("x", encoding="utf-8")
        future = _dt.datetime.now(_dt.timezone.utc) + _dt.timedelta(days=365)
        date_str = future.strftime("%b %d %H:%M:%S %Y GMT")

        monkeypatch.setattr(
            "wapt.mkcert_integration.shutil.which",
            lambda name: "/fake/openssl" if name == "openssl" else None,
        )
        monkeypatch.setattr(
            subprocess,
            "run",
            lambda *a, **kw: _Completed(stdout=f"notAfter={date_str}\n"),
        )
        delta = mki.check_expiry(cert)
        assert 360 < delta.days < 370

    def test_openssl_failure_raises(self, monkeypatch, tmp_path):
        cert = tmp_path / "ecc.pem"
        cert.write_text("x", encoding="utf-8")
        monkeypatch.setattr(
            "wapt.mkcert_integration.shutil.which",
            lambda name: "/fake/openssl" if name == "openssl" else None,
        )
        monkeypatch.setattr(
            subprocess, "run", lambda *a, **kw: _Completed(returncode=1, stderr="fail")
        )
        with pytest.raises(CertExpired):
            mki.check_expiry(cert)


class TestIsNearExpiry:
    def test_far_future_false(self, monkeypatch, tmp_path):
        cert = tmp_path / "ecc.pem"
        cert.write_text("x", encoding="utf-8")
        monkeypatch.setattr(
            "wapt.mkcert_integration.check_expiry",
            lambda _: _dt.timedelta(days=365),
        )
        assert mki.is_near_expiry(cert) is False

    def test_near_expiry_true(self, monkeypatch, tmp_path):
        cert = tmp_path / "ecc.pem"
        cert.write_text("x", encoding="utf-8")
        monkeypatch.setattr(
            "wapt.mkcert_integration.check_expiry",
            lambda _: _dt.timedelta(days=10),
        )
        assert mki.is_near_expiry(cert) is True
