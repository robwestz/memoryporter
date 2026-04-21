# Sentry JS SDK — Reference
> Last updated: 2026-04-21

---

## Overview

`sentry_hook.py` injects a Sentry Browser SDK snippet into Caddyfile templates (Jinja2). The snippet is rendered at stamp time and embedded into the HTML `<head>` via Caddy's `templates` middleware. No npm build step — CDN-only for v0.1.0.

As of April 2026, the current major is **@sentry/browser 10.x** (10.49.0+). Version 8.x is still installable but two major versions behind. Use 10.x for new installations; the CDN URL format is identical across 8.x, 9.x, 10.x.

---

## Version Pins

| Component | Version (2026) | Notes |
|-----------|---------------|-------|
| @sentry/browser | **10.49.0** | Latest as of April 2026 |
| CDN host | `browser.sentry-cdn.com` | Official Sentry CDN |
| Bundle format | `bundle.min.js` | Error-only, ~26 KB gzipped |
| Tracing bundle | `bundle.tracing.min.js` | + performance monitoring |
| DSN format | `https://<key>@o<org>.ingest.sentry.io/<project>` | Unchanged since v6 |

CDN URL pattern:
```
https://browser.sentry-cdn.com/{VERSION}/{BUNDLE}.js
```

Available bundles (combine modifiers as needed):
- `bundle.min.js` — errors only
- `bundle.tracing.min.js` — errors + performance
- `bundle.tracing.replay.min.js` — errors + perf + session replay
- `bundle.tracing.replay.feedback.min.js` — all features

For wapt v0.1.0: use `bundle.min.js` — no replay, no tracing overhead.

---

## DSN Format

```
https://abc123def456@o123456.ingest.sentry.io/7890123
        ^^^^^^^^^^^^ ^^^^^^  ^^^^^^^^^^^^^^^^^ ^^^^^^^
        public key   org ID  ingest domain      project ID
```

The DSN is **public-safe** — it is designed to be embedded in client-side JavaScript. It identifies your project but cannot be used to read your data. Rate-limit abuse via `allowUrls` if needed.

---

## Minimal Snippet (Jinja2 template)

```html
{% if sentry_dsn %}
<script
  src="https://browser.sentry-cdn.com/10.49.0/bundle.min.js"
  crossorigin="anonymous"
></script>
<script>
  Sentry.onLoad(function() {
    Sentry.init({
      dsn: "{{ sentry_dsn }}",
      tracesSampleRate: {{ sentry_traces_sample_rate | default(0.1) }},
      environment: "{{ sentry_environment | default('production') }}",
      allowUrls: [/{{ sentry_allow_domain | default('') }}/],
    });
  });
</script>
{% endif %}
```

`Sentry.onLoad` is the correct pattern when loading via CDN `<script>` tag — it guarantees the SDK is initialized before the callback runs.

---

## Caddy `templates` Middleware Integration

Caddy's `templates` directive processes files through Go's `text/template`. Jinja2 (Python-side) and Caddy templates are **separate passes**:
1. `sentry_hook.py` (Python) renders the Jinja2 template → writes a `.caddy` or HTML file with the snippet already inlined
2. Caddy serves the result statically (no Caddy-side templating needed for the snippet itself)

If you want Caddy-side templating (dynamic DSN per request), use the `header` approach instead — inject via `header` directive with a CSP nonce, not by rendering into the body.

### Caddyfile block for template serving
```
:443 {
    root * /var/www/mysite
    templates
    file_server

    header Content-Security-Policy "default-src 'self'; script-src 'self' https://browser.sentry-cdn.com;"
}
```

---

## Code Examples

### Example 1: `sentry_hook.py` — patch Jinja2 template with DSN
```python
from pathlib import Path
import re


SENTRY_CDN_VERSION = "10.49.0"
SENTRY_SNIPPET_TEMPLATE = """\
<script
  src="https://browser.sentry-cdn.com/{version}/bundle.min.js"
  crossorigin="anonymous"
></script>
<script>
  Sentry.onLoad(function() {{
    Sentry.init({{
      dsn: "{dsn}",
      tracesSampleRate: {sample_rate},
      environment: "{environment}",
    }});
  }});
</script>"""


def build_sentry_snippet(
    dsn: str,
    environment: str = "production",
    sample_rate: float = 0.1,
    version: str = SENTRY_CDN_VERSION,
) -> str:
    """
    Render the Sentry init snippet.
    DSN is injected as a literal string — never from untrusted input.
    """
    if not dsn.startswith("https://") or "@" not in dsn:
        raise ValueError(f"Invalid Sentry DSN format: {dsn!r}")

    return SENTRY_SNIPPET_TEMPLATE.format(
        version=version,
        dsn=dsn,
        sample_rate=sample_rate,
        environment=environment,
    )


def inject_sentry_into_template(
    template_path: Path,
    dsn: str,
    inject_marker: str = "</head>",
    environment: str = "production",
    sample_rate: float = 0.1,
) -> bool:
    """
    Patch an HTML/Jinja2 template file to include Sentry snippet
    before </head>. Idempotent — skips if already injected.

    Returns True if file was modified, False if already present.
    """
    content = template_path.read_text(encoding="utf-8")

    if "browser.sentry-cdn.com" in content:
        return False  # Already injected

    snippet = build_sentry_snippet(dsn, environment=environment, sample_rate=sample_rate)
    patched = content.replace(inject_marker, f"{snippet}\n{inject_marker}", 1)

    if patched == content:
        raise RuntimeError(
            f"Inject marker '{inject_marker}' not found in {template_path}. "
            "Cannot inject Sentry snippet."
        )

    template_path.write_text(patched, encoding="utf-8")
    return True


def remove_sentry_from_template(template_path: Path) -> bool:
    """
    Remove a previously injected Sentry snippet.
    Returns True if anything was removed.
    """
    content = template_path.read_text(encoding="utf-8")
    pattern = re.compile(
        r'<script\s[^>]*browser\.sentry-cdn\.com[^>]*>.*?</script>\s*'
        r'<script>\s*Sentry\.onLoad.*?</script>',
        re.DOTALL,
    )
    patched, count = pattern.subn("", content)
    if count == 0:
        return False
    template_path.write_text(patched, encoding="utf-8")
    return True
```

### Example 2: wapt CLI hook — `wapt sentry enable <site> --dsn <dsn>`
```python
import typer
from pathlib import Path


DSN_PATTERN = re.compile(
    r'^https://[a-f0-9]+@o\d+\.ingest(?:\.[a-z]+)?\.sentry\.io/\d+$'
)


def sentry_enable(
    site_name: str,
    dsn: str,
    sites_dir: Path = Path("sites-enabled"),
    environment: str = "production",
    sample_rate: float = typer.Option(0.1, help="tracesSampleRate (0.0 = off, 1.0 = all)"),
) -> None:
    """
    Enable Sentry error tracking for a wapt site.
    Patches the site's HTML template and reloads Caddy.
    """
    if not DSN_PATTERN.match(dsn):
        typer.echo(f"ERROR: Invalid DSN format: {dsn!r}", err=True)
        raise typer.Exit(1)

    template_path = sites_dir / site_name / "index.html"
    if not template_path.exists():
        typer.echo(f"ERROR: Template not found: {template_path}", err=True)
        raise typer.Exit(1)

    modified = inject_sentry_into_template(
        template_path,
        dsn=dsn,
        environment=environment,
        sample_rate=sample_rate,
    )

    if modified:
        typer.echo(f"Sentry snippet injected into {template_path}")
        from wapt.caddy_wrapper import caddy_reload
        caddy_reload()
        typer.echo("Caddy reloaded.")
    else:
        typer.echo("Sentry already enabled for this site. No changes made.")
```

---

## Best Practices

- **Pin the CDN version explicitly.** Do not use `latest` in CDN URLs — it breaks reproducibility and can silently introduce breaking API changes.
- **`tracesSampleRate: 0.0` for dev/staging.** Use `0.0` to disable performance monitoring entirely; `0.1` (10%) is a reasonable production default.
- **`allowUrls` for rate-limit protection.** Restricts which origins Sentry accepts errors from — prevents other sites embedding your DSN from filling your quota.
- **`Sentry.onLoad` over inline init.** Always use `onLoad` when loading via `<script>` tag — avoids race conditions where `Sentry.init` is called before the bundle is parsed.
- **No `sourceMapsUploadToken` in v0.1.0.** Source maps require a build pipeline with `@sentry/webpack-plugin` or `sentry-cli`. Out of scope for CDN-only approach.
- **CSP header always.** Add `script-src 'self' https://browser.sentry-cdn.com;` to your Content-Security-Policy when injecting from this CDN.

---

## Security

| Risk | Mitigation |
|------|-----------|
| DSN in commit | DSN is public-safe (read-only identifier) — committing to wapt.toml is fine |
| DSN abused by third parties | Add `allowUrls: [/yourdomain\.com/]` to restrict accepted origins |
| XSS via Jinja2 injection | DSN must come from wapt.toml config, never from user-supplied HTTP input |
| CDN compromise | Pin exact version in URL; optionally add `integrity` SHA (published in Sentry GitHub releases) |
| CSP violations | Include `https://browser.sentry-cdn.com` in `script-src` directive |

---

## Gotchas

1. **`Sentry.onLoad` vs direct `Sentry.init`** — When using the CDN `<script>` tag, the SDK loads asynchronously. `Sentry.onLoad(fn)` queues the callback until the SDK is ready. Calling `Sentry.init()` outside `onLoad` may fail silently.
2. **`tracesSampleRate: 0.0` is not the same as omitting it** — Be explicit; omitting it has version-dependent behavior.
3. **Caddy `templates` and Jinja2 conflict** — Both use `{{ }}` syntax. Safest approach: render fully with Jinja2 first, write static HTML output, serve with `file_server` (no Caddy `templates` directive needed).
4. **ingest subdomain variants** — DSNs may use `o123456.ingest.us.sentry.io` (US residency) or `o123456.ingest.de.sentry.io` (EU). Always use the DSN exactly as shown in your Sentry project settings.
5. **Integrity hash** — The SRI `integrity` SHA256 for each CDN build is published in Sentry's GitHub release notes. Omitting it is acceptable for v0.1.0; add for production hardening.
6. **Version 8.x vs 10.x** — API is compatible (same `Sentry.init` options). Upgrading is a URL pin change only.

---

## External Links

- [Sentry JavaScript Releases (GitHub)](https://github.com/getsentry/sentry-javascript/releases)
- [Sentry Browser SDK Docs](https://docs.sentry.io/platforms/javascript/)
- [Sentry CDN Loader Script](https://docs.sentry.io/platforms/javascript/install/loader/)
- [Sentry CDN Bundle Options](https://docs.sentry.io/platforms/javascript/install/cdn/)
- [@sentry/browser on npm](https://www.npmjs.com/package/@sentry/browser)
- [Caddy templates directive](https://caddyserver.com/docs/caddyfile/directives/templates)
