# Windows Subprocess — Reference
> Last updated: 2026-04-21

## Version Pins

```toml
# No extra packages needed — all stdlib
# Python 3.12+ stdlib modules used:
#   subprocess  — process management
#   os          — os.kill, os.getpid
#   signal      — signal.SIGTERM, signal.CTRL_BREAK_EVENT
#   shutil      — shutil.which
#   pathlib     — Path

python = ">=3.12"
```

---

## Best Practices

### Windows process creation flags

```python
import subprocess

# Key flags (Windows only — defined in subprocess since Python 3.7)
# subprocess.DETACHED_PROCESS        = 0x00000008
# subprocess.CREATE_NEW_PROCESS_GROUP = 0x00000200
# subprocess.CREATE_NO_WINDOW        = 0x08000000

# Recommended combination for a true background daemon (like Caddy):
FLAGS = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
# DETACHED_PROCESS: child does not inherit the parent's console
# CREATE_NEW_PROCESS_GROUP: required to be able to os.kill() the child later
# Do NOT combine DETACHED_PROCESS with CREATE_NEW_CONSOLE — they conflict.
```

### `subprocess.Popen` for background processes

```python
import subprocess
from pathlib import Path

def start_caddy(
    caddy_bin: str,
    config_path: Path,
    pid_file: Path,
) -> int:
    """Launch Caddy as a detached background process. Returns the PID."""
    proc = subprocess.Popen(
        [caddy_bin, "run", "--config", str(config_path), "--adapter", "caddyfile"],
        creationflags=(
            subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
        ),
        stdout=subprocess.DEVNULL,   # suppress stdout — Caddy logs to its own log
        stderr=subprocess.DEVNULL,   # suppress stderr
        stdin=subprocess.DEVNULL,    # no stdin — fully detached
        close_fds=True,              # close all inherited file descriptors
    )
    pid_file.write_text(str(proc.pid), encoding="utf-8")
    return proc.pid
```

> After `Popen()` returns, the process runs independently. The Python process
> can exit without affecting Caddy. `proc.pid` is valid even after the parent exits.

### `subprocess.run()` for synchronous commands

```python
import subprocess

def caddy_validate(caddy_bin: str, config_path: str) -> bool:
    """Run 'caddy validate' synchronously. Returns True if config is valid."""
    try:
        subprocess.run(
            [caddy_bin, "validate", "--config", config_path, "--adapter", "caddyfile"],
            capture_output=True,   # captures stdout + stderr into result.stdout/stderr
            text=True,             # decode bytes to str
            encoding="utf-8",      # explicit on Windows (avoids cp1252 surprises)
            timeout=10,            # seconds; raises TimeoutExpired if exceeded
            check=True,            # raises CalledProcessError if returncode != 0
        )
        return True
    except subprocess.CalledProcessError as e:
        import sys
        print(f"Caddy config invalid:\n{e.stderr.strip()}", file=sys.stderr)
        return False
    except subprocess.TimeoutExpired:
        import sys
        print("caddy validate timed out after 10s", file=sys.stderr)
        return False
```

### `caddy reload` with timeout

```python
import subprocess

def caddy_reload(caddy_bin: str, config_path: str) -> None:
    """Signal Caddy to reload its config without downtime."""
    try:
        subprocess.run(
            [caddy_bin, "reload", "--config", config_path, "--adapter", "caddyfile"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=15,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"caddy reload failed (exit {e.returncode}):\n{e.stderr.strip()}"
        ) from e
    except subprocess.TimeoutExpired as e:
        raise RuntimeError("caddy reload timed out after 15s") from e
```

### PATH detection with `shutil.which`

```python
import shutil

def find_caddy(override: str | None = None) -> str:
    """Return the path to the caddy binary, or raise if not found."""
    candidate = override or "caddy"
    resolved = shutil.which(candidate)
    if resolved is None:
        raise FileNotFoundError(
            f"caddy not found in PATH (looked for: {candidate!r}).\n"
            "Install from https://caddyserver.com/docs/install or set caddy_bin "
            "in wapt.toml."
        )
    return resolved
```

### Process detection — is Caddy already running?

```python
import os
from pathlib import Path

def is_process_running(pid: int) -> bool:
    """Check if a process with the given PID is alive on Windows."""
    try:
        # os.kill with signal 0 checks existence without sending a real signal
        os.kill(pid, 0)
        return True
    except OSError:
        # Process does not exist or no permission — treat as not running
        return False

def read_pid(pid_file: Path) -> int | None:
    """Read PID from file. Returns None if file missing or contains non-integer."""
    try:
        return int(pid_file.read_text(encoding="utf-8").strip())
    except (FileNotFoundError, ValueError):
        return None

def caddy_is_running(pid_file: Path) -> bool:
    pid = read_pid(pid_file)
    if pid is None:
        return False
    return is_process_running(pid)
```

### Kill a background process

```python
import os
import signal
import subprocess
from pathlib import Path

def stop_caddy(pid_file: Path) -> None:
    """Stop Caddy by PID. Cleans up PID file on success."""
    pid = read_pid(pid_file)
    if pid is None:
        return  # nothing to stop

    if not is_process_running(pid):
        pid_file.unlink(missing_ok=True)
        return

    try:
        # CTRL_BREAK_EVENT is the correct signal for process groups on Windows.
        # Works when the process was started with CREATE_NEW_PROCESS_GROUP.
        os.kill(pid, signal.CTRL_BREAK_EVENT)
    except (OSError, PermissionError):
        # Fall back to taskkill if signal fails (e.g., different user context)
        subprocess.run(
            ["taskkill", "/F", "/PID", str(pid)],
            capture_output=True,
            timeout=5,
        )

    pid_file.unlink(missing_ok=True)
```

> On Windows, `SIGTERM` is not supported for child processes started with
> `CREATE_NEW_PROCESS_GROUP`. Use `signal.CTRL_BREAK_EVENT` instead, or
> `taskkill /F /PID <pid>` as a forceful fallback.

### `CalledProcessError` — complete error handling

```python
import subprocess

def run_caddy_command(args: list[str]) -> subprocess.CompletedProcess:
    """Run any caddy subcommand. Raises RuntimeError with context on failure."""
    try:
        return subprocess.run(
            args,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=30,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"Command failed: {' '.join(e.cmd)}\n"
            f"Exit code : {e.returncode}\n"
            f"stdout    : {(e.stdout or '').strip()}\n"
            f"stderr    : {(e.stderr or '').strip()}"
        ) from e
    except subprocess.TimeoutExpired as e:
        raise RuntimeError(
            f"Command timed out after {e.timeout}s: {' '.join(e.cmd)}"
        ) from e
    except FileNotFoundError as e:
        raise RuntimeError(
            f"Executable not found: {args[0]!r}. Is caddy installed and in PATH?"
        ) from e
```

---

## Python 3.12 Examples

### Full process manager — start, stop, status, reload

```python
# wapt/process.py
import os
import signal
import shutil
import subprocess
from pathlib import Path

CADDY_FLAGS = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
DEFAULT_PID_FILE = Path.home() / ".wapt" / "caddy.pid"


def find_caddy(override: str | None = None) -> str:
    candidate = override or "caddy"
    resolved = shutil.which(candidate)
    if resolved is None:
        raise FileNotFoundError(f"caddy not found in PATH: {candidate!r}")
    return resolved


def read_pid(pid_file: Path = DEFAULT_PID_FILE) -> int | None:
    try:
        return int(pid_file.read_text(encoding="utf-8").strip())
    except (FileNotFoundError, ValueError):
        return None


def is_running(pid_file: Path = DEFAULT_PID_FILE) -> bool:
    pid = read_pid(pid_file)
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def start(caddy_bin: str, config_path: Path, pid_file: Path = DEFAULT_PID_FILE) -> int:
    """Start Caddy as a detached background process. Returns PID."""
    if is_running(pid_file):
        raise RuntimeError("Caddy is already running.")
    caddy = find_caddy(caddy_bin)
    proc = subprocess.Popen(
        [caddy, "run", "--config", str(config_path), "--adapter", "caddyfile"],
        creationflags=CADDY_FLAGS,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
        close_fds=True,
    )
    pid_file.parent.mkdir(parents=True, exist_ok=True)
    pid_file.write_text(str(proc.pid), encoding="utf-8")
    return proc.pid


def stop(pid_file: Path = DEFAULT_PID_FILE) -> None:
    """Stop Caddy gracefully. Falls back to taskkill."""
    pid = read_pid(pid_file)
    if pid is None or not is_running(pid_file):
        pid_file.unlink(missing_ok=True)
        return
    try:
        os.kill(pid, signal.CTRL_BREAK_EVENT)
    except (OSError, PermissionError):
        subprocess.run(["taskkill", "/F", "/PID", str(pid)], capture_output=True)
    pid_file.unlink(missing_ok=True)


def reload(caddy_bin: str, config_path: Path) -> None:
    """Hot-reload Caddy config without downtime."""
    caddy = find_caddy(caddy_bin)
    subprocess.run(
        [caddy, "reload", "--config", str(config_path), "--adapter", "caddyfile"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=15,
        check=True,
    )


def status(pid_file: Path = DEFAULT_PID_FILE) -> dict:
    """Return a status dict suitable for --json output."""
    pid = read_pid(pid_file)
    running = is_running(pid_file)
    return {
        "running": running,
        "pid": pid if running else None,
        "pid_file": str(pid_file),
    }
```

PID file structure (plain text, single line):
```
# ~/.wapt/caddy.pid
12345
```

### Forward vs backslash in executable paths

```python
import shutil
import subprocess
from pathlib import Path

# shutil.which returns the OS-native path — backslashes on Windows.
# Pass it directly to subprocess; subprocess handles native paths correctly.
caddy = shutil.which("caddy")
# e.g. "C:\\Program Files\\caddy\\caddy.exe"

# Correct: use the native path from shutil.which
subprocess.run([caddy, "version"], check=True)

# Wrong: do NOT call Path.as_posix() on executables passed to Popen on Windows.
# Windows CreateProcess does not understand forward-slash paths for .exe files.
# subprocess.run([Path(caddy).as_posix(), "version"])  # may fail
```

---

## Windows Gotchas

- **`CTRL_BREAK_EVENT` not `SIGTERM`**: On Windows, `signal.SIGTERM` sent via
  `os.kill()` to a child process is ignored. Use `signal.CTRL_BREAK_EVENT`
  when the child was started with `CREATE_NEW_PROCESS_GROUP`. For processes
  you do not own, use `taskkill /F /PID <pid>`.

- **`DETACHED_PROCESS` without `CREATE_NEW_PROCESS_GROUP`**: The process
  detaches from the console but you cannot signal it with `os.kill()`. Always
  pair both flags when you need to stop the process later.

- **Console window pop-up**: Despite the flag name, on some Windows versions
  a brief console window can appear. Add `CREATE_NO_WINDOW` to suppress it:
  ```python
  FLAGS = (
      subprocess.DETACHED_PROCESS
      | subprocess.CREATE_NEW_PROCESS_GROUP
      | subprocess.CREATE_NO_WINDOW
  )
  ```

- **`encoding="utf-8"` always explicit**: Windows defaults to the active code
  page (`cp1252` on most systems) for subprocess text output. Caddy outputs
  UTF-8. Always pass `encoding="utf-8"` to `subprocess.run()` and `Popen()`.

- **`close_fds=True` on Windows**: Python 3.12 defaults `close_fds=True` on
  all platforms. Setting it explicitly documents intent and avoids inheriting
  open handles (e.g., log file handles) into the Caddy process.

- **`shutil.which` returns `.exe` path**: On Windows, `shutil.which("caddy")`
  returns `C:\...\caddy.exe`. Pass it directly to subprocess — do not convert
  with `as_posix()`.

- **Timeout on `subprocess.run`**: When a timeout expires, the child is killed
  and `TimeoutExpired` is raised. Partial output is available on `e.stdout` /
  `e.stderr` — useful for diagnosing hung commands.

- **`taskkill` as fallback**: Available on all Windows versions. More reliable
  than `os.kill` for processes started in different user or session contexts.
  `/F` forces termination; `/T` also terminates child processes of the target.

- **PID file race condition**: There is a small window between checking
  `is_running()` and writing the PID file. For wapt's single-machine local dev
  use case this is acceptable. Production daemons should use a lock file instead.

---

## External Links

- [subprocess — Python 3.12 docs](https://docs.python.org/3/library/subprocess.html)
- [subprocess.DETACHED_PROCESS](https://docs.python.org/3/library/subprocess.html#subprocess.DETACHED_PROCESS)
- [subprocess.CREATE_NEW_PROCESS_GROUP](https://docs.python.org/3/library/subprocess.html#subprocess.CREATE_NEW_PROCESS_GROUP)
- [os.kill — Python docs](https://docs.python.org/3/library/os.html#os.kill)
- [signal.CTRL_BREAK_EVENT — Python docs](https://docs.python.org/3/library/signal.html#signal.CTRL_BREAK_EVENT)
- [shutil.which — Python docs](https://docs.python.org/3/library/shutil.html#shutil.which)
- [Caddy CLI reference](https://caddyserver.com/docs/command-line)
