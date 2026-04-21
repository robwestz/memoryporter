# Jinja2 Caddyfile Templating — Reference
> Last updated: 2026-04-21

## Version Pins

```toml
# pyproject.toml (verified April 2026)
jinja2 = ">=3.1.6"       # latest: 2025-03-05; security fix for |attr filter sandbox bypass
markupsafe = ">=2.1.5"   # transitive dep of jinja2; provides Markup + escape()

# Python requirement
python = ">=3.12"
```

> Jinja2 3.1.6 fixes a sandbox escape via the `|attr` filter. Always use
> the latest patch release.

---

## Best Practices

### `Environment` setup for config-file templating (not HTML)

```python
# wapt/renderer.py
from jinja2 import Environment, FileSystemLoader, StrictUndefined
from pathlib import Path

def make_env(template_dir: Path) -> Environment:
    """Create a Jinja2 Environment tuned for Caddyfile generation."""
    return Environment(
        loader=FileSystemLoader(str(template_dir)),
        autoescape=False,       # Caddyfiles are NOT HTML — no HTML escaping
        trim_blocks=True,       # strip newline after block tags {% ... %}
        lstrip_blocks=True,     # strip leading spaces before block tags
        keep_trailing_newline=True,  # preserve final newline in output file
        undefined=StrictUndefined,   # raise on any missing variable (fail loud)
    )
```

> `autoescape=False` is correct for Caddyfiles. Never use `select_autoescape()`
> here — that is for HTML. But still sanitize user-supplied path values
> (see Security section below).

### Why sanitize even with `autoescape=False`?

HTML autoescaping turns `<script>` into `&lt;script&gt;`. It does nothing for
Caddyfile syntax. A user-controlled domain like `evil.local\n{ import /etc/passwd }`
would inject a new Caddy block. The `|e` Jinja2 filter performs HTML escaping —
useful for HTML output but wrong for Caddyfiles. Instead, use a custom
`sanitize_domain` / `sanitize_path` filter that strips characters meaningless
in a hostname or path but dangerous in Caddyfile syntax (`{`, `}`, `;`, newlines).

### `FileSystemLoader` vs `PackageLoader` — which for wapt?

| Loader | When to use |
|--------|-------------|
| `FileSystemLoader(path)` | Development, editable installs, user-overridable templates |
| `PackageLoader("wapt", "templates")` | Templates bundled inside the `wapt` package |

**Recommendation for wapt**: Use `PackageLoader` for built-in templates shipped
with the package, and a `ChoiceLoader` to allow user overrides from
`~/.wapt/templates/` (checked first).

```python
from jinja2 import ChoiceLoader, FileSystemLoader, PackageLoader, Environment, StrictUndefined
from pathlib import Path

def make_env(user_template_dir: Path | None = None) -> Environment:
    loaders = []
    if user_template_dir and user_template_dir.exists():
        loaders.append(FileSystemLoader(str(user_template_dir)))
    loaders.append(PackageLoader("wapt", "templates"))

    return Environment(
        loader=ChoiceLoader(loaders),
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
        keep_trailing_newline=True,
        undefined=StrictUndefined,
    )
```

### Template inheritance for site variants

```
wapt/templates/
├── base.caddyfile.j2          <- global options + common structure
├── site_reverse_proxy.j2      <- extends base: standard reverse proxy
├── site_static.j2             <- extends base: static file server
└── site_fastcgi.j2            <- extends base: PHP/FastCGI backend
```

`base.caddyfile.j2`:
```
{%- block global_options %}
{
    local_certs
    auto_https off
}
{% endblock -%}

{% block sites %}{% endblock %}
```

`site_reverse_proxy.j2`:
```
{% extends "base.caddyfile.j2" %}

{% block sites %}
{{ domain | sanitize_domain }}:{{ port }} {
    tls internal
    reverse_proxy {{ backend_host | sanitize_path }}:{{ backend_port }}

    log {
        output file {{ log_dir | to_posix }}/{{ domain | sanitize_domain }}.log
    }
}
{% endblock %}
```

### Whitespace control — `{%- -%}` and `trim_blocks`

```
# trim_blocks=True  -> removes the newline immediately after a block tag
# lstrip_blocks=True -> removes leading whitespace before a block tag
# {%- ... -%}       -> strips whitespace/newlines on both sides of the tag

# With trim_blocks=True + lstrip_blocks=True — clean Caddyfile output
{% for site in sites %}
{{ site.domain | sanitize_domain }} {
    reverse_proxy localhost:{{ site.port }}
}
{% endfor %}

# Aggressive strip with {%- -%} for inline use
{%- if site.tls -%}
    tls internal
{%- endif -%}
```

### Forward slashes in Windows paths — `Path.as_posix()`

Caddy expects forward slashes in all paths, including on Windows.
Always convert Windows paths before passing to templates.

```python
from pathlib import Path
from jinja2 import Environment

def register_filters(env: Environment) -> None:
    def to_posix(value: str) -> str:
        """Convert any path string to POSIX forward-slash form."""
        return Path(value).expanduser().resolve().as_posix()

    env.filters["to_posix"] = to_posix
```

Usage in template:
```
log {
    output file {{ log_dir | to_posix }}/access.log
}
```

### Security — custom sanitize filters (injection risk)

```python
import re
from jinja2 import Environment

def register_security_filters(env: Environment) -> None:
    def sanitize_domain(value: str) -> str:
        """Allow only valid hostname characters. Strips everything else."""
        cleaned = re.sub(r"[^a-zA-Z0-9.\-]", "", str(value))
        if not cleaned:
            raise ValueError(f"Domain sanitized to empty string from: {value!r}")
        return cleaned.lower()

    def sanitize_path(value: str) -> str:
        """Allow alphanumeric, dot, hyphen, underscore, slash, colon, tilde."""
        cleaned = re.sub(r"[^a-zA-Z0-9.\-_/:~]", "", str(value))
        if ".." in cleaned:
            raise ValueError(f"Path traversal detected in: {value!r}")
        return cleaned

    env.filters["sanitize_domain"] = sanitize_domain
    env.filters["sanitize_path"] = sanitize_path
```

---

## Python 3.12 Examples

### Complete renderer — render a Caddyfile from template + context dict

```python
# wapt/renderer.py
import re
from pathlib import Path
from jinja2 import (
    ChoiceLoader,
    Environment,
    FileSystemLoader,
    PackageLoader,
    StrictUndefined,
    TemplateNotFound,
    UndefinedError,
)
import typer


def build_environment(user_template_dir: Path | None = None) -> Environment:
    loaders: list = []
    if user_template_dir and user_template_dir.exists():
        loaders.append(FileSystemLoader(str(user_template_dir)))
    loaders.append(PackageLoader("wapt", "templates"))

    env = Environment(
        loader=ChoiceLoader(loaders),
        autoescape=False,        # noqa: S701 — Caddyfile, not HTML
        trim_blocks=True,
        lstrip_blocks=True,
        keep_trailing_newline=True,
        undefined=StrictUndefined,
    )
    _register_filters(env)
    return env


def _register_filters(env: Environment) -> None:
    def to_posix(value: str) -> str:
        return Path(value).expanduser().resolve().as_posix()

    def sanitize_domain(value: str) -> str:
        cleaned = re.sub(r"[^a-zA-Z0-9.\-]", "", str(value))
        if not cleaned:
            raise ValueError(f"Domain sanitized to empty: {value!r}")
        return cleaned.lower()

    def sanitize_path(value: str) -> str:
        cleaned = re.sub(r"[^a-zA-Z0-9.\-_/:~]", "", str(value))
        if ".." in cleaned:
            raise ValueError(f"Path traversal in: {value!r}")
        return cleaned

    env.filters["to_posix"] = to_posix
    env.filters["sanitize_domain"] = sanitize_domain
    env.filters["sanitize_path"] = sanitize_path


def render_caddyfile(
    context: dict,
    template_name: str = "site_reverse_proxy.j2",
    user_template_dir: Path | None = None,
) -> str:
    """Render a Caddyfile template with the given context dict.

    Args:
        context: Template variables. Example:
            {
                "domain": "myapp.local",
                "port": 443,
                "backend_host": "127.0.0.1",
                "backend_port": 3000,
                "log_dir": "~/.wapt/logs",
            }
        template_name: File name inside wapt/templates/.
        user_template_dir: Optional user override directory.

    Returns:
        Rendered Caddyfile as a string (LF line endings).
    """
    env = build_environment(user_template_dir)
    try:
        template = env.get_template(template_name)
        return template.render(**context)
    except TemplateNotFound:
        typer.echo(f"ERROR: Template not found: {template_name}", err=True)
        raise typer.Exit(code=1)
    except UndefinedError as e:
        typer.echo(f"ERROR: Template variable missing: {e}", err=True)
        raise typer.Exit(code=1)


def write_caddyfile(
    context: dict,
    output_path: Path,
    template_name: str = "site_reverse_proxy.j2",
) -> None:
    """Render and write a Caddyfile. Creates parent dirs as needed."""
    content = render_caddyfile(context, template_name)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    # newline="\n" forces LF on Windows — Caddy accepts LF everywhere
    output_path.write_text(content, encoding="utf-8", newline="\n")
```

### Snapshot testing — `assert rendered == expected_string`

```python
# tests/test_renderer.py
import textwrap
from wapt.renderer import render_caddyfile

def test_reverse_proxy_renders_correctly():
    context = {
        "domain": "myapp.local",
        "port": 443,
        "backend_host": "127.0.0.1",
        "backend_port": 3000,
        "log_dir": "/home/user/.wapt/logs",
    }
    rendered = render_caddyfile(context, template_name="site_reverse_proxy.j2")

    expected = textwrap.dedent("""\
        myapp.local:443 {
            tls internal
            reverse_proxy 127.0.0.1:3000

            log {
                output file /home/user/.wapt/logs/myapp.local.log
            }
        }
    """)
    assert rendered == expected


def test_windows_path_no_backslashes(tmp_path):
    """Paths passed to templates must have forward slashes in output."""
    context = {
        "domain": "myapp.local",
        "port": 443,
        "backend_host": "127.0.0.1",
        "backend_port": 3000,
        "log_dir": str(tmp_path),  # may contain backslashes on Windows
    }
    rendered = render_caddyfile(context, template_name="site_reverse_proxy.j2")
    assert "\\" not in rendered, "Backslashes must not appear in Caddyfile output"


def test_injection_stripped():
    """Sanitize filter must strip Caddyfile-breaking characters."""
    from wapt.renderer import build_environment
    env = build_environment()
    t = env.from_string("{{ value | sanitize_domain }}")
    result = t.render(value="evil{inject;this}")
    assert "{" not in result
    assert "}" not in result
    assert ";" not in result


def test_missing_variable_raises():
    """StrictUndefined must raise when a template variable is missing."""
    import pytest
    from jinja2 import UndefinedError
    from wapt.renderer import build_environment
    env = build_environment()
    t = env.from_string("{{ missing_var }}")
    with pytest.raises(UndefinedError):
        t.render()
```

---

## Windows Gotchas

- **Always use `Path.as_posix()`** before passing any filesystem path to a
  Caddyfile template. Caddy on Windows still requires forward slashes.
- **`newline="\n"` when writing**: Python's default `open()` on Windows
  translates `\n` to `\r\n`. Force LF with `write_text(..., newline="\n")` to
  avoid double-CR issues in Caddy config parsing.
- **`PackageLoader` and `uv tool install`**: Confirm `[tool.setuptools.package-data]`
  or `[tool.hatch.build.targets.wheel.include]` includes `"wapt/templates/*.j2"`.
  Without this, `PackageLoader` will raise `TemplateNotFound` in installed mode.
- **`StrictUndefined` in production**: Required. A missing variable silently
  renders as an empty string in the default `Undefined` mode, producing a valid
  but broken Caddyfile (e.g., `reverse_proxy :3000` with no host).
- **`autoescape=False` Ruff warning (S701)**: Add `# noqa: S701` on the
  `Environment(...)` line, or add to `pyproject.toml`:
  ```toml
  [tool.ruff.lint.per-file-ignores]
  "wapt/renderer.py" = ["S701"]
  ```

---

## External Links

- [Jinja2 docs](https://jinja.palletsprojects.com/)
- [Jinja2 on PyPI](https://pypi.org/project/Jinja2/)
- [Jinja2 API — Environment](https://jinja.palletsprojects.com/en/stable/api/#jinja2.Environment)
- [Jinja2 — whitespace control](https://jinja.palletsprojects.com/en/stable/templates/#whitespace-control)
- [Ruff S701 — jinja2-autoescape-false](https://docs.astral.sh/ruff/rules/jinja2-autoescape-false/)
- [Caddy docs — Caddyfile concepts](https://caddyserver.com/docs/caddyfile/concepts)
