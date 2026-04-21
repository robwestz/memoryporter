# Caddy Windows Install — Reference
> Last updated: 2026-04-21

Caddy v2 is a modern, zero-downtime HTTP server with automatic TLS. This reference covers
installation, background-process management, and Python integration on Windows 11 / Git Bash.

---

## Version Pins

| Component | Pin | Source |
|-----------|-----|--------|
| Caddy stable | **v2.11.1** | Chocolatey 2026-04 |
| Caddy minimum for wapt | v2.8.0 | admin API + HTTP/3 stable |
| Scoop bucket | `main` | `scoop install caddy` |

Check current release: `caddy version` or https://github.com/caddyserver/caddy/releases

---

## Install Methods

### Option A — Scoop (recommended for dev)
```bash
scoop install caddy
caddy version   # verify
```
Scoop installs to `~/scoop/shims/caddy.exe`. Updates via `scoop update caddy`.

### Option B — Chocolatey
```powershell
# Run as Administrator
choco install caddy
caddy version
```

### Option C — Manual download
1. Download ZIP from https://caddyserver.com/download (select Windows amd64)
2. Extract `caddy.exe` to `C:\tools\caddy\`
3. Add to PATH: `setx PATH "%PATH%;C:\tools\caddy"` (new terminal needed)
4. Verify: `caddy version`

### Option D — winget (Windows 11)
```powershell
winget install Caddy.Caddy
```

---

## Caddy CLI Reference

```bash
caddy version                      # print version string
caddy run --config caddy.json      # foreground, blocks
caddy start --config caddy.json    # background daemon (uses admin API)
caddy stop                         # graceful stop via admin API (port 2019)
caddy reload --config caddy.json   # hot-reload without downtime
caddy validate --config caddy.json # dry-run config check
caddy fmt --overwrite caddy.json   # format Caddyfile in-place
caddy adapt --config Caddyfile     # convert Caddyfile -> JSON
```

`caddy start` is Caddy's own background mode. It spawns a daemon and exits immediately.
Reload/stop commands communicate with it via the Admin API on `localhost:2019`.

---

## Running Caddy as a Background Process (Python)

### Method 1: `caddy start` (simplest)
```python
import subprocess

def start_caddy(config_path: str) -> None:
    """Start Caddy daemon using its own start command."""
    result = subprocess.run(
        ["caddy", "start", "--config", config_path],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"caddy start failed: {result.stderr}")
```

### Method 2: `subprocess.Popen` with DETACHED_PROCESS (Windows-native)
```python
import subprocess
from pathlib import Path

# Windows-only creation flags
DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200

def start_caddy_detached(config_path: str, log_path: str = "caddy.log") -> int:
    """
    Spawn Caddy as a fully detached process on Windows.
    Returns the PID so it can be tracked or killed later.
    """
    log_file = open(log_path, "a")
    proc = subprocess.Popen(
        ["caddy", "run", "--config", config_path],
        stdout=log_file,
        stderr=log_file,
        creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP,
        close_fds=True,
    )
    return proc.pid

def stop_caddy() -> None:
    """Stop a running Caddy instance via its Admin API."""
    import httpx
    httpx.post("http://localhost:2019/stop", timeout=5)
```

**When to use DETACHED_PROCESS vs `caddy start`:**
- `caddy start`: preferred — Caddy manages its own PID, admin API is guaranteed ready
- `DETACHED_PROCESS`: needed when you want full subprocess control from Python (e.g., test harness)
- Do NOT use both simultaneously — you will have two competing Caddy processes on port 443

### Method 3: NSSM (for persistent boot-time service)
```powershell
# Install NSSM: scoop install nssm  OR  choco install nssm
nssm install Caddy "C:\tools\caddy\caddy.exe"
nssm set Caddy AppParameters "run --config C:\sites\caddy.json"
nssm set Caddy AppStdout "C:\logs\caddy.log"
nssm set Caddy AppStderr "C:\logs\caddy-err.log"
nssm start Caddy
# Remove: nssm remove Caddy confirm
```

NSSM advantage: auto-restart on crash, survives reboots, integrates with Windows Event Log.
NSSM gotcha: does not forward signals cleanly — use `nssm stop Caddy` not `caddy stop`.

---

## Best Practices

- Prefer `caddy start` for dev. It owns the daemon lifecycle and is the most reliable method.
- Use `caddy stop` (not `taskkill`) to let Caddy drain connections gracefully.
- Always run `caddy validate --config caddy.json` before `caddy reload` to avoid config-induced downtime.
- Keep a single `caddy.json` as source of truth; generate it programmatically if needed.
- Use `--pidfile caddy.pid` with `caddy run` if you need PID tracking without NSSM.
- Do not put `caddy.exe` in a path with spaces — some subprocess invocations break on Windows.

---

## Windows Gotchas

### Windows Defender network prompt
On first run, Windows Firewall shows a dialog: "Allow Caddy to communicate on private/public networks?"
- Click **Allow access** for both private and public networks.
- In headless/CI scenarios, pre-approve with:
  ```powershell
  New-NetFirewallRule -DisplayName "Caddy HTTP/S" -Direction Inbound `
    -Program "C:\tools\caddy\caddy.exe" -Action Allow
  ```

### Port 443 conflicts
Common culprits on Windows 11:
```powershell
# Find who owns port 443
netstat -ano | findstr :443
# Map PID to process name
tasklist | findstr <PID>
```
Common offenders: IIS (`inetinfo.exe`), SQL Server Reporting Services, VMware.
Disable IIS: `net stop w3svc` or `Stop-Service W3SVC`.

### Port 2019 (Admin API) conflicts
Rarely contested but check: `netstat -ano | findstr :2019`.
Change the listen address in config if needed:
```json
{ "admin": { "listen": "localhost:2099" } }
```

### PATH after Scoop or Choco install
Always open a **new** terminal after install. Git Bash needs a new session.
Verify: `which caddy` (Git Bash) or `where caddy` (CMD/PowerShell).

---

## Python Version Detection

```python
import subprocess
import re
from typing import Optional


def get_caddy_version() -> Optional[str]:
    """Return caddy version string like 'v2.11.1', or None if not installed."""
    try:
        result = subprocess.run(
            ["caddy", "version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        # Output format: "v2.11.1 h1:abc123..."
        match = re.match(r"(v[\d.]+)", result.stdout.strip())
        return match.group(1) if match else None
    except FileNotFoundError:
        return None


def assert_caddy_minimum(min_version: str = "2.8.0") -> None:
    """Raise RuntimeError if caddy is missing or below minimum version."""
    from packaging.version import Version

    ver = get_caddy_version()
    if ver is None:
        raise RuntimeError("caddy not found in PATH — install via: scoop install caddy")
    if Version(ver.lstrip("v")) < Version(min_version):
        raise RuntimeError(f"caddy {ver} < required {min_version}; run: scoop update caddy")
```

---

## External Links

- [Caddy Download Page](https://caddyserver.com/download)
- [Caddy Docs — Install](https://caddyserver.com/docs/install)
- [Caddy Docs — Keep Caddy Running](https://caddyserver.com/docs/running)
- [Caddy Docs — Command Line](https://caddyserver.com/docs/command-line)
- [Chocolatey: caddy](https://community.chocolatey.org/packages/caddy)
- [NSSM Setup for Caddy on Windows](https://docs.demonwarriortech.com/Documented%20Tutorials/Caddy/Windows/How_to_Setup_NSSM/)
- [Caddy Community: Port 443 in use](https://caddy.community/t/port-443-is-already-in-use/12318)
