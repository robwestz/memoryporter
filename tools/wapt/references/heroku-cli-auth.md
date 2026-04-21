# Heroku CLI Auth — Reference
> Last updated: 2026-04-21

---

## Overview

Heroku CLI authenticates via OAuth tokens stored in `~/.netrc` (Unix) or `~/_netrc` (Windows). The `HEROKU_API_KEY` environment variable overrides the netrc file at runtime. For CI/CD and programmatic wrappers, the env var approach is always preferred — it keeps tokens out of the filesystem and out of commits.

`target_heroku.py` wraps three operations: create app, attach remote, deploy via git push. All three require a valid token in the environment before subprocess calls are made.

---

## Auth Flow on Windows

### Interactive login (one-time setup)
```
heroku login
```
Opens browser. On completion, writes token to `%USERPROFILE%\_netrc` (Windows) or `~/.netrc` (Unix/Git Bash).

### Token file location on Windows
- Git Bash path: `~/_netrc` (maps to `C:\Users\<user>\_netrc`)
- `_netrc` (underscore prefix) is the Windows convention; cURL on Windows reads `_netrc`, not `.netrc`

### Retrieve token programmatically
```bash
heroku auth:token
```
Outputs the raw OAuth token string to stdout. No trailing newline issues — safe to capture via `subprocess.check_output`.

### PATH on Windows
After Heroku CLI installer runs, the binary lands at:
```
C:\Program Files\heroku\bin\heroku.cmd
```
The `.cmd` wrapper is what goes on PATH. When calling from Python subprocess on Windows:
- `heroku` works in Git Bash (resolves via PATH)
- In `subprocess.run`, use `shell=True` on Windows, or resolve `heroku.cmd` explicitly
- Prefer `shutil.which("heroku")` to locate the binary before first use

---

## Version Pins

| Component | Version (2026) |
|-----------|---------------|
| Heroku CLI | 9.x (npm-based, oclif framework) |
| Auth method | OAuth 2.0 bearer tokens |
| netrc format | Standard RFC 4732 machine/login/password |
| API base | `https://api.heroku.com` |

---

## Code Examples

### Example 1: Token retrieval and environment injection
```python
import subprocess
import shutil
import os


def get_heroku_token() -> str:
    """
    Retrieve Heroku auth token via CLI.
    Falls back to HEROKU_API_KEY env var.
    Raises RuntimeError on auth failure.
    """
    # Prefer explicit env var (CI/CD path)
    if token := os.environ.get("HEROKU_API_KEY"):
        return token.strip()

    heroku_bin = shutil.which("heroku")
    if not heroku_bin:
        raise RuntimeError(
            "heroku CLI not found on PATH. "
            "Install from https://devcenter.heroku.com/articles/heroku-cli"
        )

    try:
        result = subprocess.run(
            [heroku_bin, "auth:token"],
            capture_output=True,
            text=True,
            check=True,
            timeout=10,
        )
        token = result.stdout.strip()
        if not token:
            raise RuntimeError(
                "heroku auth:token returned empty. Run `heroku login` first."
            )
        return token
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.strip()
        if "not logged in" in stderr.lower() or "401" in stderr:
            raise RuntimeError(
                "Heroku auth expired. Run `heroku login` to refresh."
            ) from exc
        raise RuntimeError(f"heroku auth:token failed: {stderr}") from exc


def heroku_env(token: str) -> dict:
    """Return env dict with HEROKU_API_KEY injected (no shell leak)."""
    env = os.environ.copy()
    env["HEROKU_API_KEY"] = token
    env["HEROKU_DISABLE_COLORS"] = "1"  # Suppress interactive prompts
    return env
```

### Example 2: Create app, attach remote, deploy
```python
import subprocess
import shutil
import json
import time
from typing import Optional


def heroku_deploy(
    app_name: str,
    local_branch: str = "main",
    region: str = "eu",
    token: Optional[str] = None,
) -> dict:
    """
    Full Heroku deploy pipeline:
    1. Create app (idempotent — skip if exists)
    2. Attach heroku git remote
    3. Push to heroku

    Returns dict with app_name, url, status.
    Raises RuntimeError on unrecoverable errors.
    """
    if token is None:
        token = get_heroku_token()

    heroku_bin = shutil.which("heroku")
    if not heroku_bin:
        raise RuntimeError("heroku not found on PATH")

    env = heroku_env(token)

    # --- Step 1: Create app ---
    try:
        subprocess.run(
            [heroku_bin, "apps:create", app_name, "--region", region, "--json"],
            capture_output=True,
            text=True,
            env=env,
            timeout=30,
            check=True,
        )
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.strip()
        if "Name is already taken" in stderr or "422" in stderr:
            pass  # App exists — idempotent, continue
        elif "401" in stderr or "Invalid credentials" in stderr:
            raise RuntimeError(
                "Heroku 401: token expired. Re-run `heroku login`."
            ) from exc
        elif "rate limit" in stderr.lower() or "429" in stderr:
            raise RuntimeError(
                "Heroku rate limit hit. Retry after 60s."
            ) from exc
        else:
            raise RuntimeError(f"heroku apps:create failed: {stderr}") from exc

    # --- Step 2: Attach remote ---
    subprocess.run(
        [heroku_bin, "git:remote", "-a", app_name],
        capture_output=True,
        text=True,
        env=env,
        check=True,
        timeout=15,
    )

    # --- Step 3: Git push deploy ---
    try:
        subprocess.run(
            ["git", "push", "heroku", f"{local_branch}:main", "--force"],
            capture_output=False,  # Stream output — shows buildpack logs
            env=env,
            check=True,
            timeout=300,
        )
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(
            f"git push heroku failed. Check build logs: "
            f"`heroku logs --tail -a {app_name}`"
        ) from exc

    # --- Step 4: Verify ---
    info_result = subprocess.run(
        [heroku_bin, "apps:info", "-a", app_name, "--json"],
        capture_output=True,
        text=True,
        env=env,
        check=True,
        timeout=15,
    )

    return {
        "app_name": app_name,
        "url": f"https://{app_name}.herokuapp.com",
        "status": "deployed",
        "raw": info_result.stdout,
    }


def heroku_ps_check(app_name: str, token: str) -> bool:
    """Return True if at least one dyno is in state 'up'."""
    heroku_bin = shutil.which("heroku")
    result = subprocess.run(
        [heroku_bin, "ps", "-a", app_name, "--json"],
        capture_output=True,
        text=True,
        env=heroku_env(token),
        timeout=15,
    )
    if result.returncode != 0:
        return False
    dynos = json.loads(result.stdout or "[]")
    return any(d.get("state") == "up" for d in dynos)
```

---

## Best Practices

- **Never log the token.** Pass it only via `env=` dict to subprocess — never as a CLI argument or in a log line.
- **Use `HEROKU_API_KEY` env var in CI.** Set it as a secret in GitHub Actions/GitLab CI. Never read from netrc in automated pipelines.
- **`--json` flag on every status command.** `heroku apps:info --json`, `heroku ps --json` — machine-parseable and stable across CLI versions.
- **`heroku authorizations:create`** for long-lived CI tokens (scoped, don't expire on interactive logout).
- **Region selection.** `--region eu` vs `--region us` — set once at app create, cannot change without destroy-and-recreate.
- **App name collisions.** Heroku app names are globally unique. Append a UUID suffix (`myapp-a3f2`) to avoid 422 errors.

---

## Security

| Risk | Mitigation |
|------|-----------|
| Token in commit | Never store in `.env` committed to git; use `.gitignore` + env var injection |
| Token in subprocess args | Always pass via `env=` dict; never as `--api-key=TOKEN` (visible in `ps aux`) |
| Token in logs | Redact: `token[:4] + "****" + token[-4:]` |
| `_netrc` readable by other users | Restrict with `icacls %USERPROFILE%\_netrc /inheritance:r /grant:r "%USERNAME%:(R)"` on multi-user machines |
| git remote contains credentials | `heroku git:remote` uses app name only, not token — safe |

```python
def redact_token(token: str) -> str:
    """Safe token repr for logging."""
    if len(token) <= 10:
        return "***"
    return token[:4] + "****" + token[-4:]
```

---

## Gotchas

1. **Windows: `.netrc` vs `_netrc`** — Git Bash surfaces `~/.netrc` but cURL on Windows reads `~/_netrc`. Both may coexist. Don't parse netrc manually — use `heroku auth:token` or `HEROKU_API_KEY`.
2. **`heroku.cmd` in subprocess** — On Windows, calling `heroku` in `subprocess.run` without `shell=True` may fail. `shutil.which("heroku")` resolves the `.cmd` wrapper correctly and is cross-platform.
3. **`git push heroku` requires a Heroku remote** — `heroku git:remote -a <name>` must run before the push. Already-present remote prints a warning but does not fail.
4. **Heroku only deploys `main` or `master`** — Use `local_branch:main` refspec to handle repos with non-standard branch names.
5. **Build logs are on stderr** — `git push` streams buildpack logs to stderr in real time. Set `capture_output=False` to keep them visible to the user.
6. **`heroku ps` dyno state lag** — After deploy, dynos take 5–30s to reach `"up"`. Poll with backoff; don't check immediately after push.
7. **422 "Name is already taken"** — Global namespace. Treat as idempotent in automation; surface to user only if the existing app belongs to a different account.

---

## External Links

- [Heroku CLI Documentation](https://devcenter.heroku.com/articles/heroku-cli)
- [Heroku Authentication](https://devcenter.heroku.com/articles/authentication)
- [Deploying with Git](https://devcenter.heroku.com/articles/git)
- [Platform API Reference](https://devcenter.heroku.com/articles/platform-api-reference)
- [heroku authorizations:create](https://devcenter.heroku.com/articles/heroku-cli-commands#heroku-authorizations-create)
- [Heroku CLI source (GitHub)](https://github.com/heroku/cli)
