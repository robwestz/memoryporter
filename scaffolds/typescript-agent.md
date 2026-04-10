# Scaffold: TypeScript Agentic CLI

Create an interface-based agentic runtime in TypeScript/Node.js.

## Project Structure

```
agent/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # CLI entry point (commander or yargs)
│   ├── runtime/
│   │   ├── interfaces.ts # ApiClient, ToolExecutor interfaces
│   │   ├── runtime.ts    # ConversationRuntime class
│   │   ├── session.ts    # Session, Message, SessionFile
│   │   ├── permission.ts # PermissionPolicy, PermissionMode enum
│   │   ├── budget.ts     # UsageTracker, pre-turn check
│   │   └── compaction.ts # Auto-compaction logic
│   ├── tools/
│   │   ├── registry.ts   # ToolRegistry
│   │   ├── bash.ts       # Shell execution (child_process)
│   │   ├── file-ops.ts   # read, write, edit, glob, grep
│   │   └── mcp-client.ts # MCP stdio JSON-RPC client
│   └── doctor.ts         # Health check subsystem
└── tests/
    ├── runtime.test.ts
    ├── session.test.ts
    └── permission.test.ts
```

## Key Interfaces

```typescript
interface ApiClient {
  stream(request: ApiRequest): AsyncIterable<AssistantEvent>;
}

interface ToolExecutor {
  execute(name: string, input: string): Promise<string>;
  listTools(): ToolDefinition[];
}

interface SessionFile {
  save(session: Session): Promise<void>;
  load(): Promise<Session>;
  exists(): boolean;
}
```

## Minimum Viable Runtime

```typescript
class ConversationRuntime {
  constructor(
    private apiClient: ApiClient,
    private toolExecutor: ToolExecutor,
    private permissionPolicy: PermissionPolicy,
    private options: {
      maxIterations?: number;     // default: 10
      budgetUsd?: number;         // default: unlimited
      compactionThreshold?: number; // default: 200000 tokens
      sessionFile?: SessionFile;
    } = {}
  ) {}

  async runTurn(input: string): Promise<TurnSummary> {
    // 1. Budget check
    this.usageTracker.checkBudget(this.options.budgetUsd);

    // 2. Add user message
    this.session.addUserMessage(input);

    // 3. Agentic loop
    for (let i = 0; i < (this.options.maxIterations ?? 10); i++) {
      const events = this.apiClient.stream(this.buildRequest());
      const msg = await this.aggregateEvents(events);
      this.session.add(msg);

      const toolUses = msg.toolUseBlocks();
      if (toolUses.length === 0) break;

      for (const tu of toolUses) {
        this.permissionPolicy.check(tu.name); // throws if denied
        const result = await this.toolExecutor.execute(tu.name, tu.input);
        this.session.addToolResult(tu.id, result);
      }
    }

    // 4. Auto-compaction
    if (this.usageTracker.shouldCompact(this.options.compactionThreshold)) {
      await this.compactSession();
    }

    // 5. Persist
    await this.options.sessionFile?.save(this.session);

    return this.buildSummary();
  }
}
```

## MCP Client (stdio)

```typescript
class McpStdioClient implements ToolExecutor {
  private process: ChildProcess;
  private requestId = 0;

  constructor(command: string, args: string[]) {
    this.process = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
  }

  async initialize(): Promise<void> {
    await this.sendJsonRpc('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'agent', version: '1.0.0' }
    });
  }

  async listTools(): Promise<ToolDefinition[]> {
    const result = await this.sendJsonRpc('tools/list', {});
    return result.tools;
  }

  async execute(name: string, input: string): Promise<string> {
    const result = await this.sendJsonRpc('tools/call', {
      name,
      arguments: JSON.parse(input)
    });
    return result.content[0].text;
  }
}
```

## Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30",
    "commander": "^12",
    "glob": "^11",
    "readline": "^1"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "vitest": "^2",
    "@types/node": "^22"
  }
}
```

## CLI Entry Point

```typescript
program
  .argument('[prompt]', 'initial prompt (interactive if omitted)')
  .option('-p, --permission <mode>', 'readonly|write|danger', 'write')
  .option('--budget <usd>', 'max budget in USD')
  .option('--session <path>', 'save session to file')
  .option('--resume <path>', 'resume from session file')
  .option('--doctor', 'run health check and exit')
  .action(async (prompt, opts) => { /* ... */ });
```

## Applies These Patterns

- Gamechanger: Generic Runtime (interfaces instead of traits)
- Gamechanger: Auto-Compaction
- Gamechanger: Multi-Transport MCP
- Gamechanger: Permission Escalation
- Gamechanger: Session Snapshot
- Skill: Build Agentic Loop
- Skill: Build MCP Client
