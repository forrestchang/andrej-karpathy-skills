# Managed Agents — Events & Steering

## Events

### Sending Events

Send events to a session via `POST /v1/sessions/{id}/events`.

| Event Type                | When to Send                                        |
| ------------------------- | --------------------------------------------------- |
| `user.message`            | Send a user message |
| `user.interrupt`          | Interrupt the agent while it's running |
| `user.tool_confirmation`  | Approve/deny a tool call (when `always_ask` policy) |
| `user.custom_tool_result` | Provide result for a custom tool call |

### Receiving Events

Two methods:

1. **Streaming (SSE)**: `GET /v1/sessions/{id}/events/stream` — real-time Server-Sent Events. **Long-lived** — the server sends periodic heartbeats to keep the connection alive.
2. **Polling**: `GET /v1/sessions/{id}/events` — paginated event list (query params: `limit` default 1000, `page`). **Returns immediately** — this is a plain paginated GET, not a long-poll.

All received events carry `id`, `type`, and `processed_at` (ISO 8601; `null` if not yet processed by the agent).

> ⚠️ **Robust polling (raw HTTP).** If you bypass the SDK and roll your own poll loop, don't rely on `requests` or `httpx` timeouts as wall-clock caps — they're **per-chunk** read timeouts, reset every time a byte arrives. A trickling response (heartbeats, a wedged chunked-encoding body, a misbehaving proxy) can keep the call blocked indefinitely even with `timeout=(5, 60)` or `httpx.Timeout(120)`. Neither library has a "total wall-clock" timeout built in. For a hard deadline: track `time.monotonic()` at the loop level and break/cancel if a single request exceeds your budget (e.g. via a watchdog thread, or `asyncio.wait_for()` around async httpx). **Prefer the SDK** — `client.beta.sessions.events.stream()` and `client.beta.sessions.events.list()` handle timeout + retry sanely.
>
> If `GET /v1/sessions/{id}/events` (paginated) ever hangs after headers, you've likely hit `GET /v1/sessions/{id}/events` by mistake or a server-side stall — report it; don't treat it as a client-config problem.

### Event Types (Received)

Event types use dot notation, grouped by namespace:

| Event Type | Description |
| --- | --- |
| `agent.message` | Agent text output |
| `agent.thinking` | Extended thinking blocks |
| `agent.tool_use` | Agent used a built-in tool (`agent_toolset_20260401`) |
| `agent.tool_result` | Result from a built-in tool |
| `agent.mcp_tool_use` | Agent used an MCP tool |
| `agent.mcp_tool_result` | Result from an MCP tool |
| `agent.custom_tool_use` | Agent invoked a custom tool — session goes idle, you respond with `user.custom_tool_result` |
| `agent.thread_context_compacted` | Conversation context was compacted |
| `session.status_idle` | Agent has finished the current task, and is awaiting input. It's either waiting for input to continue working via a `user.message` or blocked awaiting a `user.custom_tool_result` or `user.tool_confirmation`. The `stop_reason` attached contains more information about why the Agent has stopped working. |
| `session.status_running` | Session has starting running, and the Agent is actively doing work. |
| `session.status_rescheduled` | Session is (re)scheduling after a retryable error has occurred, ready to be picked up by the orchestration system. |
| `session.status_terminated` | Session has terminated, entering an irreversible and unusable state.  |
| `session.error` | Error occurred during processing |
| `span.model_request_start` | Model inference started |
| `span.model_request_end` | Model inference completed |

The stream also echoes back user-sent events (`user.message`, `user.interrupt`, `user.tool_confirmation`, `user.custom_tool_result`).

---

## Steering Patterns

Practical patterns for driving a session via the events surface.

### Stream-first ordering

**Open the stream before sending events.** The stream only delivers events that occur *after* it's opened — it does not replay current state or historical events. If you send a message first and open the stream second, early events (including fast status transitions) arrive buffered in a single batch and you lose the ability to react to them in real time.

```ts
// ✅ Correct — stream and send concurrently
const [response] = await Promise.all([
  streamEvents(sessionId),   // opens SSE connection
  sendMessage(sessionId, text),
]);

// ❌ Wrong — events before stream opens arrive as a single buffered batch
await sendMessage(sessionId, text);
const response = await streamEvents(sessionId);
```

**For full history,** use `GET /v1/sessions/{id}/events` (paginated list) — the stream only gives you live events from connection onward.

### Reconnecting after a dropped stream

**The SSE stream has no replay.** If your connection drops (httpx read timeout, network blip) and you reconnect, you only get events emitted *after* reconnection. Any events emitted during the gap are lost from the stream.

**The consolidation pattern:** on every (re)connect, overlap the stream with a history fetch and dedupe by event ID:

```python
def connect_with_consolidation(client, session_id):
    # 1. Open the SSE stream first
    stream = client.beta.sessions.events.stream(session_id=session_id)

    # 2. Fetch history to cover any gap
    history = client.beta.sessions.events.list(
        session_id=session_id,
    )

    # 3. Yield history first, then stream — dedupe by event.id
    seen = set()
    for ev in history.data:
        seen.add(ev.id)
        yield ev
    for ev in stream:
        if ev.id not in seen:
            seen.add(ev.id)
            yield ev
```

### Message queuing

**You don't have to wait for a response before sending the next message.** User events are queued server-side and processed in order. This is useful for chat bridges where the user sends rapid follow-ups:

```ts
// All three go into one session; agent processes them in order
await sendMessage(sessionId, "Summarize the README");
await sendMessage(sessionId, "Actually also check the CONTRIBUTING guide");
await sendMessage(sessionId, "And compare the two");
// Stream once — agent responds to all three as a coherent turn
```

Events can be sent up to the Session at any time. There is no need to wait on a specific session status to enqueue new events via `client.beta.sessions.events.send()`

### Interrupt

An `interrupt` event **jumps the queue** (ahead of any pending user messages) and forces the session into `idle`. Use this for "stop" / "nevermind" / "cancel" commands:

```ts
await client.beta.sessions.events.send(sessionId, {
  events: [{ type: 'interrupt' }],
});
```

The agent stops mid-task. It does not see the interrupt as a message — it just halts. Send a follow-up `user` event to explain what to do instead.

> **Note**: Interrupt events may have empty IDs in the current implementation. When troubleshooting, use the `processed_at` timestamp along with surrounding event IDs.

### Event payloads

some events carry useful metadata beyond the status change itself:

`session.status_idle` — includes a `stop_reason` field which elaborates on why the session stopped and what type of further action is required by the user.
```json
{
  "id": "sevt_456",
  "processed_at": "2026-04-07T04:27:43.197Z",
  "stop_reason": {
    "event_ids": [
      "sevt_123"
    ],
    "type": "requires_action"
  },
  "type": "status_idle"
}
```

`span.model_request_end` contains a `model_usage` field for cost tracking and efficiency analysis:

```json
{
  "type": "span.model_request_end",
  "id": "sevt_456",
  "is_error": false,
  "model_request_start_id": "sevt_123",
  "model_usage": {
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 6656,
    "input_tokens": 3571,
    "output_tokens": 727
  },
  "processed_at": "2026-04-07T04:11:32.189Z"
}
```

**`agent.thread_context_compacted`** — emitted when the conversation history was summarized to fit context. Includes `pre_compaction_tokens` so you know how much was squeezed:

```json
{
  "id": "sevt_abc123",
  "processed_at": "2026-03-24T14:05:15.787Z",
  "type": "agent.thread_context_compacted"
}
```

### Archive

When done with a session, archive it to free resources:

```ts
await client.beta.sessions.archive(sessionId);
```

> Archiving a **session** is routine cleanup — sessions are per-run and disposable. **Do not generalize this to agents or environments**: those are persistent, reusable resources, and archiving them is permanent (no unarchive; new sessions cannot reference them). See `shared/managed-agents-overview.md` → Common Pitfalls.


