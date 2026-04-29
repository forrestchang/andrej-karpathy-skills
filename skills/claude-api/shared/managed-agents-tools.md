# Managed Agents — Tools & Skills

## Tools

### Server tools vs client tools

| Type | Who runs it | How it works |
|---|---|---|
| **Prebuilt Claude Agent tools** (`agent_toolset_20260401`) | Anthropic, on the session's container | File ops, bash, web search, etc. Enable all at once or configure individually with `enabled: true/false`. |
| **MCP tools** (`mcp_toolset`) | Anthropic, on the session's container | Capabilities exposed by connected MCP servers. Grant access per-server via the toolset. |
| **Custom tools** | **You** — your application handles the call and returns results | Agent emits a `agent.custom_tool_use` event, session goes `idle`, you send back a `user.custom_tool_result` event. |

**Recommendation:** Enable all prebuilt tools via `agent_toolset_20260401`, then disable individually as needed.

**Versioning:** The toolset is a versioned, static resource. When underlying tools change, a new toolset version is created (hence `_20260401`) so you always know exactly what you're getting.

### Agent Toolset

The `agent_toolset_20260401` provides these built-in tools:

| Tool                   | Description                              |
| ---------------------- | ---------------------------------------- |
| `bash` | Execute bash commands in a shell session |
| `read` | Read a file from the local filesystem, including text, images, PDFs, and Jupyter notebooks |
| `write` | Write a file to the local filesystem |
| `edit` | Perform string replacement in a file |
| `glob` | Fast file pattern matching using glob patterns |
| `grep` | Text search using regex patterns |
| `web_fetch` | Fetch content from a URL |
| `web_search` | Search the web for information |

Enable the full toolset:

```json
{
  "tools": [
    { "type": "agent_toolset_20260401" }
  ]
}
```

### Per-Tool Configuration

Override defaults for individual tools. This example enables everything except bash:

```json
{
  "tools": [
    {
      "type": "agent_toolset_20260401",
      "default_config": { "enabled": true },
      "configs": [
        { "name": "bash", "enabled": false }
      ]
    }
  ]
}
```

| Field | Required | Description |
|---|---|---|
| `type` | ✅ | `"agent_toolset_20260401"` |
| `default_config` | ❌ | Applied to all tools. `{ "enabled": bool, "permission_policy": {...} }` |
| `configs` | ❌ | Per-tool overrides: `[{ "name": "...", "enabled": bool, "permission_policy": {...} }]` |

### Permission Policies

Control when server-executed tools (agent toolset + MCP) run automatically vs wait for approval. Does not apply to custom tools.

| Policy | Behavior |
|---|---|
| `always_allow` | Tool executes automatically (default) |
| `always_ask` | Session emits `session.status_idle` and pauses until you send a `tool_confirmation` event |

```json
{
  "type": "agent_toolset_20260401",
  "default_config": {
    "enabled": true,
    "permission_policy": { "type": "always_allow" }
  },
  "configs": [
    { "name": "bash", "permission_policy": { "type": "always_ask" } }
  ]
}
```

**Responding to `always_ask`:** Send a `user.tool_confirmation` event with `tool_use_id` from the triggering `agent_tool_use`/`mcp_tool_use` event:

```json
{ "type": "tool_confirmation", "tool_use_id": "sevt_abc123", "result": "allow" }
{ "type": "tool_confirmation", "tool_use_id": "sevt_def456", "result": "deny", "message": "Read .env.example instead" }
```

The optional `message` on a deny is delivered to the agent so it can adjust its approach.

To enable only specific tools, flip the default off and opt-in per tool:

```json
{
  "tools": [
    {
      "type": "agent_toolset_20260401",
      "default_config": { "enabled": false },
      "configs": [
        { "name": "bash", "enabled": true },
        { "name": "read", "enabled": true }
      ]
    }
  ]
}
```

### Custom Tools (Client-Side)

Custom tools are executed by **your application**, not Anthropic. The flow:

1. Agent decides to use the tool → session emits a `agent.custom_tool_use` event with inputs
2. Session goes `idle` waiting for you
3. Your application executes the tool
4. You send back a `user.custom_tool_result` event with the output
5. Session resumes `running`

No permission policy needed — you're the one executing.

```json
{
  "tools": [
    {
      "type": "custom",
      "name": "get_weather",
      "description": "Fetch current weather for a city.",
      "input_schema": {
        "type": "object",
        "properties": {
          "city": { "type": "string", "description": "City name" }
        },
        "required": ["city"]
      }
    }
  ]
}
```

### MCP Servers

MCP (Model Context Protocol) servers expose standardized third-party capabilities (e.g. Asana, GitHub, Linear). **Configuration is split across agent and vault:**

1. **Agent creation** declares which servers to connect to (`type`, `name`, `url` — no auth). The agent's `mcp_servers` array has no auth field.
2. **Vault** stores the OAuth credentials. Attach via `vault_ids` on session create.

This keeps secrets out of reusable agent definitions. Each vault credential is tied to one MCP server URL; Anthropic matches credentials to servers by URL.

**Agent side — declare servers (no auth):**

| Field | Required | Description |
|---|---|---|
| `type` | ✅ | `"url"` |
| `name` | ✅ | Unique name — referenced by `mcp_toolset.mcp_server_name` |
| `url` | ✅ | The MCP server's endpoint URL (Streamable HTTP transport) |

```json
{
  "mcp_servers": [
    { "type": "url", "name": "linear", "url": "https://mcp.linear.app/mcp" }
  ],
  "tools": [
    { "type": "mcp_toolset", "mcp_server_name": "linear" }
  ]
}
```

**Session side — attach vault:**

```json
{
  "agent": "agent_abc123",
  "environment_id": "env_abc123",
  "vault_ids": ["vlt_abc123"]
}
```

> 💡 **Per-tool enablement (empirical):** `mcp_toolset` has been observed accepting `default_config: {enabled: false}` + `configs: [{name, enabled: true}]` for an allowlist pattern. The API ref shows only the minimal `{type, mcp_server_name}` form.

> ⚠️ **MCP auth tokens ≠ REST API tokens.** Hosted MCP servers (`mcp.notion.com`, `mcp.linear.app`, etc.) typically require **OAuth bearer tokens**, not the service's native API keys. A Notion `ntn_` integration token authenticates against Notion's REST API but will **not** work as a vault credential for the Notion MCP server. These are different auth systems.

### Vaults — the MCP credential store

**Vaults** store OAuth credentials (access token + refresh token) that Anthropic auto-refreshes on your behalf via standard OAuth 2.0 `refresh_token` grant. This is the only way to authenticate MCP servers in the launch SDK.

#### Credentials and the sandbox

Vaults store credentials; those credentials **never enter the sandbox**. This is a deliberate security boundary — code running in the sandbox (including anything the agent writes) cannot read or exfiltrate a vaulted credential, even under prompt injection. Instead, credentials are injected by Anthropic-side proxies **after** a request leaves the sandbox:

- **MCP tool calls** are routed through an Anthropic-side proxy that fetches the credential from the vault and adds it to the outbound request.
- **Git operations on attached GitHub repositories** (`git pull`, `git push`, GitHub REST calls) are routed through a git proxy that injects the `github_repository` resource's `authorization_token` the same way.

**Not yet supported:** running other authenticated CLIs (e.g. `aws`, `gcloud`, `stripe`) directly inside the sandbox. There is currently no way to set container environment variables or expose vault credentials to arbitrary processes. If you need one of these today:

- **Prefer an MCP server** for that service if one exists — it gets the same vault-backed injection.
- **Otherwise, register a custom tool:** the agent emits `agent.custom_tool_use`, your orchestrator (which already holds the credential) executes the call and returns `user.custom_tool_result` over the same authenticated event stream. No public endpoint is exposed; the sandbox never sees the secret. See `shared/managed-agents-client-patterns.md` → Pattern 9.

**Do not put API keys in the system prompt or user messages as a workaround** — they persist in the session's event history.

> Formerly known internally as TATs (Tool/Tenant Access Tokens).

**Flow:**

1. Create a vault (`client.beta.vaults.create(...)`) — one per tenant/user, or one shared, depending on your model
2. Add MCP credentials to it (`client.beta.vaults.credentials.create(...)`) — each credential is tied to one MCP server URL
3. Reference the vault on session create via `vault_ids: ["vlt_..."]`
4. Anthropic auto-refreshes tokens before they expire; the agent uses the current access token when calling MCP tools

**Credential shape**:

```json
{
  "display_name": "Notion (workspace-foo)",
  "auth": {
    "type": "mcp_oauth",
    "mcp_server_url": "https://mcp.notion.com/mcp",
    "access_token": "<current access token>",
    "expires_at": "2026-04-02T14:00:00Z",
    "refresh": {
      "refresh_token": "<refresh token>",
      "client_id": "<your OAuth client_id>",
      "token_endpoint": "https://api.notion.com/v1/oauth/token",
      "token_endpoint_auth": { "type": "none" }
    }
  }
}
```

The `refresh` block is what enables auto-refresh — `token_endpoint` is where Anthropic posts the `refresh_token` grant. `token_endpoint_auth` is a discriminated union:

| `type` | Shape | Use when |
|---|---|---|
| `"none"` | `{type: "none"}` | Public OAuth client (no secret) |
| `"client_secret_basic"` | `{type: "client_secret_basic", client_secret: "..."}` | Confidential client, secret via HTTP Basic auth |
| `"client_secret_post"` | `{type: "client_secret_post", client_secret: "..."}` | Confidential client, secret in request body |

Omit `refresh` entirely if you only have an access token with no refresh capability — it'll work until it expires, then the agent loses access.

> 💡 **Getting an OAuth token.** How you obtain the initial access and refresh tokens depends on the MCP server — consult its documentation. Once you have them, store them in a vault credential using the shape above; Anthropic auto-refreshes via the `refresh.token_endpoint` from there.

**Scoping:** Vaults are workspace-scoped. Anyone with developer+ role in the API workspace can create, read (metadata only — secrets are write-only), and attach vaults. `vault_ids` can be set at session **create** time but not via session update (the SDK docstring says "Not yet supported; requests setting this field are rejected").

---

## Skills

Skills are reusable, filesystem-based resources that provide your agent with domain-specific expertise: workflows, context, and best practices that transform general-purpose agents into specialists. Unlike prompts (conversation-level instructions for one-off tasks), skills load on-demand and eliminate the need to repeatedly provide the same guidance across multiple conversations.

Two types — both work the same way; the agent automatically uses them when relevant to the task at hand:

| Type | What it is |
|---|---|
| **Pre-built Anthropic skills** | Common document tasks (PowerPoint, Excel, Word, PDF). Reference by name (e.g. `xlsx`). |
| **Custom skills** | Skills you've created in your organization via the Skills API. Reference by `skill_id` + optional `version`. |

**Max 64 skills per agent.** Agent creation uses `managed-agents-2026-04-01`; the separate Skills API (for managing custom skill definitions) uses `skills-2025-10-02`.

### Enabling skills on a session

Skills are attached to the **agent** definition via `agents.create()`:

```ts
const agent = await client.beta.agents.create(
  {
    name: "Financial Agent",
    model: "claude-opus-4-7",
    system: "You are a financial analysis agent.",
    skills: [
      { type: "anthropic", skill_id: "xlsx" },
      { type: "custom", skill_id: "skill_abc123", version: "latest" },
    ],
  }
);
```

Python:

```python
agent = client.beta.agents.create(
    name="Financial Agent",
    model="claude-opus-4-7",
    system="You are a financial analysis agent.",
    skills=[
        {"type": "anthropic", "skill_id": "xlsx"},
        {"type": "custom", "skill_id": "skill_abc123", "version": "latest"},
    ]
)
```

**Skill reference fields:**

| Field | Anthropic skill | Custom skill |
|---|---|---|
| `type` | `"anthropic"` | `"custom"` |
| `skill_id` | Skill name (e.g. `"xlsx"`, `"docx"`, `"pptx"`, `"pdf"`) | Skill ID from Skills API (e.g. `"skill_abc123"`) |
| `version` | — | `"latest"` or a specific version number |

### Skills API

| Operation             | Method   | Path                                            |
| --------------------- | -------- | ----------------------------------------------- |
| Create Skill          | `POST`   | `/v1/skills`                                    |
| List Skills           | `GET`    | `/v1/skills`                                    |
| Get Skill             | `GET`    | `/v1/skills/{id}`                               |
| Delete Skill          | `DELETE` | `/v1/skills/{id}`                               |
| Create Version        | `POST`   | `/v1/skills/{id}/versions`                      |
| List Versions         | `GET`    | `/v1/skills/{id}/versions`                      |
| Get Version           | `GET`    | `/v1/skills/{id}/versions/{version}`            |
| Delete Version        | `DELETE` | `/v1/skills/{id}/versions/{version}`            |

