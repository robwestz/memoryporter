"""Unit tests for wapt.contract_tests — httpx + filesystem mocked."""
from __future__ import annotations

import json

import httpx
import pytest

from wapt.contract_tests import (
    fetch_schema_snapshot,
    load_snapshot,
    validate_admin_api_schema,
)

SAMPLE_SNAPSHOT = {
    "caddy_version": "2.11.2",
    "top_level_keys": ["apps"],
    "apps_keys": ["http", "tls"],
}


class _FakeResp:
    def __init__(self, status_code=200, body=None, headers=None):
        self.status_code = status_code
        self._body = body if body is not None else {}
        self.headers = headers or {}

    def json(self):
        return self._body

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError("err", request=None, response=self)  # type: ignore[arg-type]


@pytest.fixture
def snapshot_path(tmp_path):
    p = tmp_path / "snapshot.json"
    p.write_text(json.dumps(SAMPLE_SNAPSHOT), encoding="utf-8")
    return p


# ---------------------------------------------------------------------------


class TestLoadSnapshot:
    def test_loads_valid_json(self, snapshot_path):
        snap = load_snapshot(snapshot_path)
        assert snap["caddy_version"] == "2.11.2"
        assert "apps" in snap["top_level_keys"]

    def test_missing_raises(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            load_snapshot(tmp_path / "nope.json")


class TestValidate:
    def test_match_returns_info_ok(self, snapshot_path, monkeypatch):
        live = {"apps": {"http": {}, "tls": {}, "extra_key": {}}}
        monkeypatch.setattr(httpx, "get", lambda *a, **kw: _FakeResp(200, live))
        r = validate_admin_api_schema(snapshot_path=snapshot_path)
        assert r.ok is True
        assert r.severity == "info"

    def test_missing_top_level_is_error(self, snapshot_path, monkeypatch):
        live = {"logging": {}}  # no 'apps'
        monkeypatch.setattr(httpx, "get", lambda *a, **kw: _FakeResp(200, live))
        r = validate_admin_api_schema(snapshot_path=snapshot_path)
        assert r.ok is False
        assert r.severity == "error"
        assert "top-level missing" in r.message
        assert "apps" in r.message

    def test_missing_apps_key_is_error(self, snapshot_path, monkeypatch):
        live = {"apps": {"http": {}}}  # no 'tls'
        monkeypatch.setattr(httpx, "get", lambda *a, **kw: _FakeResp(200, live))
        r = validate_admin_api_schema(snapshot_path=snapshot_path)
        assert r.ok is False
        assert r.severity == "error"
        assert "tls" in r.message

    def test_caddy_unreachable_is_warning(self, snapshot_path, monkeypatch):
        def boom(*a, **kw):
            raise httpx.ConnectError("refused")

        monkeypatch.setattr(httpx, "get", boom)
        r = validate_admin_api_schema(snapshot_path=snapshot_path)
        assert r.ok is False
        assert r.severity == "warning"

    def test_non_200_is_warning(self, snapshot_path, monkeypatch):
        monkeypatch.setattr(httpx, "get", lambda *a, **kw: _FakeResp(500, {}))
        r = validate_admin_api_schema(snapshot_path=snapshot_path)
        assert r.ok is False
        assert r.severity == "warning"

    def test_missing_snapshot_file_is_error(self, tmp_path, monkeypatch):
        monkeypatch.setattr(httpx, "get", lambda *a, **kw: _FakeResp(200, {}))
        r = validate_admin_api_schema(snapshot_path=tmp_path / "nope.json")
        assert r.ok is False
        assert r.severity == "error"


class TestFetchSchemaSnapshot:
    def test_extracts_keys_and_version(self, monkeypatch):
        live = {"apps": {"http": {}, "tls": {}}, "logging": {}}
        monkeypatch.setattr(
            httpx,
            "get",
            lambda *a, **kw: _FakeResp(
                200, live, headers={"server": "Caddy/2.11.2 windows amd64"}
            ),
        )
        snap = fetch_schema_snapshot()
        assert snap["caddy_version"] == "2.11.2"
        assert snap["top_level_keys"] == ["apps", "logging"]
        assert snap["apps_keys"] == ["http", "tls"]

    def test_unknown_version_when_header_missing(self, monkeypatch):
        live = {"apps": {}}
        monkeypatch.setattr(
            httpx, "get", lambda *a, **kw: _FakeResp(200, live, headers={})
        )
        snap = fetch_schema_snapshot()
        assert snap["caddy_version"] == "unknown"


class TestCommittedSnapshot:
    """Verify the committed snapshot file is well-formed."""

    def test_default_snapshot_loads(self):
        from wapt.contract_tests import DEFAULT_SNAPSHOT_PATH

        snap = load_snapshot(DEFAULT_SNAPSHOT_PATH)
        assert "apps" in snap["top_level_keys"]
        assert "http" in snap["apps_keys"]
        assert "tls" in snap["apps_keys"]
