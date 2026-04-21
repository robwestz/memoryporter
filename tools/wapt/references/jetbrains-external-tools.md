# JetBrains External Tools — Reference
> Last updated: 2026-04-21

---

## Overview

`jetbrains_ext.py` generates External Tools XML configuration files for JetBrains IDEs (WebStorm, PyCharm, PHPStorm, IntelliJ IDEA, Rider). These files register wapt CLI commands as IDE actions accessible from the main menu, context menu, and keyboard shortcuts — without requiring a plugin.

The XML format and install path are consistent across all JetBrains IDEs on Windows.

---

## Version Pins

| Component | Version (2026) |
|-----------|---------------|
| XML format | toolSet v1 (unchanged since IntelliJ Platform 2020+) |
| IDE config root | `%APPDATA%\JetBrains\<IDE><Version>\` |
| Tools subdir | `tools\` inside config root |
| File naming | One `.xml` file per tool group |
| Supported IDEs | WebStorm 2024.x+, PyCharm 2024.x+, PHPStorm 2024.x+, IntelliJ IDEA 2024.x+, Rider 2024.x+ |

---

## File Path on Windows

```
%APPDATA%\JetBrains\<IDE><Version>\tools\<GroupName>.xml
```

Examples:
```
C:\Users\robin\AppData\Roaming\JetBrains\WebStorm2024.3\tools\wapt.xml
C:\Users\robin\AppData\Roaming\JetBrains\PyCharm2024.3\tools\wapt.xml
C:\Users\robin\AppData\Roaming\JetBrains\PhpStorm2024.3\tools\wapt.xml
C:\Users\robin\AppData\Roaming\JetBrains\IntelliJIdea2024.3\tools\wapt.xml
```

The `tools\` directory may not exist by default — create it if absent.

### Glob patterns for detecting installed IDEs
```
WebStorm*
PyCharm*
PhpStorm*
IntelliJIdea*
Rider*
CLion*
GoLand*
RubyMine*
```

Applied under `%APPDATA%\JetBrains\` to find all version directories.

---

## XML Schema

```xml
<?xml version="1.0" encoding="UTF-8"?>
<toolSet name="wapt">
  <tool
    name="wapt doctor"
    description="Check wapt system health"
    showInMainMenu="true"
    showInEditor="true"
    showInProject="true"
    showInSearchPopup="true"
    disabled="false"
    useConsole="true"
    showConsoleOnStdOut="false"
    showConsoleOnStdErr="true"
    synchronizeAfterRun="false"
  >
    <exec>
      <option name="COMMAND" value="wapt" />
      <option name="PARAMETERS" value="doctor" />
      <option name="WORKING_DIRECTORY" value="$ProjectFileDir$" />
    </exec>
  </tool>
</toolSet>
```

### `<toolSet>` attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `name` | yes | Group name shown in IDE menus (e.g. "wapt") |

### `<tool>` attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Tool display name in menus |
| `description` | string | Tooltip text |
| `showInMainMenu` | bool | Show in Tools menu |
| `showInEditor` | bool | Show in right-click editor menu |
| `showInProject` | bool | Show in right-click project tree menu |
| `showInSearchPopup` | bool | Show in Search Everywhere (Shift+Shift) |
| `disabled` | bool | Set `true` to hide without deleting |
| `useConsole` | bool | Run in IDE's built-in terminal/console |
| `showConsoleOnStdOut` | bool | Auto-open console on stdout output |
| `showConsoleOnStdErr` | bool | Auto-open console on stderr output |
| `synchronizeAfterRun` | bool | Trigger VFS refresh after execution |

### `<exec>` options

| Option name | Description |
|-------------|-------------|
| `COMMAND` | Executable name or absolute path |
| `PARAMETERS` | CLI arguments (supports macros) |
| `WORKING_DIRECTORY` | Working dir for the process |

---

## Macro Variables

Available in `PARAMETERS` and `WORKING_DIRECTORY` values:

| Macro | Expands to |
|-------|-----------|
| `$ProjectFileDir$` | Root directory of the open project |
| `$FilePath$` | Absolute path of currently open file |
| `$FileDir$` | Directory of currently open file |
| `$FileName$` | Name of currently open file (with extension) |
| `$FileNameWithoutExtension$` | Name without extension |
| `$FileRelativePath$` | Path relative to project root |
| `$MODULE_DIR$` | Module root directory |
| `$ContentRoot$` | Content root of the project |
| `$Prompt$` | Prompts user for input at runtime |

Most useful for wapt: `$ProjectFileDir$` as working directory ensures wapt reads the correct `wapt.toml`.

---

## Code Examples

### Example 1: Generate XML with `xml.etree.ElementTree`
```python
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import NamedTuple


class WaptTool(NamedTuple):
    name: str
    description: str
    parameters: str
    use_console: bool = True
    show_on_stderr: bool = True
    sync_after_run: bool = False


WAPT_TOOLS = [
    WaptTool("wapt doctor", "Check wapt system health", "doctor"),
    WaptTool("wapt list", "List all registered sites", "list"),
    WaptTool("wapt status", "Show live site status", "status --json"),
    WaptTool("wapt reload", "Reload Caddy config", "reload", sync_after_run=True),
]


def build_external_tools_xml(
    tools: list[WaptTool],
    group_name: str = "wapt",
    command: str = "wapt",
    working_dir: str = "$ProjectFileDir$",
) -> str:
    """
    Generate JetBrains External Tools XML for a list of wapt commands.
    Returns the XML string (UTF-8, with declaration).
    """
    tool_set = ET.Element("toolSet", name=group_name)

    for tool in tools:
        tool_el = ET.SubElement(tool_set, "tool")
        tool_el.set("name", tool.name)
        tool_el.set("description", tool.description)
        tool_el.set("showInMainMenu", "true")
        tool_el.set("showInEditor", "true")
        tool_el.set("showInProject", "true")
        tool_el.set("showInSearchPopup", "true")
        tool_el.set("disabled", "false")
        tool_el.set("useConsole", str(tool.use_console).lower())
        tool_el.set("showConsoleOnStdOut", "false")
        tool_el.set("showConsoleOnStdErr", str(tool.show_on_stderr).lower())
        tool_el.set("synchronizeAfterRun", str(tool.sync_after_run).lower())

        exec_el = ET.SubElement(tool_el, "exec")
        ET.SubElement(exec_el, "option", name="COMMAND", value=command)
        ET.SubElement(exec_el, "option", name="PARAMETERS", value=tool.parameters)
        ET.SubElement(exec_el, "option", name="WORKING_DIRECTORY", value=working_dir)

    # Pretty-print (requires Python 3.9+)
    ET.indent(tool_set, space="  ")
    xml_body = ET.tostring(tool_set, encoding="unicode", xml_declaration=False)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_body}\n'


def write_tools_xml(output_path: Path, tools: list[WaptTool]) -> None:
    """Write generated XML to the given path, creating parent dirs as needed."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    xml_content = build_external_tools_xml(tools)
    output_path.write_text(xml_content, encoding="utf-8")
```

### Example 2: Install to all detected JetBrains IDEs on Windows
```python
import os
from pathlib import Path


IDE_PATTERNS = [
    "WebStorm*",
    "PyCharm*",
    "PhpStorm*",
    "IntelliJIdea*",
    "Rider*",
    "CLion*",
    "GoLand*",
    "RubyMine*",
]


def find_jetbrains_config_roots() -> list[Path]:
    """
    Find all JetBrains IDE config directories on Windows.
    Returns list of existing config root paths, sorted.
    """
    appdata = os.environ.get("APPDATA")
    if not appdata:
        raise RuntimeError("APPDATA environment variable not set")

    jetbrains_root = Path(appdata) / "JetBrains"
    if not jetbrains_root.exists():
        return []

    found = []
    for pattern in IDE_PATTERNS:
        found.extend(m for m in jetbrains_root.glob(pattern) if m.is_dir())

    return sorted(found)


def install_wapt_external_tools(
    tools: list[WaptTool] | None = None,
    group_name: str = "wapt",
    dry_run: bool = False,
) -> list[Path]:
    """
    Install wapt External Tools XML to all detected JetBrains IDEs.

    Returns list of paths where the file was written (or would be, if dry_run).
    Skips IDE config dirs where tools/ subdir cannot be created.
    """
    if tools is None:
        tools = WAPT_TOOLS

    config_roots = find_jetbrains_config_roots()
    if not config_roots:
        print("No JetBrains IDE config directories found under %APPDATA%\\JetBrains\\")
        return []

    xml_content = build_external_tools_xml(tools, group_name=group_name)
    written = []

    for config_root in config_roots:
        tools_dir = config_root / "tools"
        target = tools_dir / f"{group_name}.xml"

        if dry_run:
            print(f"[dry-run] Would write: {target}")
            written.append(target)
            continue

        try:
            tools_dir.mkdir(parents=True, exist_ok=True)
            target.write_text(xml_content, encoding="utf-8")
            print(f"Installed: {target}")
            written.append(target)
        except PermissionError as exc:
            print(f"WARNING: Cannot write to {target}: {exc}")

    return written


def uninstall_wapt_external_tools(group_name: str = "wapt") -> list[Path]:
    """Remove wapt External Tools XML from all detected JetBrains IDEs."""
    config_roots = find_jetbrains_config_roots()
    removed = []
    for config_root in config_roots:
        target = config_root / "tools" / f"{group_name}.xml"
        if target.exists():
            target.unlink()
            print(f"Removed: {target}")
            removed.append(target)
    return removed
```

---

## Best Practices

- **One XML file per tool group.** Name it after the group (e.g., `wapt.xml`). JetBrains loads all `.xml` files from the `tools\` directory on startup.
- **`useConsole="true"` for all wapt commands.** Output is visible in the IDE Run console — much better UX than a silent background process.
- **`$ProjectFileDir$` as working directory.** Ensures `wapt.toml` is discovered from the project root, not the IDE install dir.
- **Restart not required.** JetBrains IDEs detect `tools\` XML changes on next window focus (Alt-Tab back). No restart needed after install.
- **Idempotent install.** Overwriting an existing `wapt.xml` is safe — the IDE re-reads it on next access.
- **`ET.indent()` requires Python 3.9+.** Available in Python 3.12 (wapt runtime requirement). Do not use `minidom` — it produces different whitespace and a redundant XML declaration.

---

## Verification

After installing, verify the tool appears in the IDE:

1. Open any JetBrains IDE project
2. Go to **Settings → Tools → External Tools**
3. Look for the "wapt" group with listed commands
4. Or: **Tools menu → External Tools → wapt → wapt doctor**

If the group does not appear:
- Validate XML is well-formed: `python -c "import xml.etree.ElementTree as ET; ET.parse('wapt.xml')"`
- Verify the file is in the correct `tools\` subdir (not nested further)
- Focus away from IDE and back to trigger config reload

---

## Gotchas

1. **`%APPDATA%` vs `~`** — JetBrains config on Windows lives under `%APPDATA%\JetBrains\`, not `~\.JetBrains\`. Always resolve via `os.environ["APPDATA"]`.
2. **Version suffix in dir name** — Each IDE version gets its own config directory (`WebStorm2024.3`, `WebStorm2025.1`). Installing to `WebStorm2024.3` does not appear in `WebStorm2025.1`. The install script must glob all versions.
3. **`tools\` dir may not exist** — JetBrains does not create it until the user manually adds an External Tool via UI. Always `mkdir(parents=True, exist_ok=True)`.
4. **XML declaration must be prepended manually** — `ET.tostring(..., xml_declaration=False)` then prepend `<?xml version="1.0" encoding="UTF-8"?>`. The built-in `xml_declaration=True` uses single quotes which some IDE parsers reject.
5. **Boolean attribute values must be lowercase strings** — JetBrains XML expects `"true"` / `"false"`, not Python `True`/`False`. Use `str(val).lower()`.
6. **IDE running during install** — Changes to `tools\` XML take effect after the IDE re-focuses. If the group does not appear, check XML validity first — a parse error silently suppresses the entire file.
7. **All JetBrains IDEs share the same XML format** — WebStorm, PyCharm, PHPStorm, IntelliJ IDEA, Rider all use identical `<toolSet>` schema. One generator serves all IDEs.

---

## External Links

- [IntelliJ IDEA: External Tools](https://www.jetbrains.com/help/idea/configuring-third-party-tools.html)
- [External Tools Settings reference](https://www.jetbrains.com/help/idea/settings-tools-external-tools.html)
- [JetBrains Rider: External Tools](https://www.jetbrains.com/help/rider/Configuring_Third-Party_Tools.html)
- [IntelliJ Platform: Built-in Path Macros](https://plugins.jetbrains.com/docs/intellij/built-in-path-macros.html)
