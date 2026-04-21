# Devcontainer Patterns — Reference

> Last updated: 2026-04-21

---

## Overview

A `devcontainer.json` file configures a reproducible development environment that runs in a Docker container, used by GitHub Codespaces, VS Code Remote Containers, and DevPod. For wapt Phase 7, the deliverable is `.devcontainer/devcontainer.json` that lets a contributor open the wapt project in GitHub Codespaces and get a working environment: Python 3.12, uv, Caddy, and mkcert — without touching their local machine.

**Key constraint:** Port 443 requires root in Linux containers and is blocked in most Codespaces configurations. The cloud-native wapt pattern uses Caddy on port **8443** for HTTPS. The Windows-first local pattern uses port 443. These are separate operating modes; the devcontainer targets cloud/Linux only.

---

## Version Pins

| Component | Version | Notes |
|-----------|---------|-------|
| Dev Container Spec | current (2026) | `containers.dev` spec |
| Base image | `mcr.microsoft.com/devcontainers/python:1-3.12-bullseye` | Python 3.12 on Debian Bullseye |
| Python feature | `ghcr.io/devcontainers/features/python:1` v1.8.0 | Official devcontainers maintainer |
| uv feature | `ghcr.io/jsburckhardt/devcontainer-features/uv:1` v1.0.0 | Community feature |
| Caddy feature | `ghcr.io/devcontainers-extra/features/caddy:1` v1.0.10 | Community feature |
| Caddy binary | v2.8+ | If using manual apt install instead of feature |
| mkcert binary | v1.4+ | No official devcontainer feature; install via postCreate |
| GitHub Codespaces | 2026 | Port 443 not available without root |

---

## Installation

### Option A — Feature-based (recommended)

Use pre-built devcontainer features for Python and Caddy. Simplest approach, gets automatic patch version updates.

```json
{
  "name": "wapt dev",
  "image": "mcr.microsoft.com/devcontainers/python:1-3.12-bullseye",
  "features": {
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.12"
    },
    "ghcr.io/jsburckhardt/devcontainer-features/uv:1": {},
    "ghcr.io/devcontainers-extra/features/caddy:1": {}
  }
}
```

### Option B — Dockerfile-based (more control)

Use a Dockerfile for deterministic binary versions and mkcert installation in one layer.

```dockerfile
# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/python:1-3.12-bullseye

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> /etc/profile.d/uv.sh

# Install Caddy via apt (Cloudsmith repo)
RUN apt-get update \
    && apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
       | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
       | tee /etc/apt/sources.list.d/caddy-stable.list \
    && chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
    && chmod o+r /etc/apt/sources.list.d/caddy-stable.list \
    && apt-get update \
    && apt-get install -y caddy \
    && apt-get clean

# Install mkcert (no apt package — download binary)
# libnss3-tools required for mkcert to add CA to NSS/Firefox trust store
RUN apt-get install -y libnss3-tools \
    && curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64" \
    && chmod +x mkcert-v*-linux-amd64 \
    && mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert \
    && apt-get clean
```

---

## Best Practices

### Port strategy for Codespaces

Codespaces cannot bind port 443 without elevated privileges and the port is not reliably forwardable from non-root processes. Use this split:

| Environment | HTTPS port | HTTP port | Caddy Admin API |
|-------------|-----------|-----------|-----------------|
| Windows local | 443 | 80 | 2019 |
| Codespaces / devcontainer | **8443** | 8080 | 2019 |

Configure Caddy with global options in the devcontainer Caddyfile:

```caddyfile
{
    https_port 8443
    http_port  8080
    admin      localhost:2019
}

ecc.localhost:8443 {
    root * /workspaces/ecc-browser
    file_server
    tls /root/.local/share/mkcert/ecc.localhost.pem \
        /root/.local/share/mkcert/ecc.localhost-key.pem
}
```

VS Code and Codespaces detect port 8443 as HTTPS and forward it correctly when `"protocol": "https"` is set in `portsAttributes`.

### mkcert in a container

mkcert relies on the OS trust store and NSS (for Firefox/Chrome). In a headless container there is no GUI browser to trust the CA into, but cert files can still be generated and used by Caddy and Playwright:

```bash
# Run once in postCreateCommand or manually after container start
mkcert -install          # installs CA into system store + NSS (requires libnss3-tools)
mkcert ecc.localhost     # generates ecc.localhost.pem + ecc.localhost-key.pem
```

For Playwright tests in Codespaces: set `ignore_https_errors=True` in `browser_context_args`. The mkcert CA is not automatically trusted in Playwright's bundled Chromium sandbox inside a headless container.

### Persisting ~/.wapt across rebuilds

The wapt registry (`~/.wapt/registry.json`) and generated certs (`~/.wapt/<name>/`) live in the home directory. Container rebuilds wipe the home directory by default. Use a named volume to persist:

```json
"mounts": [
    "source=wapt-registry,target=/root/.wapt,type=volume"
]
```

This means `wapt add ecc /workspaces/project` survives `Rebuild Container`. The Caddyfile (`caddy/sites-enabled/`) lives in the workspace and is already persisted via the workspace volume.

### postCreateCommand

Run all one-time setup after container creation. Keep the command in a shell script rather than inline JSON for readability and debuggability:

```json
"postCreateCommand": "bash .devcontainer/setup.sh"
```

```bash
#!/usr/bin/env bash
# .devcontainer/setup.sh
set -e

# Install wapt in editable mode
uv tool install --editable .

# Install mkcert CA and generate cert for ecc.localhost
mkcert -install
mkdir -p ~/.wapt/ecc
mkcert -cert-file ~/.wapt/ecc/cert.pem \
       -key-file  ~/.wapt/ecc/key.pem \
       ecc.localhost

# Install Playwright Chromium for E2E tests
pip install pytest-playwright
playwright install chromium --with-deps

echo "wapt devcontainer setup complete"
```

### containerEnv

Set environment variables that affect all processes in the container:

```json
"containerEnv": {
    "PLAYWRIGHT_BROWSERS_PATH": "/root/.cache/playwright",
    "WAPT_CADDY_HTTPS_PORT": "8443"
}
```

---

## Code Examples

### Example 1 — Complete devcontainer.json (feature-based)

```json
{
  "name": "wapt",
  "image": "mcr.microsoft.com/devcontainers/python:1-3.12-bullseye",

  "features": {
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.12"
    },
    "ghcr.io/jsburckhardt/devcontainer-features/uv:1": {},
    "ghcr.io/devcontainers-extra/features/caddy:1": {}
  },

  "forwardPorts": [8443, 8080, 2019],

  "portsAttributes": {
    "8443": {
      "label": "wapt HTTPS",
      "protocol": "https",
      "onAutoForward": "notify"
    },
    "8080": {
      "label": "wapt HTTP",
      "protocol": "http",
      "onAutoForward": "silent"
    },
    "2019": {
      "label": "Caddy Admin API",
      "onAutoForward": "silent"
    }
  },

  "mounts": [
    "source=wapt-registry,target=/root/.wapt,type=volume"
  ],

  "postCreateCommand": "bash .devcontainer/setup.sh",

  "containerEnv": {
    "PLAYWRIGHT_BROWSERS_PATH": "/root/.cache/playwright"
  },

  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "charliermarsh.ruff"
      ]
    }
  }
}
```

### Example 2 — Complete devcontainer.json (Dockerfile-based, with mkcert persisted)

```json
{
  "name": "wapt (dockerfile)",

  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },

  "forwardPorts": [8443, 8080, 2019],

  "portsAttributes": {
    "8443": {
      "label": "wapt HTTPS",
      "protocol": "https",
      "onAutoForward": "notify"
    },
    "2019": {
      "label": "Caddy Admin API",
      "onAutoForward": "silent"
    }
  },

  "mounts": [
    "source=wapt-registry,target=/root/.wapt,type=volume",
    "source=mkcert-ca,target=/root/.local/share/mkcert,type=volume"
  ],

  "postCreateCommand": "bash .devcontainer/setup.sh",

  "containerEnv": {
    "PLAYWRIGHT_BROWSERS_PATH": "/root/.cache/playwright"
  },

  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "charliermarsh.ruff"
      ]
    }
  }
}
```

---

## Windows-first to Cloud Fallback: What Degrades

| Feature | Windows local | Codespaces devcontainer | Notes |
|---------|--------------|------------------------|-------|
| Port 443 HTTPS | Yes | No — use 8443 | Root required on Linux |
| mkcert CA in browser (green lock) | Yes | Partial — Playwright Chromium does not auto-trust it | Use `ignore_https_errors=True` |
| `wapt doctor` | Full checks | Caddy check works; mkcert check may warn about NSS | Acceptable for CI |
| `wapt deploy --target=ghpages` | Yes | Yes (needs git credentials) | Use `GITHUB_TOKEN` env var |
| `wapt deploy --target=heroku` | Yes | Yes (needs Heroku CLI auth) | Run `heroku login` post-start |
| Rich colored output (`wapt list`) | Yes | Yes | Terminal color codes work in Codespaces terminal |
| JetBrains External Tools | Yes | No — IDE-specific feature | Skip in cloud; local install only |
| Playwright `--headed` mode | Yes | No — headless only inside container | Use `--headed` locally only |

---

## Gotchas

**1. Port 443 in Codespaces.**
Codespaces forwards port 443 but binding it inside the container requires root. When running as `vscode` user (recommended), use port 8443. VS Code auto-detects 8443 as HTTPS when `"protocol": "https"` is set in `portsAttributes`.

**2. mkcert CA not trusted by Playwright Chromium in container.**
`mkcert -install` adds the CA to the system NSS store. Playwright's bundled Chromium uses its own certificate store and does not read from system NSS in headless mode. Always set `ignore_https_errors=True` in `browser_context_args` for Codespaces CI runs. See `references/playwright-python.md` for the fixture.

**3. Named volume created empty on first run.**
If the `wapt-registry` volume does not exist when the container starts, Docker creates it empty — which is correct. `postCreateCommand` runs after volumes are mounted, so `mkcert` cert generation lands in the persisted volume correctly.

**4. uv PATH not sourced in postCreateCommand.**
After installing uv via the community feature, the binary is at `~/.cargo/bin/uv`. `postCreateCommand` may not source `.bashrc`. If `uv` is not found, use the full path: `~/.cargo/bin/uv tool install --editable .` or prefix the setup script with `export PATH="$HOME/.cargo/bin:$PATH"`.

**5. `playwright install --with-deps` requires sudo on non-root user.**
The `--with-deps` flag installs OS-level shared libraries (libglib, libnss, etc.) required by Chromium on Debian. In a container running as root this works automatically. Running as `vscode` user requires either passwordless sudo (available in the devcontainers base image) or pre-installing the deps in the Dockerfile.

**6. Caddy feature may attempt systemd.**
The `ghcr.io/devcontainers-extra/features/caddy:1` feature installs Caddy as a systemd service. Codespaces containers do not run systemd by default. Caddy must be started manually or via `wapt start` after container creation. If systemd is required, use the Dockerfile-based approach and start Caddy explicitly in `postCreateCommand`.

**7. Port visibility defaults to private.**
`forwardPorts` auto-forwards ports on container start with `private` visibility (owner-only). Do not set `"visibility": "public"` on port 2019 — Caddy Admin API has no authentication by default and must never be exposed publicly.

**8. `mkcert -cert-file` path must exist before invocation.**
`mkdir -p ~/.wapt/ecc` must run before `mkcert -cert-file ~/.wapt/ecc/cert.pem`. If the directory does not exist, mkcert exits silently without creating the cert. Always ensure the target directory exists first in `setup.sh`.

---

## External Links

- [Dev Container Spec — JSON reference](https://containers.dev/implementors/json_reference/)
- [Available Dev Container Features](https://containers.dev/features)
- [GitHub Docs — Introduction to dev containers](https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers)
- [Caddy Install — Debian/Ubuntu apt](https://caddyserver.com/docs/install#debian-ubuntu-raspbian)
- [Caddy Global Options — https_port](https://caddyserver.com/docs/caddyfile/options)
- [mkcert on GitHub (FiloSottile/mkcert)](https://github.com/FiloSottile/mkcert)
- [uv devcontainer feature (jsburckhardt)](https://github.com/jsburckhardt/devcontainer-features)
- [Codespaces port visibility discussion](https://github.com/orgs/community/discussions/10394)
- [Codespaces January 2026 Check-in](https://github.com/orgs/community/discussions/184971)
