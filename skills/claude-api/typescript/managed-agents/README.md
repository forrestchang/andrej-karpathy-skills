# Managed Agents — TypeScript

> **Bindings not shown here:** This README covers the most common managed-agents flows for TypeScript. If you need a class, method, namespace, field, or behavior that isn't shown, WebFetch the TypeScript SDK repo **or the relevant docs page** from `shared/live-sources.md` rather than guess. Do not extrapolate from cURL shapes or another language's SDK.

> **Agents are persistent — create once, reference by ID.** Store the agent ID returned by `agents.create` and pass it to every subsequent `sessions.create`; do not call `agents.create` in the request path. The Anthropic CLI is one convenient way to create agents and environments from version-controlled YAML — its URL is in `shared/live-sources.md`. The examples below show in-code creation for completeness; in production the create call belongs in setup, not in the request path.

## Installation

```bash
npm install @anthropic-ai/sdk
```

## Client Initialization

```typescript
import Anthropic from "@anthropic-ai/sdk";

// Default (uses ANTHROPIC_API_KEY env var)
const client = new Anthropic();

// Explicit API key
const client = new Anthropic({ apiKey: "your-api-key" });
```

---

## Create an Environment

```typescript
const environment = await client.beta.environments.create(
  {
    name: "my-dev-env",
    config: {
      type: "cloud",
      networking: { type: "unrestricted" },
    },
  },
);
console.log(environment.id); // env_...
```

---

## Create an Agent (required first step)

> ⚠️ **There is no inline agent config.** `model`/`system`/`tools` live on the agent object, not the session. Always start with `agents.create()` — the session only takes `agent: { type: "agent", id: agent.id }`.

### Minimal

```typescript
// 1. Create the agent (reusable, versioned)
const agent = await client.beta.agents.create(
  {
    name: "Coding Assistant",
    model: "claude-opus-4-7",
    tools: [{ type: "agent_toolset_20260401", default_config: { enabled: true } }],
  },
);

// 2. Start a session
const session = await client.beta.sessions.create(
  {
    agent: { type: "agent", id: agent.id, version: agent.version },
    environment_id: environment.id,
  },
);
console.log(session.id, session.status);
```

### With system prompt and custom tools

```typescript
const agent = await client.beta.agents.create(
  {
    name: "Code Reviewer",
    model: "claude-opus-4-7",
    system: "You are a senior code reviewer.",
    tools: [
      { type: "agent_toolset_20260401", default_config: { enabled: true } },
      {
        type: "custom",
        name: "run_tests",
        description: "Run the test suite",
        input_schema: {
          type: "object",
          properties: {
            test_path: { type: "string", description: "Path to test file" },
          },
          required: ["test_path"],
        },
      },
    ],
  },
);

const session = await client.beta.sessions.create(
  {
    agent: { type: "agent", id: agent.id, version: agent.version },
    environment_id: environment.id,
    title: "Code review session",
    resources: [
      {
        type: "github_repository",
        url: "https://github.com/owner/repo",
        mount_path: "/workspace/repo",
        authorization_token: process.env.GITHUB_TOKEN,
        branch: "main",
      },
    ],
  },
);
```

---

## Send a User Message

```typescript
await client.beta.sessions.events.send(
  session.id,
  {
    events: [
      {
        type: "user.message",
        content: [{ type: "text", text: "Review the auth module" }],
      },
    ],
  },
);
```

> 💡 **Stream-first:** Open the stream *before* (or concurrently with) sending the message. The stream only delivers events that occur after it opens — stream-after-send means early events arrive buffered in one batch. See [Steering Patterns](../../shared/managed-agents-events.md#steering-patterns).

---

## Stream Events (SSE)

```typescript
// Stream-first: open stream and send concurrently
const [events] = await Promise.all([
  collectStream(session.id),
  client.beta.sessions.events.send(
    session.id,
    { events: [{ type: "user.message", content: [{ type: "text", text: "..." }] }] },
  ),
]);

// Standalone stream iteration:
const stream = await client.beta.sessions.stream(
  session.id,
);

for await (const event of stream) {
  switch (event.type) {
    case "agent.message":
      for (const block of event.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
        }
      }
      break;
    case "agent.custom_tool_use":
      // Custom tool invocation — session is now idle
      console.log(`\nCustom tool call: ${event.tool_name}`);
      console.log(`Input: ${JSON.stringify(event.input)}`);
      break;
    case "session.status_idle":
      console.log("\n--- Agent idle ---");
      break;
    case "session.status_terminated":
      console.log("\n--- Session terminated ---");
      break;
  }
}
```

---

## Provide Custom Tool Result

```typescript
await client.beta.sessions.events.send(
  session.id,
  {
    events: [
      {
        type: "user.custom_tool_result",
        custom_tool_use_id: "sevt_abc123",
        content: [{ type: "text", text: "All 42 tests passed." }],
      },
    ],
  },
);
```

---

## Poll Events

```typescript
const events = await client.beta.sessions.events.list(
  session.id,
);
for (const event of events.data) {
  console.log(`${event.type}: ${event.id}`);
}
```

---

## Full Streaming Loop with Custom Tools

```typescript
function runCustomTool(toolName: string, toolInput: unknown): string {
  if (toolName === "run_tests") {
    // Your tool implementation here
    return "All tests passed.";
  }
  return `Unknown tool: ${toolName}`;
}

async function runSession(client: Anthropic, sessionId: string) {
  while (true) {
    const stream = await client.beta.sessions.stream(
      sessionId,
    );

    const toolCalls: Array<{ custom_tool_use_id: string; tool_name: string; input: unknown }> = [];

    for await (const event of stream) {
      if (event.type === "agent.message") {
        for (const block of event.content) {
          if (block.type === "text") {
            process.stdout.write(block.text);
          }
        }
      } else if (event.type === "agent.custom_tool_use") {
        toolCalls.push({
          id: event.id,
          tool_name: event.tool_name,
          input: event.input,
        });
      } else if (event.type === "session.status_idle") {
        break;
      } else if (event.type === "session.status_terminated") {
        return;
      }
    }

    if (toolCalls.length === 0) break;

    // Process custom tool calls
    const results = toolCalls.map((call) => ({
      type: "user.custom_tool_result" as const,
      custom_tool_use_id: call.id,
      content: [{ type: "text" as const, text: runCustomTool(call.tool_name, call.input) }],
    }));

    await client.beta.sessions.events.send(
      sessionId,
      { events: results },
    );
  }
}
```

---

## Upload a File

```typescript
import fs from "fs";

const file = await client.beta.files.upload({
  file: fs.createReadStream("data.csv"),
  purpose: "agent",
});

// Use in a session
const session = await client.beta.sessions.create(
  {
    agent: { type: "agent", id: agent.id, version: agent.version },
    environment_id: environment.id,
    resources: [{ type: "file", file_id: file.id, mount_path: "/workspace/data.csv" }],
  },
);
```

---

## List and Download Session Files

List files the agent wrote to `/mnt/session/outputs/` during a session, then download them.

```typescript
import fs from "fs";

// List files associated with a session
const files = await client.beta.files.list({
  scope_id: session.id,
  betas: ["managed-agents-2026-04-01"],
});
for (const f of files.data) {
  console.log(f.filename, f.size_bytes);

  // Download and save to disk
  const resp = await client.beta.files.download(f.id);
  const buffer = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(f.filename, buffer);
}
```

> 💡 There's a brief indexing lag (~1–3s) between `session.status_idle` and output files appearing in `files.list`. Retry once or twice if the list is empty.

---

## Session Management

```typescript
// Get session details
const session = await client.beta.sessions.retrieve("sesn_011CZxAbc123Def456");
console.log(session.status, session.usage);

// List sessions
const sessions = await client.beta.sessions.list();

// Delete a session
await client.beta.sessions.delete("sesn_011CZxAbc123Def456");

// Archive a session
await client.beta.sessions.archive("sesn_011CZxAbc123Def456");
```

---

## MCP Server Integration

```typescript
// Agent declares MCP server (no auth here — auth goes in a vault)
const agent = await client.beta.agents.create({
  name: "MCP Agent",
  model: "claude-opus-4-7",
  mcp_servers: [
    { type: "url", name: "my-tools", url: "https://my-mcp-server.example.com/sse" },
  ],
  tools: [
    { type: "agent_toolset_20260401", default_config: { enabled: true } },
    { type: "mcp_toolset", mcp_server_name: "my-tools" },
  ],
});

// Session attaches vault(s) containing credentials for those MCP server URLs
const session = await client.beta.sessions.create({
  agent: agent.id,
  environment_id: environment.id,
  vault_ids: [vault.id],
});
```

See `shared/managed-agents-tools.md` §Vaults for creating vaults and adding credentials.
