# Scaffold: Python Agentic CLI

Create an ABC-based agentic runtime in Python with async tool execution.

## Project Structure

```
agent/
├── pyproject.toml
├── src/
│   └── agent/
│       ├── __init__.py
│       ├── __main__.py     # CLI entry (click)
│       ├── runtime/
│       │   ├── __init__.py
│       │   ├── base.py     # ApiClient, ToolExecutor ABCs
│       │   ├── runtime.py  # ConversationRuntime
│       │   ├── session.py  # Session, Message, SessionFile
│       │   ├── permission.py # PermissionPolicy, PermissionMode
│       │   ├── budget.py   # UsageTracker
│       │   └── compaction.py # Auto-compaction
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── registry.py # ToolRegistry
│       │   ├── bash.py     # subprocess execution
│       │   ├── file_ops.py # read, write, edit, glob, grep
│       │   └── mcp_client.py # MCP stdio client
│       └── doctor.py       # Health check
└── tests/
    ├── test_runtime.py
    ├── test_session.py
    └── test_permission.py
```

## Key ABCs

```python
from abc import ABC, abstractmethod
from typing import AsyncIterator

class ApiClient(ABC):
    @abstractmethod
    async def stream(self, request: ApiRequest) -> AsyncIterator[AssistantEvent]:
        ...

class ToolExecutor(ABC):
    @abstractmethod
    async def execute(self, name: str, input: str) -> str:
        ...

    @abstractmethod
    def list_tools(self) -> list[ToolDefinition]:
        ...
```

## Minimum Viable Runtime

```python
@dataclass
class ConversationRuntime:
    api_client: ApiClient
    tool_executor: ToolExecutor
    permission_policy: PermissionPolicy
    session: Session = field(default_factory=Session)
    max_iterations: int = 10
    budget_usd: float | None = None
    compaction_threshold: int = 200_000
    session_file: SessionFile | None = None

    async def run_turn(self, input: str) -> TurnSummary:
        # 1. Budget check
        if self.budget_usd:
            self.usage_tracker.check_budget(self.budget_usd)

        # 2. Add user message
        self.session.add_user_message(input)

        # 3. Agentic loop
        for _ in range(self.max_iterations):
            events = self.api_client.stream(self._build_request())
            msg = await self._aggregate_events(events)
            self.session.add(msg)

            tool_uses = msg.tool_use_blocks()
            if not tool_uses:
                break

            for tu in tool_uses:
                self.permission_policy.check(tu.name)  # raises if denied
                result = await self.tool_executor.execute(tu.name, tu.input)
                self.session.add_tool_result(tu.id, result)

        # 4. Auto-compaction
        if self.usage_tracker.should_compact(self.compaction_threshold):
            await self._compact_session()

        # 5. Persist
        if self.session_file:
            self.session_file.save(self.session)

        return self._build_summary()
```

## Session Persistence (atomic writes)

```python
class SessionFile:
    def __init__(self, path: Path):
        self.path = path

    def save(self, session: Session) -> None:
        tmp = self.path.with_suffix('.json.tmp')
        tmp.write_text(json.dumps(session.to_dict(), indent=2))
        tmp.rename(self.path)  # atomic on same filesystem

    def load(self) -> Session:
        return Session.from_dict(json.loads(self.path.read_text()))

    def exists(self) -> bool:
        return self.path.exists()
```

## CLI Entry Point

```python
@click.command()
@click.argument('prompt', required=False)
@click.option('-p', '--permission', type=click.Choice(['readonly', 'write', 'danger']), default='write')
@click.option('--budget', type=float, help='Max budget in USD')
@click.option('--session', type=click.Path(), help='Save session to file')
@click.option('--resume', type=click.Path(exists=True), help='Resume from session')
@click.option('--doctor', is_flag=True, help='Run health check')
def main(prompt, permission, budget, session, resume, doctor):
    runtime = build_runtime(permission, budget, session, resume)
    if doctor:
        run_doctor(runtime)
        return
    if prompt:
        asyncio.run(runtime.run_turn(prompt))
    else:
        interactive_loop(runtime)
```

## Dependencies

```toml
[project]
dependencies = [
    "anthropic>=0.34",
    "click>=8.1",
    "rich>=13",        # terminal rendering
    "aiofiles>=24",
]

[project.optional-dependencies]
dev = ["pytest>=8", "pytest-asyncio>=0.24"]
```

## Testing Strategy

```python
class MockApiClient(ApiClient):
    def __init__(self, responses: list[list[AssistantEvent]]):
        self.responses = iter(responses)

    async def stream(self, request):
        for event in next(self.responses):
            yield event

class MockToolExecutor(ToolExecutor):
    def __init__(self):
        self.calls: list[tuple[str, str]] = []

    async def execute(self, name, input):
        self.calls.append((name, input))
        return f"executed {name}"
```

## Applies These Patterns

- Gamechanger: Generic Runtime (ABCs instead of traits)
- Gamechanger: Auto-Compaction
- Gamechanger: Permission Escalation
- Gamechanger: Session Snapshot
- Skill: Build Agentic Loop
- Skill: Tool Permission System
