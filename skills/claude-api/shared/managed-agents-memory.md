# Managed Agents — Memory Stores

> **Public beta.** Memory stores ship under the `managed-agents-2026-04-01` beta header; the SDK sets it automatically on all `client.beta.memory_stores.*` calls. If `client.beta.memory_stores` is missing, upgrade to the latest SDK release.

Sessions are ephemeral by default — when one ends, anything the agent learned is gone. A **memory store** is a workspace-scoped collection of small text documents that persists across sessions. When a store is attached to a session (via `resources[]`), it is mounted into the container as a filesystem directory; the agent reads and writes it with the ordinary file tools, and a system-prompt note tells it the mount is there.

Every mutation to a memory produces an immutable **memory version** (`memver_...`), giving you an audit trail and point-in-time rollback/redact.

## Object model

| Object | ID prefix | Scope | Notes |
| --- | --- | --- | --- |
| Memory store | `memstore_...` | Workspace | Attach to sessions via `resources[]` |
| Memory | `mem_...` | Store | One text file, addressed by `path` (≤ 100KB each — prefer many small files) |
| Memory version | `memver_...` | Memory | Immutable snapshot per mutation; `operation` ∈ `created` / `modified` / `deleted` |

## Create a store

`description` is passed to the agent so it knows what the store contains — write it for the model, not for humans.

```python
store = client.beta.memory_stores.create(
    name="User Preferences",
    description="Per-user preferences and project context.",
)
print(store.id)  # memstore_01Hx...
```

Other SDKs: TypeScript `client.beta.memoryStores.create({...})`; Go `client.Beta.MemoryStores.New(ctx, ...)`. See `shared/managed-agents-api-reference.md` → SDK Method Reference for the full per-language table.

Stores support `retrieve` / `update` / `list` (with `include_archived`, `created_at_{gte,lte}` filters) / `delete` / **`archive`**. Archive makes the store read-only — existing session attachments continue, new sessions cannot reference it; no unarchive.

### Seed with content (optional)

Pre-load reference material before any session runs. `memories.create` creates a memory at the given `path`; if a memory already exists there the call returns `409` (`memory_path_conflict_error`, with the `conflicting_memory_id`). The store ID is the first positional argument.

```python
client.beta.memory_stores.memories.create(
    store.id,
    path="/formatting_standards.md",
    content="All reports use GAAP formatting. Dates are ISO-8601...",
)
```

## Attach to a session

Memory stores go in the session's `resources[]` array alongside `file` and `github_repository` resources (see `shared/managed-agents-environments.md` → Resources). Memory stores attach at **session create time only** — `sessions.resources.add()` does not accept `memory_store`.

```python
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    resources=[
        {
            "type": "memory_store",
            "memory_store_id": store.id,
            "access": "read_write",  # or "read_only"; default is "read_write"
            "instructions": "User preferences and project context. Check before starting any task.",
        }
    ],
)
```

| Field | Required | Notes |
| --- | --- | --- |
| `type` | ✅ | `"memory_store"` |
| `memory_store_id` | ✅ | `memstore_...` |
| `access` | — | `"read_write"` (default) or `"read_only"` — enforced at the filesystem level on the mount |
| `instructions` | — | Session-specific guidance for this store, in addition to the store's `name`/`description`. ≤ 4,096 chars. |

**Max 8 memory stores per session.** Attach multiple when different slices of memory have different owners or lifecycles — e.g. one read-only shared-reference store plus one read-write per-user store, or one store per end-user/team/project sharing a single agent config.

### How the agent sees it (FUSE mount)

Each attached store is mounted in the session container at `/mnt/memory/<store-name>/`. The agent interacts with it using the standard file tools (`bash`, `read`, `write`, `edit`, `glob`, `grep`) — there are no dedicated memory tools. `access: "read_only"` makes the mount read-only at the filesystem level; `"read_write"` allows the agent to create, edit, and delete files under it. A short description of each mount (name, path, `instructions`, access) is automatically injected into the system prompt so the agent knows the store exists without you having to mention it.

Writes the agent makes under the mount are persisted back to the store and produce memory versions just like host-side `memories.update` calls.

## Manage memories directly (host-side)

Use these for review workflows, correcting bad memories, or seeding stores out-of-band.

### List

Returns `Memory | MemoryPrefix` entries — a `MemoryPrefix` (`type: "memory_prefix"`, just a `path`) is a directory-like node when listing hierarchically. Use `path_prefix` to scope (include a trailing slash: `"/notes/"` matches `/notes/a.md` but not `/notes_backup/old.md`) and `depth` to bound the tree walk. `order_by` / `order` sort the result. Pass `view="full"` to include `content` in each item; the default `"basic"` returns metadata only.

```python
for m in client.beta.memory_stores.memories.list(store.id, path_prefix="/"):
    if m.type == "memory":
        print(f"{m.path}  ({m.content_size_bytes} bytes, sha={m.content_sha256[:8]})")
    else:  # "memory_prefix"
        print(f"{m.path}/")
```

### Read

```python
mem = client.beta.memory_stores.memories.retrieve(memory_id, memory_store_id=store.id)
print(mem.content)
```

`retrieve` defaults to `view="full"` (content included); `view` matters mainly on list endpoints.

### Create vs. update

| Operation | Addressed by | Semantics |
| --- | --- | --- |
| `memories.create(store_id, path=..., content=...)` | **Path** | Create at `path`. `409` (`memory_path_conflict_error`, includes `conflicting_memory_id`) if the path is already occupied. |
| `memories.update(mem_id, memory_store_id=..., path=..., content=...)` | **`mem_...` ID** | Mutate existing memory. Change `content`, `path` (rename), or both. Renaming onto an occupied path returns the same `409 memory_path_conflict_error`. |

```python
mem = client.beta.memory_stores.memories.create(
    store.id,
    path="/preferences/formatting.md",
    content="Always use tabs, not spaces.",
)

client.beta.memory_stores.memories.update(
    mem.id,
    memory_store_id=store.id,
    path="/archive/2026_q1_formatting.md",  # rename
)
```

### Optimistic concurrency (precondition on `update`)

`memories.update` accepts a `precondition` so you can read → modify → write back without clobbering a concurrent writer. The only supported type is `content_sha256`. On mismatch the API returns `409` (`memory_precondition_failed_error`) — re-read and retry against fresh state.

```python
client.beta.memory_stores.memories.update(
    mem.id,
    memory_store_id=store.id,
    content="CORRECTED: Always use 2-space indentation.",
    precondition={"type": "content_sha256", "content_sha256": mem.content_sha256},
)
```

### Delete

```python
client.beta.memory_stores.memories.delete(mem.id, memory_store_id=store.id)
```

Pass `expected_content_sha256` for a conditional delete.

## Audit and rollback — memory versions

Every mutation creates an immutable `memver_...` snapshot. Versions accumulate for the lifetime of the parent memory; `memories.retrieve` always returns the current head, the version endpoints give you history.

| Operation that triggers it | `operation` field on the version |
| --- | --- |
| `memories.create` at a new path | `"created"` |
| `memories.update` changing `content`, `path`, or both (or an agent-side write to the mount) | `"modified"` |
| `memories.delete` | `"deleted"` |

Each version also records `created_by` — an actor object with `type` ∈ `session_actor` / `api_actor` / `user_actor` — and, after redaction, `redacted_at` + `redacted_by`.

### List versions

Newest-first, paginated. Filter by `memory_id`, `operation`, `session_id`, `api_key_id`, or `created_at_gte` / `created_at_lte`. Pass `view="full"` to include `content`; default is metadata-only.

```python
for v in client.beta.memory_stores.memory_versions.list(store.id, memory_id=mem.id):
    print(f"{v.id}: {v.operation}")
```

### Retrieve a version

```python
version = client.beta.memory_stores.memory_versions.retrieve(
    version_id, memory_store_id=store.id
)
print(version.content)
```

### Redact a version

Scrubs content from a historical version while preserving the audit trail (actor + timestamps). Clears `content`, `content_sha256`, `content_size_bytes`, and `path`; everything else stays. Use for leaked secrets, PII, or user-deletion requests.

```python
client.beta.memory_stores.memory_versions.redact(version_id, memory_store_id=store.id)
```

## Endpoint reference

See `shared/managed-agents-api-reference.md` → Memory Stores / Memories / Memory Versions for the full HTTP method/path tables. Raw HTTP base path:

```
POST   /v1/memory_stores
POST   /v1/memory_stores/{memory_store_id}/archive
GET    /v1/memory_stores/{memory_store_id}/memories
PATCH  /v1/memory_stores/{memory_store_id}/memories/{memory_id}
GET    /v1/memory_stores/{memory_store_id}/memory_versions
POST   /v1/memory_stores/{memory_store_id}/memory_versions/{version_id}/redact
```

For cURL examples and the CLI (`ant beta:memory-stores ...`), WebFetch the Memory URL in `shared/live-sources.md` → Managed Agents.
