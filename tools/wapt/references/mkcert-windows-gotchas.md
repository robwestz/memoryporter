# mkcert Windows Gotchas — Reference
> Last updated: 2026-04-21

mkcert is a zero-config tool for generating locally-trusted TLS certificates. It creates a
local Certificate Authority (CA) and installs it into system and browser trust stores.
This reference covers Windows 11 specifics, Firefox NSS, cert rotation, and Python integration.

---

## Version Pins

| Component | Pin | Notes |
|-----------|-----|-------|
| mkcert | **v1.4.4** | Latest stable (FiloSottile/mkcert) |
| mkcert minimum for wapt | v1.4.0 | ECC cert support |
| certutil | bundled with Windows | Required for Windows store; NSS certutil separate |

Check: `mkcert --version`
Releases: https://github.com/FiloSottile/mkcert/releases

---

## Install Methods

### Option A — Scoop (recommended)
```bash
scoop bucket add extras    # mkcert lives in extras bucket
scoop install mkcert
mkcert --version           # verify
```

### Option B — Chocolatey
```powershell
# Run as Administrator
choco install mkcert
mkcert --version
```

### Option C — winget
```powershell
winget install FiloSottile.mkcert
```

### Option D — Manual download
1. Download `mkcert-v1.4.4-windows-amd64.exe` from GitHub releases
2. Rename to `mkcert.exe` and place in `C:\tools\mkcert\`
3. Add to PATH: `setx PATH "%PATH%;C:\tools\mkcert"`
4. Open a new terminal: `mkcert --version`

---

## Trust Store Installation

### Does `mkcert -install` require admin rights?

**Yes, on Windows — admin is required.** The command writes a root CA certificate into:
- Windows Certificate Store (`Cert:\LocalMachine\Root`) via `certutil -addstore`
- NSS databases (Firefox profiles) — discovery does not require admin, but elevation simplifies it

Run in an **elevated PowerShell** or Git Bash launched as Administrator:
```bash
mkcert -install
```

Expected output:
```
Created a new local CA at "C:\Users\robin\AppData\Local\mkcert"
The local CA is now installed in the system trust store!
The local CA is now installed in the Firefox and/or Chrome/Chromium trust store (requires browser restart)!
```

If you see `ERROR: failed to execute` — you are not running as Administrator.

### What gets installed where

| Store | Location | Tool used internally |
|-------|----------|----------------------|
| Windows system store | `Cert:\LocalMachine\Root` | `certutil -addstore` |
| Firefox NSS | `%APPDATA%\Mozilla\Firefox\Profiles\*.default\cert9.db` | NSS `certutil -A` |
| Chrome / Edge | Read Windows system store — no extra step | — |

---

## Generating Certificates

```bash
# Basic: generates ecc.localhost.pem + ecc.localhost-key.pem in current directory
mkcert ecc.localhost

# Multiple SANs:
mkcert ecc.localhost 127.0.0.1 ::1

# Custom output paths:
mkcert -cert-file certs/cert.pem -key-file certs/key.pem ecc.localhost
```

### Where do the files land?

By default, `mkcert <name>` writes two files to the **current working directory**:
- `ecc.localhost.pem` — the certificate (public)
- `ecc.localhost-key.pem` — the private key (keep secret, never commit)

The root CA itself lives at:
```bash
mkcert -CAROOT
# Typical output: C:\Users\robin\AppData\Local\mkcert
```

---

## Browser Trust

### Chrome and Edge (Chromium-based)
- Both read the **Windows system certificate store** directly.
- No `--ignore-certificate-errors` flag needed.
- No extra steps after `mkcert -install`.
- Works out of the box after a browser restart.

### Firefox
- Firefox uses its **own NSS trust store** — it does NOT read the Windows system store.
- `mkcert -install` handles Firefox automatically when Firefox is installed and detectable.
- If Firefox was installed *after* running `mkcert -install`, re-run: `mkcert -install`
- Manual fallback if auto-install fails:
  ```bash
  # NSS certutil (different from Windows certutil)
  # mkcert ships a bundled certutil.exe in the CAROOT directory
  CAROOT=$(mkcert -CAROOT)
  # Find your Firefox profile directory, then:
  certutil -A -n "mkcert $(hostname)" -t "C,," \
    -i "$CAROOT/rootCA.pem" \
    -d "sql:$APPDATA/Mozilla/Firefox/Profiles/<your-profile-id>.default"
  ```
- After install: **fully restart Firefox** (File > Exit, not just close tab).
- Verify: navigate to `https://ecc.localhost` — no certificate warning means success.

### Firefox NSS dependency: certutil
mkcert needs the NSS `certutil` binary to modify Firefox's trust database.
On Windows, mkcert ships a bundled `certutil.exe` alongside the CA root.
If NSS operations fail, check:
```bash
ls "$(mkcert -CAROOT)"   # should contain certutil.exe on Windows
```

---

## Cert Rotation and Expiry

mkcert certificates expire after approximately **825 days** (~2 years, per CA/Browser Forum rules).

### Check expiry date
```bash
# openssl: install via scoop install openssl
openssl x509 -enddate -noout -in ecc.localhost.pem
# Output: notAfter=Apr 21 12:00:00 2028 GMT
```

### Python: check expiry
```python
import subprocess
from datetime import datetime, timezone


def cert_expiry_utc(cert_path: str) -> datetime:
    """Return the certificate's notAfter date as a UTC-aware datetime."""
    result = subprocess.run(
        ["openssl", "x509", "-enddate", "-noout", "-in", cert_path],
        capture_output=True,
        text=True,
        check=True,
    )
    # Output line: "notAfter=Apr 21 12:00:00 2028 GMT"
    date_str = result.stdout.strip().split("=", 1)[1]
    naive = datetime.strptime(date_str, "%b %d %H:%M:%S %Y %Z")
    return naive.replace(tzinfo=timezone.utc)


def days_until_expiry(cert_path: str) -> int:
    expiry = cert_expiry_utc(cert_path)
    return (expiry - datetime.now(timezone.utc)).days
```

### Rotate a certificate
```bash
# Re-run mkcert — issues a new cert signed by the same local CA
mkcert ecc.localhost

# Then reload Caddy to pick up the new cert:
caddy reload --config caddy.json
```

If you rotated the CA itself (`mkcert -uninstall` then `mkcert -install`), all previously
issued certs become invalid and must be regenerated.

---

## Python PATH Detection

```python
import subprocess
import shutil
from pathlib import Path
from typing import Optional


def find_mkcert() -> Optional[Path]:
    """
    Locate mkcert binary on Windows.
    Tries PATH first, then common Scoop and Chocolatey locations.
    """
    # 1. Prefer PATH lookup (covers all install methods)
    found = shutil.which("mkcert")
    if found:
        return Path(found)

    # 2. Scoop default shim location
    scoop_path = Path.home() / "scoop" / "shims" / "mkcert.exe"
    if scoop_path.exists():
        return scoop_path

    # 3. Chocolatey default location
    choco_path = Path("C:/ProgramData/chocolatey/bin/mkcert.exe")
    if choco_path.exists():
        return choco_path

    return None


def assert_mkcert_available() -> Path:
    """Raise RuntimeError with install hint if mkcert is not found."""
    path = find_mkcert()
    if path is None:
        raise RuntimeError(
            "mkcert not found in PATH.\n"
            "Install: scoop install mkcert\n"
            "Then (as Administrator): mkcert -install"
        )
    return path


def generate_cert(domain: str, cert_dir: str = ".") -> tuple[Path, Path]:
    """
    Run mkcert to generate a certificate for the given domain.
    Returns (cert_path, key_path).
    """
    mkcert = assert_mkcert_available()
    subprocess.run(
        [str(mkcert), "-cert-file", f"{cert_dir}/cert.pem",
         "-key-file", f"{cert_dir}/key.pem", domain],
        check=True,
    )
    return Path(f"{cert_dir}/cert.pem"), Path(f"{cert_dir}/key.pem")
```

---

## Windows Gotchas

### Admin rights for `mkcert -install`
Run Git Bash or PowerShell as Administrator. Without admin, the Windows root store write
fails — sometimes silently, sometimes with a cryptic COM error like `Access is denied`.

### Windows Defender false positive
Defender occasionally flags mkcert.exe (Go binary that touches cert stores and network).
- Add exception: Windows Security > Virus & threat protection > Exclusions > Add `mkcert.exe`
- Or via PowerShell (Admin): `Add-MpPreference -ExclusionProcess "mkcert.exe"`

### Firefox not trusted after `mkcert -install`
Common causes:
1. Firefox was closed during install — just restart Firefox fully
2. Firefox installed in non-standard path — mkcert's profile discovery missed it
3. NSS `certutil.exe` missing from CAROOT — re-install mkcert

### Chrome "NET::ERR_CERT_AUTHORITY_INVALID" after install
Most common cause: Windows cert store cache not refreshed.
Fix: restart Chrome completely, or run `gpupdate /force` in PowerShell.

### Key file permissions
`ecc.localhost-key.pem` should be readable only by the owning user.
Caddy on Windows reads it fine with default NTFS permissions.
**Never commit key files to git.** Add to `.gitignore`:
```
*.pem
*-key.pem
```

### CA root directory security
```bash
mkcert -CAROOT
# Typical: C:\Users\robin\AppData\Local\mkcert
```
Never commit `rootCA-key.pem`. Never share it. It signs all your dev certs — if leaked,
anyone can issue trusted certs on your machine.

---

## Best Practices

- Run `mkcert -install` once per machine, as Administrator, before generating any certs.
- Generate certs per-project: `mkcert ecc.localhost` from the project `certs/` directory.
- Check expiry programmatically: warn if `days_until_expiry() < 30`.
- Store cert paths in project config, not hardcoded — different devs may place certs differently.
- Set `TRUST_STORES=system,nss` env var to limit which stores mkcert touches in automation.
- Keep OpenSSL installed (`scoop install openssl`) for cert inspection commands.

---

## External Links

- [mkcert GitHub (FiloSottile/mkcert)](https://github.com/FiloSottile/mkcert)
- [mkcert Browser Integration (NSS) — DeepWiki](https://deepwiki.com/FiloSottile/mkcert/3.4-browser-integration-(nss))
- [DEV: Local HTTPS Development in 2025 (mkcert Guide)](https://dev.to/_d7eb1c1703182e3ce1782/how-to-set-up-a-local-https-development-environment-in-2025-mkcert-guide-1h8c)
- [BrightCoding: Generate Local SSL Certificates](https://www.blog.brightcoding.dev/2025/07/21/generate-local-ssl-certificates-and-save-localhost-a-developer-friendly-guide/)
