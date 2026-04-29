# Managed Agents — Python

> **Bindings not shown here:** This README covers the most common managed-agents flows for Python. If you need a class, method, namespace, field, or behavior that isn't shown, WebFetch the Python SDK repo **or the relevant docs page** from `shared/live-sources.md` rather than guess. Do not extrapolate from cURL shapes or another language's SDK.

> **Agents are persistent — create once, reference by ID.** Store the agent ID returned by `agents.create` and pass it to every subsequent `sessions.create`; do not call `agents.create` in the request path. The Anthropic CLI is one convenient way to create agents and environments from version-controlled YAML — its URL is in `shared/live-sources.md`. The examples below show in-code creation for completeness; in production the create call belongs in setup, not in the request path.

## Installation

```bash
pip install anthropic
```

## Client Initialization

```python
import anthropic

# Default (uses ANTHROPIC_API_KEY env var)
client = anthropic.Anthropic()

# Explicit API key
client = anthropic.Anthropic(api_key="your-api-key")
```

---

## Create an Environment

```python
environment = client.beta.environments.create(
    name="my-dev-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)
print(environment.id)  # env_...
```

---

## Create an Agent (required first step)

> ⚠️ **There is no inline agent config.** `model`/`system`/`tools` live on the agent object, not the session. Always start with `agents.create()` — the session only takes `agent={"type": "agent", "id": agent.id}`.

### Minimal

```python
# 1. Create the agent (reusable, versioned)
agent = client.beta.agents.create(
    name="Coding Assistant",
    model="claude-opus-4-7",
    tools=[{"type": "agent_toolset_20260401", "default_config": {"enabled": True}}],
)

# 2. Start a session
session = client.beta.sessions.create(
    agent={"type": "agent", "id": agent.id, "version": agent.version},
    environment_id=environment.id,
)
print(session.id, session.status)
```

### With system prompt and custom tools

```python
import os

agent = client.beta.agents.create(
    name="Code Reviewer",
    model="claude-opus-4-7",
    system="You are a senior code reviewer.",
    tools=[
        {"type": "agent_toolset_20260401"},
        {
            "type": "custom",
            "name": "run_tests",
            "description": "Run the test suite",
            "input_schema": {
                "type": "object",
                "properties": {
                    "test_path": {"type": "string", "description": "Path to test file"}
                },
                "required": ["test_path"],
            },
        },
    ],
)

session = client.beta.sessions.create(
    agent={"type": "agent", "id": agent.id, "version": agent.version},
    environment_id=environment.id,
    title="Code review session",
    resources=[
        {
            "type": "github_repository",
            "url": "https://github.com/owner/repo",
            "mount_path": "/workspace/repo",
            "authorization_token": os.environ["GITHUB_TOKEN"],
            "branch": "main",
        }
    ],
)
```

---

## Send a User Message

```python
client.beta.sessions.events.send(
    session_id=session.id,
    events=[
        {
            "type": "user.message",
            "content": [{"type": "text", "text": "Review the auth module"}],
        }
    ],
)
```

> 💡 **Stream-first:** Open the stream *before* (or concurrently with) sending the message. The stream only delivers events that occur after it opens — stream-after-send means early events arrive buffered in one batch. See [Steering Patterns](../../shared/managed-agents-events.md#steering-patterns).

---

## Stream Events (SSE)

```python
import json

# Stream-first: open stream, then send while stream is live
with client.beta.sessions.stream(
    session_id=session.id,
) as stream:
    client.beta.sessions.events.send(
        session_id=session.id,
        events=[{"type": "user.message", "content": [{"type": "text", "text": "..."}]}],
    )
    for event in stream:
        ...  # process events

# Standalone stream iteration:
with client.beta.sessions.stream(
    session_id=session.id,
) as stream:
    for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                if block.type == "text":
                    print(block.text, end="", flush=True)
        elif event.type == "agent.custom_tool_use":
            # Custom tool invocation — session is now idle
            print(f"\nCustom tool call: {event.tool_name}")
            print(f"Input: {json.dumps(event.input)}")
            # Send result back (see below)
        elif event.type == "session.status_idle":
            print("\n--- Agent idle ---")
        elif event.type == "session.status_terminated":
            print("\n--- Session terminated ---")
            break
```

---

## Provide Custom Tool Result

```python
client.beta.sessions.events.send(
    session_id=session.id,
    events=[
        {
            "type": "user.custom_tool_result",
            "custom_tool_use_id": "sevt_abc123",
            "content": [{"type": "text", "text": "All 42 tests passed."}],
        }
    ],
)
```

---

## Poll Events

```python
events = client.beta.sessions.events.list(
    session_id=session.id,
)
for event in events.data:
    print(f"{event.type}: {event.id}")
```

> ⚠️ **Prefer the SDK over raw `requests`/`httpx`.** If you hand-roll a poll loop, don't assume `timeout=(5, 60)` or `httpx.Timeout(120)` caps total call duration — both are **per-chunk** read timeouts (reset on every byte), so a trickling response can block forever. For a hard wall-clock deadline, track `time.monotonic()` at the loop level and bail explicitly, or wrap with `asyncio.wait_for()`. See [Receiving Events](../../shared/managed-agents-events.md#receiving-events).

---

## Full Streaming Loop with Custom Tools

```python
import json


def run_custom_tool(tool_name: str, tool_input: dict) -> str:
    """Execute a custom tool and return the result."""
    if tool_name == "run_tests":
        # Your tool implementation here
        return "All tests passed."
    return f"Unknown tool: {tool_name}"


def run_session(client, session_id: str):
    """Stream events and handle custom tool calls."""
    while True:
        with client.beta.sessions.stream(
            session_id=session_id,
        ) as stream:
            tool_calls = []
            for event in stream:
                if event.type == "agent.message":
                    for block in event.content:
                        if block.type == "text":
                            print(block.text, end="", flush=True)
                elif event.type == "agent.custom_tool_use":
                    tool_calls.append(event)
                elif event.type == "session.status_idle":
                    break
                elif event.type == "session.status_terminated":
                    return

        if not tool_calls:
            break

        # Process custom tool calls
        results = []
        for call in tool_calls:
            result = run_custom_tool(call.tool_name, call.input)
            results.append({
                "type": "user.custom_tool_result",
                "custom_tool_use_id": call.id,
                "content": [{"type": "text", "text": result}],
            })

        client.beta.sessions.events.send(
            session_id=session_id,
            events=results,
        )
```

---

## Upload a File

```python
with open("data.csv", "rb") as f:
    file = client.beta.files.upload(
        file=f,
    )

# Use in a session
session = client.beta.sessions.create(
    agent={"type": "agent", "id": agent.id, "version": agent.version},
    environment_id=environment.id,
    resources=[{"type": "file", "file_id": file.id, "mount_path": "/workspace/data.csv"}],
)
```

---

## List and Download Session Files

List files the agent wrote to `/mnt/session/outputs/` during a session, then download them.

```python
# List files associated with a session
files = client.beta.files.list(
    scope_id=session.id,
    betas=["managed-agents-2026-04-01"],
)
for f in files.data:
    print(f.filename, f.size_bytes)
    # Download each file and save to disk
    file_content = client.beta.files.download(f.id)
    file_content.write_to_file(f.filename)
```

> 💡 There's a brief indexing lag (~1–3s) between `session.status_idle` and output files appearing in `files.list`. Retry once or twice if the list is empty.

---

## Session Management

```python
# Get session details
session = client.beta.sessions.retrieve(session_id="sesn_011CZxAbc123Def456")
print(session.status, session.usage)

# List sessions
sessions = client.beta.sessions.list()

# Delete a session
client.beta.sessions.delete(session_id="sesn_011CZxAbc123Def456")

# Archive a session
client.beta.sessions.archive(session_id="sesn_011CZxAbc123Def456")
```

---

## MCP Server Integration

```python
# Agent declares MCP server (no auth here — auth goes in a vault)
agent = client.beta.agents.create(
    name="MCP Agent",
    model="claude-opus-4-7",
    mcp_servers=[
        {"type": "url", "name": "my-tools", "url": "https://my-mcp-server.example.com/sse"},
    ],
    tools=[
        {"type": "agent_toolset_20260401", "default_config": {"enabled": True}},
        {"type": "mcp_toolset", "mcp_server_name": "my-tools"},
    ],
)

# Session attaches vault(s) containing credentials for those MCP server URLs
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    vault_ids=[vault.id],
)
```

See `shared/managed-agents-tools.md` §Vaults for creating vaults and adding credentials.
