"""Unit tests for wapt.config_validation — Pydantic schemas + load/write."""
from __future__ import annotations

import re

import pytest
from pydantic import ValidationError

from wapt.config_validation import (
    SiteEntry,
    WaptConfig,
    default_config,
    load_config,
    utc_now_iso,
    write_config,
)
from wapt.error_library import ConfigValidationError, InvalidConfig


class TestDefaults:
    def test_default_config_is_waptconfig(self):
        cfg = default_config()
        assert isinstance(cfg, WaptConfig)

    def test_default_features_colored_output_on(self):
        cfg = default_config()
        assert cfg.features.colored_output is True

    def test_default_features_l1_off(self):
        cfg = default_config()
        assert cfg.features.target_heroku is False
        assert cfg.features.sentry_hook is False

    def test_default_caddy_admin_url(self):
        cfg = default_config()
        assert cfg.caddy.admin_url == "http://localhost:2019"


class TestSiteEntry:
    def _entry(self, **overrides):
        base = dict(
            name="ecc",
            domain="ecc.localhost",
            root="/home/user/ecc",
            created_at=utc_now_iso(),
        )
        base.update(overrides)
        return SiteEntry(**base)

    def test_minimal_entry_valid(self):
        e = self._entry()
        assert e.name == "ecc"
        assert e.template == "site"
        assert e.tls == "mkcert"

    def test_uppercase_domain_rejected(self):
        with pytest.raises(ValidationError):
            self._entry(domain="ECC.localhost")

    def test_invalid_name_pattern_rejected(self):
        with pytest.raises(ValidationError):
            self._entry(name="ECC")

    def test_invalid_tls_rejected(self):
        with pytest.raises(ValidationError):
            self._entry(tls="weird")

    def test_targets_default_local(self):
        e = self._entry()
        assert e.targets == ["local"]

    def test_extra_field_forbidden(self):
        with pytest.raises(ValidationError):
            SiteEntry(
                name="ecc",
                domain="ecc.localhost",
                root="/x",
                created_at=utc_now_iso(),
                bogus_field="oops",  # type: ignore[call-arg]
            )


class TestUtcNowIso:
    def test_format(self):
        ts = utc_now_iso()
        assert re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$", ts)


class TestWriteAndReadRoundtrip:
    def test_roundtrip_default(self, tmp_path):
        cfg = default_config()
        path = tmp_path / "config.toml"
        write_config(cfg, path)
        loaded = load_config(path)
        assert loaded == cfg

    def test_write_creates_parent_dirs(self, tmp_path):
        cfg = default_config()
        path = tmp_path / "deep" / "nested" / "config.toml"
        write_config(cfg, path)
        assert path.exists()

    def test_write_is_atomic_no_tmp_left(self, tmp_path):
        cfg = default_config()
        path = tmp_path / "config.toml"
        write_config(cfg, path)
        leftovers = [p for p in tmp_path.iterdir() if p.suffix == ".tmp"]
        assert leftovers == []


class TestLoadErrors:
    def test_missing_file_raises_invalid_config(self, tmp_path):
        path = tmp_path / "nope.toml"
        with pytest.raises(InvalidConfig):
            load_config(path)

    def test_malformed_toml_raises_invalid_config(self, tmp_path):
        path = tmp_path / "bad.toml"
        path.write_text("this is = not [valid toml", encoding="utf-8")
        with pytest.raises(InvalidConfig):
            load_config(path)

    def test_unknown_field_raises_validation_error(self, tmp_path):
        path = tmp_path / "extra.toml"
        path.write_text(
            "[features]\ncolored_output = true\nunknown_flag = true\n",
            encoding="utf-8",
        )
        with pytest.raises(ConfigValidationError):
            load_config(path)
