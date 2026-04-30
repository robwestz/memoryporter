"""Unit tests for wapt.error_library — exit codes and action strings."""
from __future__ import annotations

import pytest

from wapt.error_library import (
    AdminAPIError,
    CaddyNotFound,
    CertExpired,
    ConfigValidationError,
    DomainInvalid,
    InvalidConfig,
    MkcertNotFound,
    PathNotAbsolute,
    PortConflict,
    RegistryCorrupt,
    ReloadFailed,
    SiteExists,
    SiteNotFound,
    TemplateError,
    UnknownTarget,
    WaptError,
)


class TestWaptErrorBase:
    def test_is_exception(self):
        err = WaptError("msg", code=0, action="do something")
        assert isinstance(err, Exception)

    def test_code_attribute(self):
        err = WaptError("msg", code=42, action="fix it")
        assert err.code == 42

    def test_action_attribute(self):
        err = WaptError("msg", code=1, action="run wapt init")
        assert err.action == "run wapt init"

    def test_str_contains_action(self):
        err = WaptError("something broke", code=1, action="run wapt init")
        assert "run wapt init" in str(err)

    def test_str_contains_message(self):
        err = WaptError("something broke", code=1, action="run wapt init")
        assert "something broke" in str(err)


class TestExitCodes:
    """Each named exception must carry the documented exit code."""

    @pytest.mark.parametrize(
        "exc_cls, expected_code",
        [
            (CaddyNotFound, 1),
            (MkcertNotFound, 2),
            (SiteExists, 3),
            (SiteNotFound, 4),
            (InvalidConfig, 5),
            (AdminAPIError, 6),
            (RegistryCorrupt, 7),
            (PortConflict, 8),
            (CertExpired, 9),
            (ReloadFailed, 10),
            (TemplateError, 11),
            (ConfigValidationError, 12),
            (PathNotAbsolute, 13),
            (DomainInvalid, 14),
            (UnknownTarget, 15),
        ],
    )
    def test_exit_code(self, exc_cls, expected_code):
        err = exc_cls("test message")
        assert err.code == expected_code

    def test_all_are_wapt_errors(self):
        classes = [
            CaddyNotFound, MkcertNotFound, SiteExists, SiteNotFound,
            InvalidConfig, AdminAPIError, RegistryCorrupt, PortConflict,
            CertExpired, ReloadFailed, TemplateError, ConfigValidationError,
            PathNotAbsolute, DomainInvalid, UnknownTarget,
        ]
        for cls in classes:
            assert issubclass(cls, WaptError), f"{cls.__name__} must subclass WaptError"


class TestActionStrings:
    """Each exception should expose a non-empty action string."""

    def test_caddy_not_found_action(self):
        err = CaddyNotFound("caddy not in PATH")
        assert len(err.action) > 0

    def test_mkcert_not_found_action(self):
        err = MkcertNotFound("mkcert not in PATH")
        assert len(err.action) > 0

    def test_site_exists_action(self):
        err = SiteExists("mysite already registered")
        assert len(err.action) > 0

    def test_site_not_found_action(self):
        err = SiteNotFound("mysite not in registry")
        assert len(err.action) > 0

    def test_registry_corrupt_action(self):
        err = RegistryCorrupt("json parse failed")
        assert len(err.action) > 0

    def test_domain_invalid_action(self):
        err = DomainInvalid("bad-domain")
        assert len(err.action) > 0

    def test_path_not_absolute_action(self):
        err = PathNotAbsolute("relative/path")
        assert len(err.action) > 0

    def test_custom_action_override(self):
        """Caller can override the default action string."""
        err = CaddyNotFound("not found", action="custom fix")
        assert err.action == "custom fix"


class TestRaiseBehavior:
    def test_can_be_raised_and_caught(self):
        with pytest.raises(CaddyNotFound) as exc_info:
            raise CaddyNotFound("caddy missing")
        assert exc_info.value.code == 1

    def test_can_be_caught_as_wapt_error(self):
        with pytest.raises(WaptError):
            raise MkcertNotFound("mkcert missing")

    def test_can_be_caught_as_exception(self):
        with pytest.raises(Exception):
            raise SiteExists("already exists")
