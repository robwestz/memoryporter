"""Unit tests for wapt.health_check — httpx fully mocked."""
from __future__ import annotations

import httpx

from wapt.config_validation import SiteEntry, utc_now_iso
from wapt.health_check import (
    DEGRADED_LATENCY_MS,
    HealthResult,
    HealthStatus,
    check_all_sites,
    check_site,
    overall_exit_code,
)
from wapt.site_registry import SiteRegistry


def _entry(name="ecc", domain="ecc.localhost"):
    return SiteEntry(name=name, domain=domain, root="/x", created_at=utc_now_iso())


class _FakeResp:
    def __init__(self, status_code=200):
        self.status_code = status_code


class TestClassification:
    def test_ok_when_2xx_and_fast(self, monkeypatch):
        monkeypatch.setattr(httpx, "head", lambda *a, **kw: _FakeResp(200))
        result = check_site(_entry())
        assert result.status is HealthStatus.OK
        assert result.http_status == 200
        assert result.error is None
        assert result.latency_ms is not None

    def test_degraded_on_redirect(self, monkeypatch):
        monkeypatch.setattr(httpx, "head", lambda *a, **kw: _FakeResp(301))
        result = check_site(_entry())
        assert result.status is HealthStatus.DEGRADED
        assert result.http_status == 301

    def test_down_on_5xx(self, monkeypatch):
        monkeypatch.setattr(httpx, "head", lambda *a, **kw: _FakeResp(500))
        result = check_site(_entry())
        assert result.status is HealthStatus.DOWN
        assert result.http_status == 500

    def test_down_on_4xx(self, monkeypatch):
        monkeypatch.setattr(httpx, "head", lambda *a, **kw: _FakeResp(404))
        result = check_site(_entry())
        assert result.status is HealthStatus.DOWN

    def test_degraded_when_slow(self, monkeypatch):
        import wapt.health_check as hc

        ticks = iter([0.0, (DEGRADED_LATENCY_MS + 50) / 1000.0])
        monkeypatch.setattr(hc.time, "perf_counter", lambda: next(ticks))
        monkeypatch.setattr(httpx, "head", lambda *a, **kw: _FakeResp(200))
        result = check_site(_entry())
        assert result.status is HealthStatus.DEGRADED


class TestExceptions:
    def test_timeout_becomes_down(self, monkeypatch):
        def boom(*a, **kw):
            raise httpx.TimeoutException("slow")

        monkeypatch.setattr(httpx, "head", boom)
        result = check_site(_entry())
        assert result.status is HealthStatus.DOWN
        assert "timeout" in result.error.lower()
        assert result.latency_ms is None

    def test_connection_error_becomes_down(self, monkeypatch):
        def boom(*a, **kw):
            raise httpx.ConnectError("refused")

        monkeypatch.setattr(httpx, "head", boom)
        result = check_site(_entry())
        assert result.status is HealthStatus.DOWN
        assert "refused" in result.error


class TestCheckAllSites:
    def test_empty_registry(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        assert check_all_sites(reg) == []

    def test_polls_every_site(self, monkeypatch, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        reg.add_site(_entry(name="a", domain="a.localhost"))
        reg.add_site(_entry(name="b", domain="b.localhost"))

        urls_seen = []

        def fake_head(url, **kw):
            urls_seen.append(url)
            return _FakeResp(200)

        monkeypatch.setattr(httpx, "head", fake_head)
        results = check_all_sites(reg)
        assert len(results) == 2
        assert {r.name for r in results} == {"a", "b"}
        assert "https://a.localhost/" in urls_seen
        assert "https://b.localhost/" in urls_seen


class TestExitCode:
    def _r(self, status):
        return HealthResult(
            name="x",
            domain="x.localhost",
            status=status,
            http_status=200,
            latency_ms=10.0,
            error=None,
        )

    def test_empty_returns_0(self):
        assert overall_exit_code([]) == 0

    def test_all_ok_returns_0(self):
        assert overall_exit_code([self._r(HealthStatus.OK)] * 2) == 0

    def test_any_degraded_returns_1(self):
        assert (
            overall_exit_code([self._r(HealthStatus.OK), self._r(HealthStatus.DEGRADED)])
            == 1
        )

    def test_mixed_with_down_returns_1(self):
        assert (
            overall_exit_code([self._r(HealthStatus.OK), self._r(HealthStatus.DOWN)])
            == 1
        )

    def test_all_down_returns_2(self):
        assert overall_exit_code([self._r(HealthStatus.DOWN)] * 2) == 2


class TestToDict:
    def test_status_serialised_as_string(self):
        r = HealthResult(
            name="ecc",
            domain="ecc.localhost",
            status=HealthStatus.OK,
            http_status=200,
            latency_ms=42.0,
            error=None,
        )
        d = r.to_dict()
        assert d["status"] == "OK"
        assert d["http_status"] == 200
