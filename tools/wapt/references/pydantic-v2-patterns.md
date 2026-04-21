# Pydantic v2 Patterns — Reference
> Last updated: 2026-04-21

## Version Pins

```toml
# pyproject.toml (verified April 2026)
pydantic = ">=2.13.3"   # latest: 2026-04-20; pydantic-core 2.33.x, jiter 0.14.0
# pydantic-core is a transitive dep — do NOT pin it separately

# stdlib (no extra install needed)
# tomllib — Python 3.11+ stdlib; use tomllib for .toml config files

# Python requirement
python = ">=3.12"
```

### v1 → v2 breaking changes (quick reference)

| v1 | v2 |
|----|-----|
| `validator()` | `field_validator()` |
| `root_validator()` | `model_validator()` |
| `class Config:` | `model_config = ConfigDict(...)` |
| `.dict()` | `.model_dump()` |
| `.json()` | `.model_dump_json()` |
| `.parse_obj()` | `.model_validate()` |
| `schema()` | `.model_json_schema()` |
| `orm_mode = True` | `from_attributes = True` |
| `__fields__` | `model_fields` |

---

## Best Practices

### `BaseModel` with `ConfigDict`

```python
from pydantic import BaseModel, ConfigDict

class WaptSiteConfig(BaseModel):
    model_config = ConfigDict(
        strict=False,        # coerce compatible types (str→int allowed)
        extra="forbid",      # reject unknown keys in wapt.toml
        frozen=False,        # allow mutation after construction
        validate_default=True,  # run validators even on default values
    )

    domain: str
    port: int = 3000
    tls: bool = True
    backend: str = "http://127.0.0.1"
```

> Use `extra="forbid"` for config files — any unknown key is a typo and should
> be rejected loudly, not silently ignored.

### `field_validator` — before and after

```python
from pydantic import BaseModel, field_validator

class WaptSiteConfig(BaseModel):
    domain: str
    port: int

    @field_validator("domain", mode="before")
    @classmethod
    def strip_trailing_dot(cls, v: object) -> object:
        """Accept 'myapp.local.' (trailing dot) — normalize to 'myapp.local'."""
        if isinstance(v, str):
            return v.rstrip(".")
        return v

    @field_validator("domain", mode="after")
    @classmethod
    def validate_local_tld(cls, v: str) -> str:
        """Enforce .local or .test TLD."""
        if not (v.endswith(".local") or v.endswith(".test")):
            raise ValueError(
                f"Domain '{v}' must end in .local or .test. "
                "Example: myapp.local"
            )
        return v.lower()

    @field_validator("port", mode="after")
    @classmethod
    def port_in_range(cls, v: int) -> int:
        if not (1 <= v <= 65535):
            raise ValueError(f"Port {v} is out of range 1–65535.")
        return v
```

### `model_validator` — cross-field validation

```python
from typing import Self
from pydantic import BaseModel, model_validator

class WaptSiteConfig(BaseModel):
    domain: str
    port: int = 3000
    backend_host: str = "127.0.0.1"
    backend_port: int | None = None  # if None, mirrors `port`

    @model_validator(mode="after")
    def resolve_backend_port(self) -> Self:
        """Default backend_port to port when not specified."""
        if self.backend_port is None:
            self.backend_port = self.port
        return self

    @model_validator(mode="before")
    @classmethod
    def reject_reserved_domains(cls, data: object) -> object:
        """Guard against reserved domains before any field parsing."""
        if isinstance(data, dict):
            domain = data.get("domain", "")
            if domain in {"localhost", "127.0.0.1"}:
                raise ValueError(
                    f"'{domain}' is reserved. Use a .local domain instead."
                )
        return data
```

### TOML config parsing — `tomllib` + Pydantic v2

```python
# wapt/config.py
import tomllib
from pathlib import Path
from pydantic import BaseModel, ConfigDict, ValidationError
import typer

class TlsConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    enabled: bool = True
    cert_dir: str = "~/.wapt/certs"

class SiteConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    domain: str
    port: int = 3000
    tls: TlsConfig = TlsConfig()

class WaptConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    caddy_bin: str = "caddy"
    sites: list[SiteConfig] = []
    tls: TlsConfig = TlsConfig()

def load_config(path: Path) -> WaptConfig:
    """Load wapt.toml and validate. Exits on error with a human-readable message."""
    if not path.exists():
        typer.echo(f"ERROR: Config file not found: {path}", err=True)
        typer.echo("Run 'wapt init' to create a default wapt.toml.", err=True)
        raise typer.Exit(code=1)

    try:
        with open(path, "rb") as f:
            raw = tomllib.load(f)
    except tomllib.TOMLDecodeError as e:
        typer.echo(f"ERROR: wapt.toml is not valid TOML: {e}", err=True)
        raise typer.Exit(code=1)

    try:
        return WaptConfig.model_validate(raw)
    except ValidationError as e:
        typer.echo("ERROR: wapt.toml has invalid values:\n", err=True)
        for error in e.errors():
            loc = " → ".join(str(part) for part in error["loc"])
            msg = error["msg"]
            typer.echo(f"  [{loc}] {msg}", err=True)
        raise typer.Exit(code=1)
```

Corresponding `wapt.toml`:

```toml
caddy_bin = "caddy"

[tls]
enabled = true
cert_dir = "~/.wapt/certs"

[[sites]]
domain = "myapp.local"
port = 3000

[[sites]]
domain = "api.local"
port = 8080
```

### Optional fields with defaults

```python
from pydantic import BaseModel, Field

class SiteConfig(BaseModel):
    domain: str
    port: int = Field(default=3000, ge=1, le=65535)
    labels: list[str] = Field(default_factory=list)
    description: str | None = None   # explicit None means "not set"
    proxy_headers: dict[str, str] = Field(default_factory=dict)
```

> Use `Field(default_factory=list)` instead of `= []` — mutable defaults are
> caught by Pydantic v2, but being explicit is clearer.

### Serialization — `model_dump()` and `model_dump_json()`

```python
config = WaptConfig.model_validate(raw_dict)

# Round-trip to dict (for writing back / merging)
as_dict = config.model_dump()
as_dict_no_none = config.model_dump(exclude_none=True)

# JSON string (for --json output in CLI)
as_json = config.model_dump_json(indent=2)

# JSON schema (for editor tooling / autocompletion in wapt.toml)
schema = WaptConfig.model_json_schema()
import json
print(json.dumps(schema, indent=2))
```

### `ValidationError` — user-friendly output

```python
from pydantic import ValidationError

def format_validation_error(e: ValidationError) -> str:
    """Convert Pydantic ValidationError to a readable string for CLI output."""
    lines = ["Configuration errors found:"]
    for err in e.errors(include_url=False):  # include_url=False: no docs.pydantic.dev links
        path = " → ".join(str(p) for p in err["loc"])
        msg = err["msg"].removeprefix("Value error, ")  # strip pydantic prefix
        lines.append(f"  [{path}] {msg}")
    return "\n".join(lines)

# Usage:
try:
    cfg = WaptConfig.model_validate(data)
except ValidationError as e:
    typer.echo(format_validation_error(e), err=True)
    raise typer.Exit(code=1)
```

---

## Python 3.12 Examples

### Union types with `|` (PEP 604 — works with Pydantic v2)

```python
# Python 3.12 — use | instead of Union[...]
class SiteConfig(BaseModel):
    port: int | None = None          # Optional[int] equivalent
    labels: list[str] | None = None
    extra: dict[str, str | int] = {}
```

### Generic models (Python 3.12 compatible)

```python
from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")

class PaginatedResult(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int = 1
```

### `model_json_schema()` for wapt.toml IDE support

```python
# scripts/generate_schema.py
import json
from wapt.config import WaptConfig

schema = WaptConfig.model_json_schema()
schema["$schema"] = "http://json-schema.org/draft-07/schema#"
schema["title"] = "wapt.toml configuration"

with open("wapt.schema.json", "w") as f:
    json.dump(schema, f, indent=2)

print("Schema written to wapt.schema.json")
# Add to wapt.toml editors: point $schema at wapt.schema.json for autocomplete
```

---

## Windows Gotchas

- **Path fields**: Store paths as `str` in models, convert to `Path` at point of
  use. Pydantic v2 accepts `Path` as a type, but TOML parsing produces strings.
  Use `Path(val).expanduser()` after model construction — not inside validators.
- **`~` expansion**: `tomllib` does not expand `~`. Call `Path(val).expanduser()`
  explicitly after loading the config.
- **`strict=True` gotcha**: In strict mode, `int` fields reject string `"3000"`.
  TOML integers are already Python `int`, so this is fine for file config — but
  beware if you merge env vars (which are always strings). Use `strict=False`
  and rely on `field_validator` for range checks instead.
- **Line endings**: `tomllib` handles CRLF transparently on Windows.
- **pydantic-core wheel**: Pydantic v2 ships pre-compiled wheels for
  `cp312-win_amd64`. No Rust toolchain needed at install time.
- **`include_url=False`** in `e.errors()`: Suppresses the long docs.pydantic.dev
  URL that gets appended to each error — cleaner for CLI output.

---

## External Links

- [Pydantic v2 docs](https://docs.pydantic.dev/latest/)
- [Pydantic v1 → v2 migration guide](https://docs.pydantic.dev/latest/migration/)
- [Pydantic changelog](https://docs.pydantic.dev/latest/changelog/)
- [Pydantic on PyPI](https://pypi.org/project/pydantic/)
- [tomllib — Python 3.11+ stdlib](https://docs.python.org/3/library/tomllib.html)
- [Pydantic TOML file example](https://docs.pydantic.dev/latest/examples/files/)
- [Validators concept docs](https://docs.pydantic.dev/latest/concepts/validators/)
