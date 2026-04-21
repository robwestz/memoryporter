# Playwright Python — Reference

> Last updated: 2026-04-21

---

## Overview

Playwright Python is the official Python binding for Playwright browser automation. As of 2026 the current release is **1.59**. The recommended testing entry point is `pytest-playwright`, which provides sync fixtures out of the box. For wapt Phase 7, Playwright tests run against `https://ecc.localhost` (mkcert cert, trusted locally) and verify five browser API classes: fetch/HTTPS, Service Workers, localStorage, ES modules, and Clipboard.

**Key decision:** use `pytest-playwright` (sync) rather than raw `async_playwright`. The pytest plugin's sync fixtures are simpler, better supported, and sufficient for all wapt E2E scenarios. Async is only needed when tests themselves call async application code — which wapt tests do not.

---

## Version Pins

| Package | Minimum | Recommended | Notes |
|---------|---------|-------------|-------|
| `playwright` | 1.44 | **1.59** | Latest as of 2026-04-21 |
| `pytest-playwright` | 0.5.0 | **latest** | Bundles with playwright PyPI |
| `pytest` | 7.0 | 8.x | |
| `pytest-asyncio` | 0.26.0 | latest | Only if using async fixtures |
| Python | 3.9 | **3.12** | 3.8 dropped in Playwright 1.49 |

---

## Installation

```bash
# Install Playwright and pytest plugin
pip install pytest-playwright

# Install only Chromium (sufficient for wapt E2E — ~300 MB vs ~650 MB for all)
playwright install chromium

# Windows: override browser download location (optional)
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
playwright install chromium
```

On Windows, the default browser storage path is `%USERPROFILE%\AppData\Local\ms-playwright`. Setting `PLAYWRIGHT_BROWSERS_PATH` redirects this — useful on machines with small C: drives or in CI where you want repeatable paths.

Setting `PLAYWRIGHT_BROWSERS_PATH=0` (zero) installs browsers into the local project directory instead of the global path.

---

## Best Practices

### Sync vs Async

Use `pytest-playwright` sync fixtures for all wapt tests. The sync API is:
- Supported directly by `pytest-playwright` without extra packages
- Simpler to read and debug
- Sufficient for all DOM, evaluate, and network operations

Only add `pytest-playwright-asyncio` + `pytest-asyncio>=0.26.0` if a test awaits application-level async code. If you do enable async, add to `pyproject.toml`:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
asyncio_default_test_loop_scope = "session"
```

### mkcert certificate trust

**Preferred approach for local dev:** install mkcert's CA into the OS trust store (`mkcert -install`) and also set `ignore_https_errors=True` in Playwright's context. This is belt-and-suspenders: the browser itself trusts the cert (green lock), and Playwright's internal TLS stack also skips verification.

For CI/headless environments where `mkcert -install` is not practical, `ignore_https_errors=True` alone is sufficient.

**Do not** use `ignore_https_errors` in tests that verify TLS behaviour — it masks errors you want to catch.

### Screenshots on failure

Use `pytest-playwright`'s built-in `--screenshot on-failure` flag. No custom fixture needed. PNG files are saved automatically into `test-results/`.

### Headless vs headed

- **Headless** (default): for CI and `pytest tests/e2e -v`
- **Headed** (`--headed` or `HEADED=1` env var): for local debugging on Windows
- **Slow-motion** (`--slowmo 500`): 500 ms between actions, useful for visual step-through

Playwright ships a separate `chromium-headless-shell` binary for headless mode. Some Web APIs (Clipboard, certain SW events) behave differently between headless shell and the full headed browser. For wapt's browser API tests, verify locally in headed mode before trusting headless CI results.

---

## Code Examples

### Example 1 — conftest.py for wapt E2E suite

```python
# tests/e2e/conftest.py
import os
import pytest

BASE_URL = "https://ecc.localhost"


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """
    Session-scoped context defaults for all E2E tests:
    - ignore_https_errors: accept mkcert self-signed cert
    - service_workers: allow (required for SW registration tests)
    - base_url: lets tests use page.goto("/") instead of full URL
    """
    return {
        **browser_context_args,
        "ignore_https_errors": True,
        "service_workers": "allow",
        "base_url": BASE_URL,
    }


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    """Headless in CI; headed when HEADED=1 env var is set."""
    headed = os.environ.get("HEADED", "0") == "1"
    return {
        **browser_type_launch_args,
        "headless": not headed,
    }
```

### Example 2 — E2E tests for the five wapt ECC browser APIs

```python
# tests/e2e/test_ecc_apis.py
"""
E2E tests for https://ecc.localhost
Verifies the five crippled-on-HTTP browser APIs work under HTTPS + mkcert.

Run:
    pytest tests/e2e -v --screenshot on-failure
    HEADED=1 pytest tests/e2e -v --headed --slowmo 300
"""
from playwright.sync_api import Page


def test_https_fetch_returns_200(page: Page):
    """Caddy is serving, mkcert cert is trusted, basic navigation works."""
    response = page.goto("/")
    assert response is not None
    assert response.status == 200


def test_service_worker_registration(page: Page):
    """Service Worker can be registered and activated under HTTPS."""
    page.goto("/")

    result = page.evaluate("""async () => {
        const reg = await navigator.serviceWorker.register('/sw.js');

        // If already active, return immediately
        if (reg.active && reg.active.state === 'activated') {
            return 'activated';
        }

        // Otherwise wait for activation
        return new Promise((resolve) => {
            const worker = reg.installing || reg.waiting;
            if (!worker) { resolve('unknown'); return; }
            worker.addEventListener('statechange', (e) => {
                if (e.target.state === 'activated') resolve('activated');
            });
        });
    }""")

    assert result == "activated", f"Unexpected SW state: {result!r}"


def test_localstorage_persists_across_reload(page: Page):
    """localStorage survives page.reload() — requires HTTPS in strict browsers."""
    page.goto("/")

    page.evaluate("localStorage.setItem('wapt_e2e_key', 'hello-from-pytest')")
    page.reload()

    value = page.evaluate("localStorage.getItem('wapt_e2e_key')")
    assert value == "hello-from-pytest", (
        f"localStorage value lost after reload: {value!r}"
    )

    # Cleanup so tests are idempotent
    page.evaluate("localStorage.removeItem('wapt_e2e_key')")


def test_es_module_dynamic_import(page: Page):
    """Dynamic import() resolves under HTTPS (blocked by some browsers on HTTP)."""
    page.goto("/")

    result = page.evaluate("""async () => {
        try {
            const mod = await import('/module.js');
            return { ok: true, value: mod.default ?? '__no_default__' };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }""")

    assert result["ok"], f"ES module import failed: {result.get('error')}"


def test_clipboard_api_requires_https(page: Page):
    """Clipboard API is HTTPS-only. Grant permissions, write, then read back."""
    page.goto("/")

    # Chromium requires explicit permission grant in automated contexts
    page.context.grant_permissions(["clipboard-read", "clipboard-write"])

    result = page.evaluate("""async () => {
        try {
            await navigator.clipboard.writeText('wapt_clip_test');
            return await navigator.clipboard.readText();
        } catch (e) {
            return `ERROR: ${e.message}`;
        }
    }""")

    assert result == "wapt_clip_test", f"Clipboard API failed: {result!r}"
```

---

## Running Tests

```bash
# Standard headless run
pytest tests/e2e -v --screenshot on-failure

# Headed (for debugging on Windows)
pytest tests/e2e -v --headed --screenshot on-failure

# Slow-motion — 500 ms between actions
pytest tests/e2e -v --headed --slowmo 500

# Full-page screenshots on failure
pytest tests/e2e -v --screenshot on-failure --full-page-screenshot

# Target Chromium explicitly (default for wapt)
pytest tests/e2e --browser chromium

# Run one specific test
pytest tests/e2e/test_ecc_apis.py::test_service_worker_registration -v
```

---

## Gotchas

**1. Sync API inside asyncio loop.**
`"It looks like you are using Playwright Sync API inside the asyncio loop"` means a sync fixture was called from an `async def` test. Fix: keep wapt E2E tests as `def`, not `async def`.

**2. mkcert CA not installed.**
`ignore_https_errors=True` suppresses Playwright's TLS check but does not make Caddy start serving. If the site is down, the test fails with a connection error, not a TLS error. Verify with `curl -k https://ecc.localhost` before running the suite.

**3. Clipboard permissions in headless Chromium.**
`navigator.clipboard` throws `NotAllowedError` without `grant_permissions(["clipboard-read", "clipboard-write"])`. This call must happen on the `page.context` object, not the page itself.

**4. Service Worker scope.**
`/sw.js` served from the domain root has global scope. Serving from `/static/sw.js` restricts scope to `/static/`. In the wapt ECC fixture, ensure `sw.js` is at the Caddy site root.

**5. SW tests only supported on Chromium.**
Playwright's Service Worker interception (`context.expect_event("serviceworker")`) is Chromium-only. Firefox and WebKit do not expose the SW lifecycle events through Playwright.

**6. Python 3.8 dropped in Playwright 1.49.**
wapt targets Python 3.12 — no issue. But CI image selections (GitHub Actions `python-version`) must specify `3.9` at minimum.

**7. `devtools` option removed (v1.46).**
`browser_type.launch(devtools=True)` was removed. Replacement: `args=["--auto-open-devtools-for-tabs"]` in `browser_type_launch_args`.

---

## External Links

- [Playwright Python — Installation](https://playwright.dev/python/docs/intro)
- [Playwright Python — pytest plugin (Test Runners)](https://playwright.dev/python/docs/test-runners)
- [Playwright Python — Service Workers](https://playwright.dev/python/docs/service-workers)
- [Playwright Python — Browsers & paths](https://playwright.dev/python/docs/browsers)
- [Playwright Python — Release Notes](https://playwright.dev/python/docs/release-notes)
- [pytest-playwright on PyPI](https://pypi.org/project/pytest-playwright/)
- [BrowserStack — localStorage with Playwright](https://www.browserstack.com/guide/playwright-local-storage)
