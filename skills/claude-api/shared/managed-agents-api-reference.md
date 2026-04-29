# Managed Agents — Endpoint Reference

All endpoints require `x-api-key` and `anthropic-version: 2023-06-01` headers. Managed Agents endpoints additionally require the `anthropic-beta` header.

## Beta Headers

```
anthropic-beta: managed-agents-2026-04-01
```

The SDK adds this header automatically for all `client.beta.{agents,environments,sessions,vaults,memory_stores}.*` calls. Skills endpoints use `skills-2025-10-02`; Files endpoints use `files-api-2025-04-14`.

---

## SDK Method Reference

All resources are under the `beta` namespace. Python and TypeScript share identical method names.

| Resource | Python / TypeScript (`client.beta.*`) | Go (`client.Beta.*`) |
| --- | --- | --- |
| Agents | `agents.create` / `retrieve` / `update` / `list` / `archive` | `Agents.New` / `Get` / `Update` / `List` / `Archive` |
| Agent Versions | `agents.versions.list` | `Agents.Versions.List` |
| Environments | `environments.create` / `retrieve` / `update` / `list` / `delete` / `archive` | `Environments.New` / `Get` / `Update` / `List` / `Delete` / `Archive` |
| Sessions | `sessions.create` / `retrieve` / `update` / `list` / `delete` / `archive` | `Sessions.New` / `Get` / `Update` / `List` / `Delete` / `Archive` |
| Session Events | `sessions.events.list` / `send` / `stream` | `Sessions.Events.List` / `Send` / `StreamEvents` |
| Session Resources | `sessions.resources.add` / `retrieve` / `update` / `list` / `delete` | `Sessions.Resources.Add` / `Get` / `Update` / `List` / `Delete` |
| Vaults | `vaults.create` / `retrieve` / `update` / `list` / `delete` / `archive` | `Vaults.New` / `Get` / `Update` / `List` / `Delete` / `Archive` |
| Credentials | `vaults.credentials.create` / `retrieve` / `update` / `list` / `delete` / `archive` | `Vaults.Credentials.New` / `Get` / `Update` / `List` / `Delete` / `Archive` |
| Memory Stores | `memory_stores.create` / `retrieve` / `update` / `list` / `delete` / `archive` | `MemoryStores.New` / `Get` / `Update` / `List` / `Delete` / `Archive` |
| Memories | `memory_stores.memories.create` / `retrieve` / `update` / `list` / `delete` | `MemoryStores.Memories.New` / `Get` / `Update` / `List` / `Delete` |
| Memory Versions | `memory_stores.memory_versions.list` / `retrieve` / `redact` | `MemoryStores.MemoryVersions.List` / `Get` / `Redact` |

**Naming quirks to watch for:**
- Agents have **no delete** — only `archive`. Archive is **permanent**: the agent becomes read-only, new sessions cannot reference it, and there is no unarchive. Confirm with the user before archiving a production agent. Environments, Sessions, Vaults, Credentials, and Memory Stores have both `delete` and `archive`; Session Resources, Files, Skills, and Memories are `delete`-only; Memory Versions have neither — only `redact`.
- Session resources use `add` (not `create`).
- Go's event stream is `StreamEvents` (not `Stream`).

**Agent shorthand:** `agent` on session create accepts either a bare string (`agent="agent_abc123"` — uses latest version) or the full reference object (`{type: "agent", id: "agent_abc123", version: 123}`).

**Model shorthand:** `model` on agent create accepts either a bare string (`model="claude-opus-4-7"` — uses `standard` speed) or the full config object (`{type: "model_config", id: "claude-opus-4-6", speed: "fast"}`). Note: `speed: "fast"` is only supported on Opus 4.6.

---

## Agents

**Step one of every flow.** Sessions require a pre-created agent — there is no inline agent config under `managed-agents-2026-04-01`.

| Method   | Path                                             | Operation        | Description                              |
| -------- | ------------------------------------------------ | ---------------- | ---------------------------------------- |
| `GET` | `/v1/agents` | ListAgents | List agents |
| `POST` | `/v1/agents` | CreateAgent | Create a saved agent configuration |
| `GET` | `/v1/agents/{agent_id}` | GetAgent | Get agent details |
| `POST` | `/v1/agents/{agent_id}` | UpdateAgent | Update agent configuration |
| `POST` | `/v1/agents/{agent_id}/archive` | ArchiveAgent | Archive an agent. Makes it **read-only**; existing sessions continue, new sessions cannot reference it. No unarchive — this is the terminal state. |
| `GET` | `/v1/agents/{agent_id}/versions` | ListAgentVersions | List agent versions |

## Sessions

| Method   | Path                                             | Operation        | Description                              |
| -------- | ------------------------------------------------ | ---------------- | ---------------------------------------- |
| `GET` | `/v1/sessions` | ListSessions | List sessions (paginated) |
| `POST` | `/v1/sessions` | CreateSession | Create a new session |
| `GET` | `/v1/sessions/{session_id}` | GetSession | Get session details |
| `POST` | `/v1/sessions/{session_id}` | UpdateSession | Update session metadata/title |
| `DELETE` | `/v1/sessions/{session_id}` | DeleteSession | Delete a session |
| `POST` | `/v1/sessions/{session_id}/archive` | ArchiveSession | Archive a session |

## Events

| Method   | Path                                             | Operation        | Description                              |
| -------- | ------------------------------------------------ | ---------------- | ---------------------------------------- |
| `GET` | `/v1/sessions/{session_id}/events` | ListEvents | List events (polling, paginated) |
| `POST` | `/v1/sessions/{session_id}/events` | SendEvents | Send events (user message, tool result) |
| `GET` | `/v1/sessions/{session_id}/events/stream` | StreamEvents | Stream events via SSE |

## Session Resources

| Method   | Path                                                    | Operation        | Description                              |
| -------- | ------------------------------------------------------- | ---------------- | ---------------------------------------- |
| `GET` | `/v1/sessions/{session_id}/resources` | ListResources | List resources attached to session |
| `POST` | `/v1/sessions/{session_id}/resources` | AddResource | Attach `file` or `github_repository` resource (SDK method: `add`, not `create`). `memory_store` resources attach at session-create time only. |
| `GET` | `/v1/sessions/{session_id}/resources/{resource_id}` | GetResource | Get a single resource |
| `POST` | `/v1/sessions/{session_id}/resources/{resource_id}` | UpdateResource | Update resource |
| `DELETE` | `/v1/sessions/{session_id}/resources/{resource_id}` | DeleteResource | Remove resource from session |

## Environments

| Method   | Path                                                             | Operation            | Description                         |
| -------- | ---------------------------------------------------------------- | -------------------- | ----------------------------------- |
| `POST`   | `/v1/environments`                                     | CreateEnvironment    | Create environment                  |
| `GET`    | `/v1/environments`                                     | ListEnvironments     | List environments                   |
| `GET`    | `/v1/environments/{environment_id}`                    | GetEnvironment       | Get environment details             |
| `POST`   | `/v1/environments/{environment_id}`                    | UpdateEnvironment    | Update environment                  |
| `DELETE` | `/v1/environments/{environment_id}`                    | DeleteEnvironment    | Delete environment. Returns 204. |
| `POST`   | `/v1/environments/{environment_id}/archive`            | ArchiveEnvironment   | Archive environment. Makes it **read-only**; existing sessions continue, new sessions cannot reference it. No unarchive — this is the terminal state. |

## Vaults

Vaults store MCP credentials that Anthropic manages on your behalf — OAuth credentials with auto-refresh, or static bearer tokens. Attach to sessions via `vault_ids`. See `managed-agents-tools.md` §Vaults for the conceptual guide and credential shapes.

| Method   | Path                                             | Operation        | Description                              |
| -------- | ------------------------------------------------ | ---------------- | ---------------------------------------- |
| `POST`   | `/v1/vaults`                                     | CreateVault      | Create a vault                           |
| `GET`    | `/v1/vaults`                                     | ListVaults       | List vaults                              |
| `GET`    | `/v1/vaults/{vault_id}`                          | GetVault         | Get vault details                        |
| `POST`   | `/v1/vaults/{vault_id}`                          | UpdateVault      | Update vault                             |
| `DELETE` | `/v1/vaults/{vault_id}`                          | DeleteVault      | Delete vault                             |
| `POST`   | `/v1/vaults/{vault_id}/archive`                  | ArchiveVault     | Archive vault                            |

## Credentials

Credentials are individual secrets stored inside a vault.

| Method   | Path                                                              | Operation          | Description                  |
| -------- | ----------------------------------------------------------------- | ------------------ | ---------------------------- |
| `POST`   | `/v1/vaults/{vault_id}/credentials`                               | CreateCredential   | Create a credential          |
| `GET`    | `/v1/vaults/{vault_id}/credentials`                               | ListCredentials    | List credentials in vault    |
| `GET`    | `/v1/vaults/{vault_id}/credentials/{credential_id}`               | GetCredential      | Get credential metadata      |
| `POST`   | `/v1/vaults/{vault_id}/credentials/{credential_id}`               | UpdateCredential   | Update credential            |
| `DELETE` | `/v1/vaults/{vault_id}/credentials/{credential_id}`               | DeleteCredential   | Delete credential            |
| `POST`   | `/v1/vaults/{vault_id}/credentials/{credential_id}/archive`       | ArchiveCredential  | Archive credential           |

## Memory Stores

Workspace-scoped persistent memory that survives across sessions. Attach to a session via a `{"type": "memory_store", "memory_store_id": ...}` entry in `resources[]` (session-create time only). See `shared/managed-agents-memory.md` for the conceptual guide, the FUSE-mount agent interface, preconditions, and versioning.

| Method   | Path                                             | Operation          | Description                              |
| -------- | ------------------------------------------------ | ------------------ | ---------------------------------------- |
| `POST`   | `/v1/memory_stores`                              | CreateMemoryStore  | Create a store (`name`, `description`, `metadata`) |
| `GET`    | `/v1/memory_stores`                              | ListMemoryStores   | List stores (`include_archived`, `created_at_{gte,lte}`) |
| `GET`    | `/v1/memory_stores/{memory_store_id}`            | GetMemoryStore     | Get store details                        |
| `POST`   | `/v1/memory_stores/{memory_store_id}`            | UpdateMemoryStore  | Update store                             |
| `DELETE` | `/v1/memory_stores/{memory_store_id}`            | DeleteMemoryStore  | Delete store                             |
| `POST`   | `/v1/memory_stores/{memory_store_id}/archive`    | ArchiveMemoryStore | Archive store. Makes it **read-only**; existing sessions continue, new sessions cannot reference it. No unarchive. |

## Memories

Individual text documents inside a store (≤ 100KB each). `create` creates at a `path` and returns `409` (`memory_path_conflict_error`, with `conflicting_memory_id`) if the path is occupied; `update` mutates by `mem_...` ID (rename and/or content). Only `update` accepts a `precondition` (`{"type": "content_sha256", "content_sha256": ...}`) — on mismatch returns `409` (`memory_precondition_failed_error`). List endpoints accept `view: "basic"|"full"` (controls whether `content` is populated; `retrieve` defaults to `full`).

| Method   | Path                                                              | Operation      | Description                              |
| -------- | ----------------------------------------------------------------- | -------------- | ---------------------------------------- |
| `GET`    | `/v1/memory_stores/{memory_store_id}/memories`                    | ListMemories   | Returns `Memory \| MemoryPrefix`; filter by `path_prefix`, `depth`, `order_by`/`order` |
| `POST`   | `/v1/memory_stores/{memory_store_id}/memories`                    | CreateMemory   | Create at `path` (SDK: `memories.create`); `409 memory_path_conflict_error` if occupied |
| `GET`    | `/v1/memory_stores/{memory_store_id}/memories/{memory_id}`        | GetMemory      | Read one memory (defaults to `view="full"`) |
| `PATCH`  | `/v1/memory_stores/{memory_store_id}/memories/{memory_id}`        | UpdateMemory   | Change `content`, `path`, or both by ID; optional `precondition` |
| `DELETE` | `/v1/memory_stores/{memory_store_id}/memories/{memory_id}`        | DeleteMemory   | Delete (optional `expected_content_sha256`) |

## Memory Versions

Immutable per-mutation snapshots (`memver_...`) — the audit and rollback surface. `operation` ∈ `created` / `modified` / `deleted`.

| Method   | Path                                                                          | Operation             | Description                              |
| -------- | ----------------------------------------------------------------------------- | --------------------- | ---------------------------------------- |
| `GET`    | `/v1/memory_stores/{memory_store_id}/memory_versions`                         | ListMemoryVersions    | Newest-first; filter by `memory_id`, `operation`, `session_id`, `api_key_id`, `created_at_{gte,lte}` |
| `GET`    | `/v1/memory_stores/{memory_store_id}/memory_versions/{version_id}`            | GetMemoryVersion      | List fields + full `content`             |
| `POST`   | `/v1/memory_stores/{memory_store_id}/memory_versions/{version_id}/redact`     | RedactMemoryVersion   | Clear `content`/`content_sha256`/`content_size_bytes`/`path`; preserve actor + timestamps |

## Files

| Method   | Path                                             | Operation        | Description                              |
| -------- | ------------------------------------------------ | ---------------- | ---------------------------------------- |
| `POST`   | `/v1/files`                            | UploadFile       | Upload a file                            |
| `GET`    | `/v1/files`                            | ListFiles        | List files                               |
| `GET`    | `/v1/files/{file_id}`                  | GetFile          | Get file metadata (SDK method: `retrieve_metadata`) |
| `GET`    | `/v1/files/{file_id}/content`          | DownloadFile     | Download file content                    |
| `DELETE` | `/v1/files/{file_id}`                  | DeleteFile       | Delete a file                            |

## Skills

| Method   | Path                                                            | Operation          | Description                  |
| -------- | --------------------------------------------------------------- | ------------------ | ---------------------------- |
| `POST`   | `/v1/skills`                                          | CreateSkill        | Create a skill               |
| `GET`    | `/v1/skills`                                          | ListSkills         | List skills                  |
| `GET`    | `/v1/skills/{skill_id}`                               | GetSkill           | Get skill details            |
| `DELETE` | `/v1/skills/{skill_id}`                               | DeleteSkill        | Delete a skill               |
| `POST`   | `/v1/skills/{skill_id}/versions`                      | CreateVersion      | Create skill version         |
| `GET`    | `/v1/skills/{skill_id}/versions`                      | ListVersions       | List skill versions          |
| `GET`    | `/v1/skills/{skill_id}/versions/{version}`            | GetVersion         | Get skill version            |
| `DELETE` | `/v1/skills/{skill_id}/versions/{version}`            | DeleteVersion      | Delete skill version         |

---

## Request/Response Schema Quick Reference

### CreateAgent Request Body

**Always start here.** `model`, `system`, `tools`, `mcp_servers`, `skills` are top-level fields on this object — they do NOT go on the session.

```json
{
  "name": "string (required, 1-256 chars)",
  "model": "claude-opus-4-7 (required — bare string, or {id, speed} object)",
  "description": "string (optional, up to 2048 chars)",
  "system": "string (optional, up to 100,000 chars)",
  "tools": [
    { "type": "agent_toolset_20260401" }
  ],
  "skills": [
    { "type": "anthropic", "skill_id": "xlsx" },
    { "type": "custom", "skill_id": "skill_abc123", "version": "1" }
  ],
  "mcp_servers": [
    {
      "type": "url",
      "name": "github",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  ],
  "metadata": {
    "key": "value (max 16 pairs, keys ≤64 chars, values ≤512 chars)"
  }
}
```

> Limits: `tools` max 50, `skills` max 64, `mcp_servers` max 20 (unique names).

### CreateSession Request Body

```json
{
  "agent": "agent_abc123 (required — string shorthand for latest version, or {type: \"agent\", id, version} object)",
  "environment_id": "env_abc123 (required)",
  "title": "string (optional)",
  "resources": [
    {
      "type": "github_repository",
      "url": "https://github.com/owner/repo (required)",
      "authorization_token": "ghp_... (required)",
      "mount_path": "/workspace/repo (optional — defaults to /workspace/<repo-name>)",
      "checkout": { "type": "branch", "name": "main" }
    }
  ],
  "vault_ids": ["vlt_abc123 (optional — MCP credentials with auto-refresh)"],
  "metadata": {
    "key": "value"
  }
}
```

> The `agent` field accepts only a string ID or `{type: "agent", id, version}` — `model`/`system`/`tools` live on the agent, not here.
>
> **`checkout`** accepts `{type: "branch", name: "..."}` or `{type: "commit", sha: "..."}`. Omit for the repo's default branch.

### CreateEnvironment Request Body

```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "config": {
    "type": "cloud",
    "networking": {
      "type": "unrestricted | limited (union — see SDK types)"
    },
    "packages": { }
  },
  "metadata": { "key": "value" }
}
```

### SendEvents Request Body

```json
{
  "events": [
    {
      "type": "user.message",
      "content": [
        {
          "type": "text",
          "text": "Hello"
        }
      ]
    }
  ]
}
```

### Tool Result Event

```json
{
  "type": "user.custom_tool_result",
  "custom_tool_use_id": "sevt_abc123",
  "content": [{ "type": "text", "text": "Result data" }],
  "is_error": false
}
```

---

## Error Handling

Managed Agents endpoints use the standard Anthropic API error format. Errors are returned with an HTTP status code and a JSON body containing `type`, `error`, and `request_id`:

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "Description of what went wrong"
  },
  "request_id": "req_011CRv1W3XQ8XpFikNYG7RnE"
}
```

Include the `request_id` when reporting issues to Anthropic — it lets us trace the request end-to-end. The inner `error.type` is one of the following:

| Status | Error type | Description |
|---|---|---|
| 400 | `invalid_request_error` | The request was malformed or missing required parameters |
| 401 | `authentication_error` | Invalid or missing API key |
| 403 | `permission_error` | The API key doesn't have permission for this operation |
| 404 | `not_found_error` | The requested resource doesn't exist |
| 409 | `invalid_request_error` | The request conflicts with the resource's current state (e.g., sending to an archived session) |
| 413 | `request_too_large` | The request body exceeds the maximum allowed size |
| 429 | `rate_limit_error` | Too many requests — check rate limit headers for retry timing |
| 500 | `api_error` | An internal server error occurred |
| 529 | `overloaded_error` | The service is temporarily overloaded — retry with backoff |

Note that `409 Conflict` carries `error.type: "invalid_request_error"` (there is no separate `conflict_error` type); inspect both the HTTP status and the `message` to distinguish conflicts from other invalid requests.

---

## Rate Limits

Managed Agents endpoints have per-organization request-per-minute (RPM) limits, separate from your [Messages API token limits](https://platform.claude.com/docs/en/api/rate-limits). Model inference inside a session still draws from your organization's standard ITPM/OTPM limits.

| Endpoint group | Scope | RPM | Max concurrent |
|---|---|---|---|
| Create operations (Agents, Sessions, Vaults) | organization | 60 | — |
| All other operations (Agents, Sessions, Vaults) | organization | 600 | — |
| All operations (Environments) | organization | 60 | 5 |

Files and Skills endpoints use the standard tier-based [rate limits](https://platform.claude.com/docs/en/api/rate-limits).

When a limit is exceeded the API returns `429` with a `rate_limit_error` (see [Error Handling](#error-handling) for the response envelope) and a `retry-after` header indicating how many seconds to wait before retrying. The Anthropic SDK reads this header and retries automatically.
