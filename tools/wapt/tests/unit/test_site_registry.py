"""Unit tests for wapt.site_registry — JSON-backed CRUD."""
from __future__ import annotations

import json

import pytest

from wapt.config_validation import SiteEntry, utc_now_iso
from wapt.error_library import RegistryCorrupt, SiteExists, SiteNotFound
from wapt.site_registry import CURRENT_VERSION, SiteRegistry


def _entry(name="ecc", domain="ecc.localhost", root="/home/user/ecc"):
    return SiteEntry(
        name=name,
        domain=domain,
        root=root,
        created_at=utc_now_iso(),
    )


class TestEmptyRegistry:
    def test_list_sites_empty_when_file_missing(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        assert reg.list_sites() == []

    def test_has_site_false_when_empty(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        assert reg.has_site("anything") is False

    def test_get_site_raises_when_missing(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        with pytest.raises(SiteNotFound):
            reg.get_site("nope")


class TestAddSite:
    def test_add_persists_to_disk(self, tmp_path):
        path = tmp_path / "registry.json"
        reg = SiteRegistry(path)
        reg.add_site(_entry())
        assert path.exists()
        data = json.loads(path.read_text(encoding="utf-8"))
        assert data["version"] == CURRENT_VERSION
        assert "ecc" in data["sites"]

    def test_add_returns_entry(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        e = _entry()
        result = reg.add_site(e)
        assert result == e

    def test_add_duplicate_raises(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        reg.add_site(_entry())
        with pytest.raises(SiteExists):
            reg.add_site(_entry())

    def test_two_sites_coexist(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        reg.add_site(_entry(name="ecc", domain="ecc.localhost"))
        reg.add_site(_entry(name="bacowr", domain="bacowr.localhost"))
        names = [e.name for e in reg.list_sites()]
        assert names == ["bacowr", "ecc"]  # sorted


class TestRemoveSite:
    def test_remove_existing(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        reg.add_site(_entry())
        removed = reg.remove_site("ecc")
        assert removed.name == "ecc"
        assert reg.has_site("ecc") is False

    def test_remove_missing_raises(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        with pytest.raises(SiteNotFound):
            reg.remove_site("nope")


class TestGetSite:
    def test_get_returns_entry(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        reg.add_site(_entry())
        got = reg.get_site("ecc")
        assert got.name == "ecc"
        assert got.domain == "ecc.localhost"


class TestAtomicWrites:
    def test_no_tmp_files_left_after_add(self, tmp_path):
        reg = SiteRegistry(tmp_path / "registry.json")
        reg.add_site(_entry())
        leftovers = [p for p in tmp_path.iterdir() if p.suffix == ".tmp"]
        assert leftovers == []

    def test_creates_parent_dirs(self, tmp_path):
        path = tmp_path / "deep" / "nested" / "registry.json"
        reg = SiteRegistry(path)
        reg.add_site(_entry())
        assert path.exists()


class TestCorruption:
    def test_invalid_json_raises_registry_corrupt(self, tmp_path):
        path = tmp_path / "registry.json"
        path.write_text("not valid json {", encoding="utf-8")
        reg = SiteRegistry(path)
        with pytest.raises(RegistryCorrupt):
            reg.list_sites()

    def test_root_is_array_raises(self, tmp_path):
        path = tmp_path / "registry.json"
        path.write_text("[]", encoding="utf-8")
        reg = SiteRegistry(path)
        with pytest.raises(RegistryCorrupt):
            reg.list_sites()

    def test_sites_must_be_object(self, tmp_path):
        path = tmp_path / "registry.json"
        path.write_text(json.dumps({"version": 1, "sites": []}), encoding="utf-8")
        reg = SiteRegistry(path)
        with pytest.raises(RegistryCorrupt):
            reg.list_sites()

    def test_future_version_raises(self, tmp_path):
        path = tmp_path / "registry.json"
        path.write_text(
            json.dumps({"version": CURRENT_VERSION + 5, "sites": {}}),
            encoding="utf-8",
        )
        reg = SiteRegistry(path)
        with pytest.raises(RegistryCorrupt):
            reg.list_sites()
