"""Named exceptions with exit codes and action strings for wapt.

Exit code contract:
    0   — success (never raised)
    1   — CaddyNotFound
    2   — MkcertNotFound
    3   — SiteExists
    4   — SiteNotFound
    5   — InvalidConfig
    6   — AdminAPIError
    7   — RegistryCorrupt
    8   — PortConflict
    9   — CertExpired
    10  — ReloadFailed
    11  — TemplateError
    12  — ConfigValidationError
    13  — PathNotAbsolute
    14  — DomainInvalid
    15  — UnknownTarget
"""
from __future__ import annotations


class WaptError(Exception):
    """Base class for all wapt errors.

    Attributes:
        code:   Exit code wapt should use when this error propagates to the CLI.
        action: Human-readable remediation text shown after the error message.
    """

    code: int
    action: str

    def __init__(self, message: str, *, code: int = 0, action: str = "") -> None:
        super().__init__(message)
        self.code = code
        self.action = action

    def __str__(self) -> str:
        base = super().__str__()
        if self.action:
            return f"{base}\n  Action: {self.action}"
        return base


# ---------------------------------------------------------------------------
# L0 exceptions  (codes 1-15, stable across versions)
# ---------------------------------------------------------------------------

class CaddyNotFound(WaptError):
    """Caddy binary not found in PATH or at configured path."""

    def __init__(self, message: str, *, action: str = "Install Caddy: scoop install caddy") -> None:
        super().__init__(message, code=1, action=action)


class MkcertNotFound(WaptError):
    """mkcert binary not found in PATH or at known Scoop/Choco paths."""

    def __init__(self, message: str, *, action: str = "Install mkcert: scoop install mkcert") -> None:
        super().__init__(message, code=2, action=action)


class SiteExists(WaptError):
    """A site with this name is already registered in the registry."""

    def __init__(self, message: str, *, action: str = "Use 'wapt remove <name>' first, or choose a different name.") -> None:
        super().__init__(message, code=3, action=action)


class SiteNotFound(WaptError):
    """No site with this name exists in the registry."""

    def __init__(self, message: str, *, action: str = "Run 'wapt list' to see registered sites.") -> None:
        super().__init__(message, code=4, action=action)


class InvalidConfig(WaptError):
    """Config file is missing, unreadable, or contains invalid TOML."""

    def __init__(self, message: str, *, action: str = "Run 'wapt init' to create a default config.") -> None:
        super().__init__(message, code=5, action=action)


class AdminAPIError(WaptError):
    """Caddy Admin API returned an unexpected HTTP error."""

    def __init__(self, message: str, *, action: str = "Check that Caddy is running: wapt health") -> None:
        super().__init__(message, code=6, action=action)


class RegistryCorrupt(WaptError):
    """Registry JSON is malformed or has an incompatible schema version."""

    def __init__(self, message: str, *, action: str = "Inspect ~/.wapt/registry.json and fix or delete it.") -> None:
        super().__init__(message, code=7, action=action)


class PortConflict(WaptError):
    """A required port (80, 443, or 2019) is already in use."""

    def __init__(self, message: str, *, action: str = "Free the port or update caddy.admin_url in wapt.toml.") -> None:
        super().__init__(message, code=8, action=action)


class CertExpired(WaptError):
    """An mkcert certificate has expired or is near expiry."""

    def __init__(self, message: str, *, action: str = "Run 'wapt add <name>' again to regenerate the certificate.") -> None:
        super().__init__(message, code=9, action=action)


class ReloadFailed(WaptError):
    """Caddy reload via Admin API and binary fallback both failed."""

    def __init__(self, message: str, *, action: str = "Check Caddy logs and validate caddy/Caddyfile syntax.") -> None:
        super().__init__(message, code=10, action=action)


class TemplateError(WaptError):
    """Jinja2 template rendering failed (missing variable or template not found)."""

    def __init__(self, message: str, *, action: str = "Check templates/ directory and site entry fields.") -> None:
        super().__init__(message, code=11, action=action)


class ConfigValidationError(WaptError):
    """Pydantic validation of wapt.toml or a site entry failed."""

    def __init__(self, message: str, *, action: str = "Fix the reported field in ~/.wapt/config.toml.") -> None:
        super().__init__(message, code=12, action=action)


class PathNotAbsolute(WaptError):
    """A path argument must be absolute but a relative path was given."""

    def __init__(self, message: str, *, action: str = "Provide an absolute path, e.g. /home/user/projects/mysite") -> None:
        super().__init__(message, code=13, action=action)


class DomainInvalid(WaptError):
    """Domain name contains invalid characters or an unsupported TLD."""

    def __init__(self, message: str, *, action: str = "Use a .localhost domain, e.g. mysite.localhost") -> None:
        super().__init__(message, code=14, action=action)


class UnknownTarget(WaptError):
    """An unrecognised deployment target was specified."""

    def __init__(self, message: str, *, action: str = "Known targets: local, ghpages, heroku.") -> None:
        super().__init__(message, code=15, action=action)
