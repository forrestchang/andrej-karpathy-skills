# Managed Agents — cURL / Raw HTTP

Use these examples when the user needs raw HTTP requests or is working without an SDK.

## Setup

```bash
export ANTHROPIC_API_KEY="your-api-key"

# Common headers
HEADERS=(
  -H "Content-Type: application/json"
  -H "x-api-key: $ANTHROPIC_API_KEY"
  -H "anthropic-version: 2023-06-01"
  -H "anthropic-beta: managed-agents-2026-04-01"
)
```

---

## Create an Environment

```bash
curl -X POST https://api.anthropic.com/v1/environments \
  "${HEADERS[@]}" \
  -d '{
    "name": "my-dev-env",
    "config": {
      "type": "cloud",
      "networking": { "type": "unrestricted" }
    }
  }'
```

### With restricted networking

```bash
curl -X POST https://api.anthropic.com/v1/environments \
  "${HEADERS[@]}" \
  -d '{
    "name": "restricted-env",
    "config": {
      "type": "cloud",
      "networking": {
        "type": "package_managers_and_custom",
        "allowed_hosts": ["api.example.com"]
      }
    }
  }'
```

---

## Create an Agent (required first step)

> ⚠️ **There is no inline agent config.** Under `managed-agents-2026-04-01`, `model`/`system`/`tools` are top-level fields on `POST /v1/agents`, not on the session. Always create the agent first — the session only takes `"agent": {"type": "agent", "id": "..."}`.

### Minimal

```bash
# 1. Create the agent
curl -X POST https://api.anthropic.com/v1/agents \
  "${HEADERS[@]}" \
  -d '{
    "name": "Coding Assistant",
    "model": "claude-opus-4-7",
    "tools": [{ "type": "agent_toolset_20260401" }]
  }'
# → { "id": "agent_abc123", ... }

# 2. Start a session
curl -X POST https://api.anthropic.com/v1/sessions \
  "${HEADERS[@]}" \
  -d '{
    "agent": { "type": "agent", "id": "agent_abc123", "version": "1772585501101368014" },
    "environment_id": "env_abc123"
  }'
```

### With system prompt, custom tools, and GitHub repo

```bash
# 1. Create the agent
curl -X POST https://api.anthropic.com/v1/agents \
  "${HEADERS[@]}" \
  -d '{
    "name": "Code Reviewer",
    "model": "claude-opus-4-7",
    "system": "You are a senior code reviewer. Be thorough and constructive.",
    "tools": [
      { "type": "agent_toolset_20260401" },
      {
        "type": "custom",
        "name": "run_linter",
        "description": "Run the project linter on a file",
        "input_schema": {
          "type": "object",
          "properties": {
            "file_path": { "type": "string", "description": "Path to lint" }
          },
          "required": ["file_path"]
        }
      }
    ]
  }'

# 2. Start a session with the repo mounted
curl -X POST https://api.anthropic.com/v1/sessions \
  "${HEADERS[@]}" \
  -d '{
    "agent": { "type": "agent", "id": "agent_abc123", "version": "1772585501101368014" },
    "environment_id": "env_abc123",
    "title": "Code review session",
    "resources": [
      {
        "type": "github_repository",
        "url": "https://github.com/owner/repo",
        "mount_path": "/workspace/repo",
        "authorization_token": "ghp_...",
        "branch": "feature-branch"
      }
    ]
  }'
```

---

## Send a User Message

```bash
curl -X POST https://api.anthropic.com/v1/sessions/$SESSION_ID/events \
  "${HEADERS[@]}" \
  -d '{
    "events": [
      {
        "type": "user.message",
        "content": [{ "type": "text", "text": "Review the auth module for security issues" }]
      }
    ]
  }'
```

---

## Stream Events (SSE)

```bash
curl -N https://api.anthropic.com/v1/sessions/$SESSION_ID/events/stream \
  "${HEADERS[@]}"
```

Response format:

```
event: session.status_running
data: {"type":"session.status_running","id":"sevt_...","processed_at":"..."}

event: agent.message
data: {"type":"agent.message","id":"sevt_...","content":[{"type":"text","text":"I'll review..."}],"processed_at":"..."}

event: session.status_idle
data: {"type":"session.status_idle","id":"sevt_...","processed_at":"..."}
```

---

## Poll Events

```bash
# Get all events
curl https://api.anthropic.com/v1/sessions/$SESSION_ID/events \
  "${HEADERS[@]}"

# Paginated — get next page of events
curl "https://api.anthropic.com/v1/sessions/$SESSION_ID/events?page=page_abc123" \
  "${HEADERS[@]}"
```

---

## Provide Custom Tool Result

When the agent calls a custom tool, send the result back:

```bash
curl -X POST https://api.anthropic.com/v1/sessions/$SESSION_ID/events \
  "${HEADERS[@]}" \
  -d '{
    "events": [
      {
        "type": "user.custom_tool_result",
        "custom_tool_use_id": "sevt_abc123",
        "content": [{ "type": "text", "text": "No linting errors found." }]
      }
    ]
  }'
```

---

## Interrupt a Running Session

```bash
curl -X POST https://api.anthropic.com/v1/sessions/$SESSION_ID/events \
  "${HEADERS[@]}" \
  -d '{
    "events": [
      {
        "type": "interrupt"
      }
    ]
  }'
```

---

## Get Session Details

```bash
curl https://api.anthropic.com/v1/sessions/$SESSION_ID \
  "${HEADERS[@]}"
```

---

## List Sessions

```bash
curl https://api.anthropic.com/v1/sessions \
  "${HEADERS[@]}"
```

---

## Delete a Session

```bash
curl -X DELETE https://api.anthropic.com/v1/sessions/$SESSION_ID \
  "${HEADERS[@]}"
```

---

## Upload a File

```bash
curl -X POST https://api.anthropic.com/v1/files \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: files-api-2025-04-14" \
  -F "file=@path/to/file.txt" \
  -F "purpose=agent"
```

---

## List and Download Session Files

List files the agent wrote to `/mnt/session/outputs/` during a session, then download them.

```bash
# List files associated with a session
curl "https://api.anthropic.com/v1/files?scope_id=$SESSION_ID" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: files-api-2025-04-14,managed-agents-2026-04-01"

# Download a specific file
curl "https://api.anthropic.com/v1/files/$FILE_ID/content" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: files-api-2025-04-14,managed-agents-2026-04-01" \
  -o downloaded_file.txt
```

---

## List Agents

```bash
curl https://api.anthropic.com/v1/agents \
  "${HEADERS[@]}"
```

---

## MCP Server Integration

```bash
# 1. Agent declares MCP server (no auth here — auth goes in a vault)
curl -X POST https://api.anthropic.com/v1/agents \
  "${HEADERS[@]}" \
  -d '{
    "name": "MCP Agent",
    "model": "claude-opus-4-7",
    "mcp_servers": [
      { "type": "url", "name": "my-tools", "url": "https://my-mcp-server.example.com/sse" }
    ],
    "tools": [
      { "type": "agent_toolset_20260401" },
      { "type": "mcp_toolset", "mcp_server_name": "my-tools" }
    ]
  }'

# 2. Session attaches vault containing credentials for that MCP server URL
curl -X POST https://api.anthropic.com/v1/sessions \
  "${HEADERS[@]}" \
  -d '{
    "agent": "agent_abc123",
    "environment_id": "env_abc123",
    "vault_ids": ["vlt_abc123"]
  }'
```

See `shared/managed-agents-tools.md` §Vaults for creating vaults and adding credentials.

---

## Tool Configuration

```bash
curl -X POST https://api.anthropic.com/v1/agents \
  "${HEADERS[@]}" \
  -d '{
    "name": "Restricted Agent",
    "model": "claude-opus-4-7",
    "tools": [
      {
        "type": "agent_toolset_20260401",
        "default_config": { "enabled": true },
        "configs": [
          { "name": "bash", "enabled": false }
        ]
      }
    ]
  }'
```
