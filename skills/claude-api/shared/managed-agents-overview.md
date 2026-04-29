# Managed Agents — Overview

Managed Agents provisions a container per session as the agent's workspace. The agent loop runs on Anthropic's orchestration layer; the container is where the agent's *tools* execute — bash commands, file operations, code. You create a persisted **Agent** config (model, system prompt, tools, MCP servers, skills), then start **Sessions** that reference it. The session streams events back to you; you send user messages and tool results in.

## ⚠️ THE MANDATORY FLOW: Agent (once) → Session (every run)

**Why agents are separate objects: versioning.** An agent is a persisted, versioned config — every update creates a new immutable version, and sessions pin to a version at creation time. This lets you iterate on the agent (tweak the prompt, add a tool) without breaking sessions already running, roll back if a change regresses, and A/B test versions side-by-side. None of that works if you `agents.create()` fresh on every run.

Every session references a pre-created `/v1/agents` object. Create the agent once, store the ID, and reuse it across runs.

| Step | Call | Frequency |
|---|---|---|
| 1 | `POST /v1/agents` — `model`, `system`, `tools`, `mcp_servers`, `skills` live here | **ONCE.** Store `agent.id` **and** `agent.version`. |
| 2 | `POST /v1/sessions` — `agent: "agent_abc123"` or `{type: "agent", id, version}` | **Every run.** String shorthand uses latest version. |

If you're about to write `sessions.create()` with `model`, `system`, or `tools` on the session body — **stop**. Those fields live on `agents.create()`. The session takes a *pointer* only.

**When generating code, separate setup from runtime.** `agents.create()` belongs in a setup script (or a guarded `if agent_id is None:` block), not at the top of the hot path. If the user's code calls `agents.create()` on every invocation, they're accumulating orphaned agents and paying the create latency for nothing. The correct shape is: create once → persist the ID (config file, env var, secrets manager) → every run loads the ID and calls `sessions.create()`.

**To change the agent's behavior, use `POST /v1/agents/{id}` — don't create a new one.** Each update bumps the version; running sessions keep their pinned version, new sessions get the latest (or pin explicitly via `{type: "agent", id, version}`). See `shared/managed-agents-core.md` → Agents → Versioning.

## Beta Headers

Managed Agents is in beta. The SDK sets required beta headers automatically:

| Beta Header                    | What it enables                                      |
| ------------------------------ | ---------------------------------------------------- |
| `managed-agents-2026-04-01`    | Agents, Environments, Sessions, Events, Session Resources, Vaults, Credentials, Memory Stores |
| `skills-2025-10-02`            | Skills API (for managing custom skill definitions)   |
| `files-api-2025-04-14`         | Files API for file uploads                           |

**Which beta header goes where:** The SDK sets `managed-agents-2026-04-01` automatically on `client.beta.{agents,environments,sessions,vaults,memory_stores}.*` calls, and `files-api-2025-04-14` / `skills-2025-10-02` automatically on `client.beta.files.*` / `client.beta.skills.*` calls. You do NOT need to add the Skills or Files beta header when calling Managed Agents endpoints. **Exception — session-scoped file listing:** `client.beta.files.list({scope_id: session.id})` is a Files endpoint that takes a Managed Agents parameter, so it needs **both** headers. Pass `betas: ["managed-agents-2026-04-01"]` explicitly on that call (the SDK adds the Files header; you add the Managed Agents one). See `shared/managed-agents-environments.md` → Session outputs.


## Reading Guide

| User wants to...                       | Read these files                                        |
| -------------------------------------- | ------------------------------------------------------- |
| **Get started from scratch / "help me set up an agent"** | `shared/managed-agents-onboarding.md` — guided interview (WHERE→WHO→WHAT→WATCH), then emit code |
| Understand how the API works           | `shared/managed-agents-core.md`                         |
| See the full endpoint reference        | `shared/managed-agents-api-reference.md`                |
| **Create an agent** (required first step) | `shared/managed-agents-core.md` (Agents section) + language file |
| Update/version an agent                | `shared/managed-agents-core.md` (Agents → Versioning) — update, don't re-create |
| Create a session                       | `shared/managed-agents-core.md` + `{lang}/managed-agents/README.md` |
| Configure tools and permissions        | `shared/managed-agents-tools.md`                        |
| Set up MCP servers                     | `shared/managed-agents-tools.md` (MCP Servers section)  |
| Stream events / handle tool_use        | `shared/managed-agents-events.md` + language file       |
| Set up environments                    | `shared/managed-agents-environments.md` + language file |
| Upload files / attach repos            | `shared/managed-agents-environments.md` (Resources)     |
| Give agents persistent memory across sessions | `shared/managed-agents-memory.md` — memory stores, `memory_store` session resource, preconditions, versions/redact |
| Store MCP credentials                  | `shared/managed-agents-tools.md` (Vaults section)       |
| Call a non-MCP API / CLI that needs a secret | `shared/managed-agents-client-patterns.md` Pattern 9 — no container env vars; vaults are MCP-only; keep the secret host-side via a custom tool |

## Common Pitfalls

- **Agent FIRST, then session — NO EXCEPTIONS** — the session's `agent` field accepts **only** a string ID or `{type: "agent", id, version}`. `model`, `system`, `tools`, `mcp_servers`, `skills` are **top-level fields on `POST /v1/agents`**, never on `sessions.create()`. If the user hasn't created an agent, that is step zero of every example.
- **Agent ONCE, not every run** — `agents.create()` is a setup step. Store the returned `agent_id` and reuse it; don't call `agents.create()` at the top of your hot path. If the agent's config needs to change, `POST /v1/agents/{id}` — each update creates a new version, and sessions can pin to a specific version for reproducibility.
- **MCP auth goes through vaults** — the agent's `mcp_servers` array declares `{type, name, url}` only (no auth). Credentials live in vaults (`client.beta.vaults.credentials.create`) and attach to sessions via `vault_ids`. Anthropic auto-refreshes OAuth tokens using the stored refresh token.
- **Stream to get events** — `GET /v1/sessions/{id}/events/stream` is the primary way to receive agent output in real-time.
- **SSE stream has no replay — reconnect with consolidation** — if the stream drops while a `agent.tool_use`, `agent.mcp_tool_use`, or `agent.custom_tool_use` is pending resolution (`user.tool_confirmation` for the first two, `user.custom_tool_result` for the last one), the session deadlocks (client disconnects → session idles → reconnect happens → no client resolution happens). On every (re)connect: open stream with `GET /v1/sessions/{id}/events/stream` , fetch `GET /v1/sessions/{id}/events`, dedupe by event ID, then proceed. See `shared/managed-agents-events.md` → Reconnecting after a dropped stream.
- **Don't trust HTTP-library timeouts as wall-clock caps** — `requests` `timeout=(c, r)` and `httpx.Timeout(n)` are *per-chunk* read timeouts; they reset every byte, so a trickling connection can block indefinitely. For a hard deadline on raw-HTTP polling, track `time.monotonic()` at the loop level and bail explicitly. Prefer the SDK's `sessions.events.stream()` / `session.events.list()` over hand-rolled HTTP. See `shared/managed-agents-events.md` → Receiving Events.
- **Messages queue** — you can send events while the session is `running` or `idle`; they're processed in order. No need to wait for a response before sending the next message.
- **Cloud environments only** — `config.type: "cloud"` is the only supported environment type.
- **Archive is permanent on every resource** — archiving an agent, environment, session, vault, credential, or memory store makes it read-only with no unarchive. For agents, environments, and memory stores specifically, archived resources cannot be referenced by new sessions (existing sessions continue). Do not call `.archive()` on a production agent, environment, or memory store as cleanup — **always confirm with the user before archiving**.
