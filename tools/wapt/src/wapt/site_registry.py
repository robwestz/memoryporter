"""JSON-backed site registry.

The registry tracks which sites wapt manages. It is the source of truth
for `wapt list`, `wapt remove`, and the deploy targets in `wapt deploy`.

Stored at `~/.wapt/registry.json` by default. Schema:

    {
      "version": 1,
      "sites": {
        "<slug>": { ... SiteEntry fields ... }
      }
    }

Atomic writes: tempfile in the same directory + os.replace. The same-dir
constraint matters on Windows where cross-volume rename is not atomic.
"""
from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

from wapt.config_validation import SiteEntry
from wapt.error_library import RegistryCorrupt, SiteExists, SiteNotFound

CURRENT_VERSION = 1


class SiteRegistry:
    """JSON-backed CRUD over registered sites.

    The registry is loaded on every public method to avoid stale state
    when multiple processes or test fixtures touch the same file.
    """

    def __init__(self, path: Path) -> None:
        self.path = path

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def add_site(self, entry: SiteEntry) -> SiteEntry:
        """Insert a new site. Raises SiteExists if the name is taken."""
        data = self._load()
        if entry.name in data["sites"]:
            raise SiteExists(f"Site '{entry.name}' is already registered")
        data["sites"][entry.name] = entry.model_dump()
        self._save(data)
        return entry

    def remove_site(self, name: str) -> SiteEntry:
        """Remove a site by name. Raises SiteNotFound if absent."""
        data = self._load()
        if name not in data["sites"]:
            raise SiteNotFound(f"Site '{name}' is not registered")
        removed = SiteEntry.model_validate(data["sites"].pop(name))
        self._save(data)
        return removed

    def get_site(self, name: str) -> SiteEntry:
        """Look up a site by name. Raises SiteNotFound if absent."""
        data = self._load()
        if name not in data["sites"]:
            raise SiteNotFound(f"Site '{name}' is not registered")
        return SiteEntry.model_validate(data["sites"][name])

    def list_sites(self) -> list[SiteEntry]:
        """Return all registered sites, sorted by name."""
        data = self._load()
        entries = [
            SiteEntry.model_validate(raw)
            for raw in data["sites"].values()
        ]
        return sorted(entries, key=lambda e: e.name)

    def has_site(self, name: str) -> bool:
        """True if a site with this name exists."""
        return name in self._load()["sites"]

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _load(self) -> dict:
        """Load registry. Returns empty registry if file does not exist."""
        if not self.path.exists():
            return {"version": CURRENT_VERSION, "sites": {}}
        try:
            with self.path.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as exc:
            raise RegistryCorrupt(
                f"Registry file {self.path} is not valid JSON: {exc}"
            ) from exc
        except OSError as exc:
            raise RegistryCorrupt(f"Cannot read {self.path}: {exc}") from exc

        return self._migrate(data)

    def _migrate(self, data: dict) -> dict:
        """Run any needed schema migrations and validate top-level shape."""
        if not isinstance(data, dict):
            raise RegistryCorrupt(
                f"Registry root must be an object, got {type(data).__name__}"
            )
        version = data.get("version", 0)
        if not isinstance(version, int):
            raise RegistryCorrupt(f"Registry version must be int, got {version!r}")
        if version > CURRENT_VERSION:
            raise RegistryCorrupt(
                f"Registry version {version} is newer than supported "
                f"({CURRENT_VERSION}). Upgrade wapt."
            )
        # Future migrations would slot in here:
        #   if version == 1: data = _migrate_1_to_2(data); version = 2
        if version < CURRENT_VERSION:
            data["version"] = CURRENT_VERSION

        sites = data.get("sites")
        if not isinstance(sites, dict):
            raise RegistryCorrupt("Registry 'sites' must be an object")
        return {"version": data["version"], "sites": sites}

    def _save(self, data: dict) -> None:
        """Atomically write the registry to disk."""
        self.path.parent.mkdir(parents=True, exist_ok=True)
        rendered = json.dumps(data, indent=2, sort_keys=True) + "\n"
        tmp_fd, tmp_path = tempfile.mkstemp(
            prefix=self.path.name + ".", suffix=".tmp", dir=self.path.parent
        )
        try:
            with os.fdopen(tmp_fd, "w", encoding="utf-8") as f:
                f.write(rendered)
            os.replace(tmp_path, self.path)
        except Exception:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            raise


__all__ = ["CURRENT_VERSION", "SiteRegistry"]
