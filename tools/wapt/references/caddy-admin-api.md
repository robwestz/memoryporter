# Caddy Admin API — Reference
> Last updated: 2026-04-21

Caddy v2 exposes an HTTP management API on `localhost:2019` by default. This reference covers
all relevant endpoints, Python integration patterns, schema-drift risks, and security hardening.

---

## Version Pins

| Component | Pin | Notes |
|-----------|-----|-------|
| Caddy Admin API | v2 | Stable since Caddy v2.0 |
| Admin API port (default) | 2019 | localhost only by default |
| Caddy minimum for wapt | v2.8.0 | Stable JSON schema |

---

## Overview

The Admin API is Caddy's HTTP management interface. It lets you:
- Query the current running configuration as JSON
- Replace or patch the configuration without restarting
- Gracefully stop the server
- Inspect runtime state and metrics

The API listens on `localhost:2019` by default — it is NOT exposed to the network.
No authentication is required for local access (loopback only). Remote access requires
explicit configuration with mutual TLS.

---

## Core Endpoints

### `GET /config/` — Fetch running config
Returns the current Caddy configuration as JSON.

```bash
curl http://localhost:2019/config/
```

Drill into a specific path using JSON path notation:
```bash
# Get just the apps section
curl http://localhost:2019/config/apps/

# Get the first server's routes
curl http://localhost:2019/config/apps/http/servers/srv0/routes/
```

### `POST /load` — Replace entire config
Replaces the running configuration atomically. Caddy validates the new config, applies it,
and rolls back automatically if it fails. Zero downtime.

```bash
curl http://localhost:2019/load \
  -H "Content-Type: application/json" \
  -d @caddy.json
```

Force reload even if config hash matches (e.g., after cert rotation):
```bash
curl http://localhost:2019/load \
  -H "Content-Type: application/json" \
  -H "Cache-Control: must-revalidate" \
  -d @caddy.json
```

### `PATCH /config/[path]` — Patch a specific config section
Replace only part of the config without touching the rest:
```bash
curl -X PATCH http://localhost:2019/config/apps/tls/certificates/load_files/0 \
  -H "Content-Type: application/json" \
  -d '{"certificate": "/path/to/new.pem", "key": "/path/to/new-key.pem"}'
```

### `POST /stop` — Graceful shutdown
```bash
curl -X POST http://localhost:2019/stop
```

### `GET /reverse_proxy/upstreams` — Upstream health
```bash
curl http://localhost:2019/reverse_proxy/upstreams
```

---

## `caddy reload` vs `POST /load` — Difference

| Method | What it does | When to use |
|--------|-------------|-------------|
| `caddy reload --config caddy.json` | CLI reads file, adapts if needed, POSTs to `/load` | Interactive dev, shell scripts |
| `POST /load` (direct) | HTTP POST with JSON body directly | Python automation, wapt |
| `caddy run --config caddy.json` | Start fresh process (not a reload) | First boot only |

`caddy reload` is a thin wrapper: it reads the config file, adapts it if it is a Caddyfile
(converts to JSON), then issues `POST /load` to the Admin API. Direct `POST /load` skips
file I/O and format conversion — faster and simpler for programmatic use.

Both block until the reload completes or fails. If the new config is invalid, the old config
stays running — no downtime.

---

## Prometheus Metrics (`GET /metrics`)

Caddy exposes Prometheus metrics if the `metrics` module is enabled in config:

```json
{
  "apps": {
    "http": {
      "metrics": {}
    }
  }
}
```

Then query:
```bash
curl http://localhost:2019/metrics
```

Output is standard Prometheus text format. Key metrics:
- `caddy_http_requests_total` — request count by server, method, status code
- `caddy_http_request_duration_seconds` — latency histogram
- `caddy_http_response_size_bytes` — response size histogram
- `caddy_admin_http_requests_total` — admin API request count

For local dev (wapt), metrics are optional — enable only if you need performance profiling.

---

## Python Examples

### Helper class (httpx-based, recommended)

```python
import json
from pathlib import Path
from typing import Any

import httpx


class CaddyAdminClient:
    """
    Thin Python client for the Caddy Admin API v2.
    Assumes Caddy is running locally with default admin port 2019.
    Requires: pip install httpx
    """

    def __init__(
        self,
        base_url: str = "http://localhost:2019",
        timeout: float = 10.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    # ------------------------------------------------------------------
    # Config read
    # ------------------------------------------------------------------

    def get_config(self, path: str = "") -> Any:
        """
        Fetch the running Caddy config (or a sub-path).
        path examples: "", "apps/", "apps/http/servers/"
        """
        url = f"{self.base_url}/config/{path.lstrip('/')}"
        resp = httpx.get(url, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    # ------------------------------------------------------------------
    # Config write
    # ------------------------------------------------------------------

    def load_config(self, config: dict, force: bool = False) -> None:
        """
        Replace the running config via POST /load.
        Set force=True to reload even if config hash matches
        (needed after cert rotation with unchanged config structure).
        """
        headers = {"Content-Type": "application/json"}
        if force:
            headers["Cache-Control"] = "must-revalidate"
        resp = httpx.post(
            f"{self.base_url}/load",
            content=json.dumps(config),
            headers=headers,
            timeout=self.timeout,
        )
        resp.raise_for_status()

    def load_config_file(self, config_path: str | Path, force: bool = False) -> None:
        """Load config from a JSON file on disk."""
        config = json.loads(Path(config_path).read_text(encoding="utf-8"))
        self.load_config(config, force=force)

    def patch_config(self, path: str, value: Any) -> None:
        """
        Patch a specific section of the running config.
        path: JSON path like "apps/http/servers/srv0/routes/0"
        """
        url = f"{self.base_url}/config/{path.lstrip('/')}"
        resp = httpx.patch(
            url,
            content=json.dumps(value),
            headers={"Content-Type": "application/json"},
            timeout=self.timeout,
        )
        resp.raise_for_status()

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def stop(self) -> None:
        """Gracefully stop Caddy."""
        resp = httpx.post(f"{self.base_url}/stop", timeout=self.timeout)
        resp.raise_for_status()

    def is_running(self) -> bool:
        """Return True if the Admin API is reachable."""
        try:
            httpx.get(f"{self.base_url}/config/", timeout=2.0).raise_for_status()
            return True
        except Exception:
            return False

    # ------------------------------------------------------------------
    # Metrics
    # ------------------------------------------------------------------

    def get_metrics_raw(self) -> str:
        """Return raw Prometheus metrics text. Requires metrics module enabled in config."""
        resp = httpx.get(f"{self.base_url}/metrics", timeout=self.timeout)
        resp.raise_for_status()
        return resp.text
```

### Usage examples

```python
caddy = CaddyAdminClient()

# Check if running before issuing commands
if not caddy.is_running():
    raise RuntimeError("Caddy admin API not reachable on localhost:2019")

# Fetch current config
config = caddy.get_config()
print(config["apps"]["http"]["servers"])

# Hot-reload from file (zero downtime)
caddy.load_config_file("caddy.json")

# Force reload after cert rotation (same config structure, new cert files on disk)
caddy.load_config_file("caddy.json", force=True)

# Patch a single value without touching the rest of the config
caddy.patch_config(
    "apps/http/servers/srv0/routes/0/handle/0",
    {"handler": "static_response", "body": "ok"},
)
```

### Requests-based alternative (if httpx not available)

```python
import json
import requests


def caddy_get_config(admin_url: str = "http://localhost:2019") -> dict:
    """GET /config/ with requests library."""
    resp = requests.get(f"{admin_url}/config/", timeout=10)
    resp.raise_for_status()
    return resp.json()


def caddy_load(config: dict, admin_url: str = "http://localhost:2019") -> None:
    """POST /load with requests library."""
    resp = requests.post(
        f"{admin_url}/load",
        data=json.dumps(config),
        headers={"Content-Type": "application/json"},
        timeout=10,
    )
    resp.raise_for_status()
```

---

## Schema-Drift Risks Between Caddy Versions

Caddy's JSON config schema can change between minor versions. Known risk areas:

| Config area | Risk level | Notes |
|-------------|-----------|-------|
| `apps/http/servers/*/routes` | Low | Stable since v2.0 |
| `apps/tls/certificates` | Medium | Field names adjusted in v2.7+ |
| `apps/http/servers/*/logs` | Medium | Logger config restructured in v2.6 |
| `admin` block | Low | Stable |
| Third-party module config | High | Modules version independently |

### Detecting schema incompatibility

```python
import re
import subprocess
from packaging.version import Version


def get_caddy_version() -> str:
    """Get running Caddy version by calling the CLI."""
    result = subprocess.run(
        ["caddy", "version"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    match = re.match(r"(v[\d.]+)", result.stdout.strip())
    return match.group(1) if match else "unknown"


def assert_caddy_schema_compatible(min_ver: str = "2.8.0") -> None:
    """
    Raise RuntimeError if Caddy version predates the minimum tested schema version.
    Call this at wapt startup before issuing any Admin API config writes.
    """
    ver_str = get_caddy_version()
    if ver_str == "unknown":
        return  # cannot check; proceed with caution
    ver = Version(ver_str.lstrip("v"))
    if ver < Version(min_ver):
        raise RuntimeError(
            f"Caddy {ver_str} may have schema incompatibilities. "
            f"Minimum tested version for wapt: {min_ver}. "
            f"Upgrade with: scoop update caddy"
        )
```

### Defensive config loading

```python
def safe_load_config(caddy: CaddyAdminClient, config: dict) -> None:
    """
    Load config and surface a clear error if Caddy rejects it.
    Caddy rolls back automatically on failure, but this pattern logs
    the rejection reason before re-raising.
    """
    try:
        caddy.load_config(config)
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"Caddy rejected config "
            f"(HTTP {exc.response.status_code}): {exc.response.text}"
        ) from exc
```

---

## Disabling the Admin API — Security Aspects

By default, the Admin API is only accessible from `localhost` — not exposed to the network.
This is safe for local development. For production or shared environments, consider disabling it.

### Disable via Caddyfile

```
{
    admin off
}
```

### Disable via JSON config

```json
{
  "admin": {
    "disabled": true
  }
}
```

**Consequence of disabling:** `caddy reload` and `caddy stop` both stop working — they
communicate via the Admin API. You must kill and restart the process manually.
For wapt (local dev tool), keep the Admin API enabled.

### Restrict to localhost only (explicit, same as default)

```json
{
  "admin": {
    "listen": "localhost:2019"
  }
}
```

### Change the admin port

```json
{
  "admin": {
    "listen": "localhost:2099"
  }
}
```

If you change the port, update `CaddyAdminClient(base_url="http://localhost:2099")` in wapt.

### Remote Admin API (mutual TLS — not needed for wapt)

```json
{
  "admin": {
    "remote": {
      "listen": "0.0.0.0:2021",
      "access_control": [
        {
          "public_keys": ["<client-cert-public-key-pem>"],
          "permissions": [{"methods": ["GET"], "paths": ["/config/"]}]
        }
      ]
    }
  }
}
```

### Security summary

| Scenario | Admin API setting | Risk |
|----------|------------------|------|
| Local dev (wapt) | Default `localhost:2019` | Negligible — loopback only |
| Shared dev server | Restrict to specific IP or disable | Medium |
| Production | `disabled: true` | Required |

---

## Best Practices

- Use `POST /load` with `force=True` after cert rotation — config hash unchanged but cert files on disk are new
- Always call `caddy.is_running()` before issuing API calls in automation scripts
- Prefer `load_config_file()` over constructing JSON in Python — keep config as a versioned file
- Log the full error response body on `HTTPStatusError` — Caddy returns descriptive JSON errors
- Pin the Caddy version in your install script and run `assert_caddy_schema_compatible()` after upgrades
- Never expose port 2019 through a firewall rule — the Admin API has no authentication for local access

---

## External Links

- [Caddy Admin API Docs](https://caddyserver.com/docs/api)
- [Caddy API Tutorial](https://caddyserver.com/docs/api-tutorial)
- [Caddy API Quick-start](https://caddyserver.com/docs/quick-starts/api)
- [Caddy JSON Schema: admin/disabled](https://caddyserver.com/docs/json/admin/disabled)
- [Caddy JSON Schema: admin/](https://caddyserver.com/docs/json/admin/)
- [Caddy Admin API — DeepWiki](https://deepwiki.com/caddyserver/caddy/2.3-admin-api)
- [Caddy Global Options (Caddyfile)](https://caddyserver.com/docs/caddyfile/options)
