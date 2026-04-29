# Claude API — C#

> **Note:** The C# SDK is the official Anthropic SDK for C#. Tool use is supported via the Messages API. A class-annotation-based tool runner is not available; use raw tool definitions with JSON schema. The SDK also supports Microsoft.Extensions.AI IChatClient integration with function invocation.

## Installation

```bash
dotnet add package Anthropic
```

## Client Initialization

```csharp
using Anthropic;

// Default (uses ANTHROPIC_API_KEY env var)
AnthropicClient client = new();

// Explicit API key (use environment variables — never hardcode keys)
AnthropicClient client = new() {
    ApiKey = Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY")
};
```

---

## Basic Message Request

```csharp
using Anthropic.Models.Messages;

var parameters = new MessageCreateParams
{
    Model = Model.ClaudeOpus4_6,
    MaxTokens = 16000,
    Messages = [new() { Role = Role.User, Content = "What is the capital of France?" }]
};
var response = await client.Messages.Create(parameters);

// ContentBlock is a union wrapper. .Value unwraps to the variant object,
// then OfType<T> filters to the type you want. Or use the TryPick* idiom
// shown in the Thinking section below.
foreach (var text in response.Content.Select(b => b.Value).OfType<TextBlock>())
{
    Console.WriteLine(text.Text);
}
```

---

## Streaming

```csharp
using Anthropic.Models.Messages;

var parameters = new MessageCreateParams
{
    Model = Model.ClaudeOpus4_6,
    MaxTokens = 64000,
    Messages = [new() { Role = Role.User, Content = "Write a haiku" }]
};

await foreach (RawMessageStreamEvent streamEvent in client.Messages.CreateStreaming(parameters))
{
    if (streamEvent.TryPickContentBlockDelta(out var delta) &&
        delta.Delta.TryPickText(out var text))
    {
        Console.Write(text.Text);
    }
}
```

**`RawMessageStreamEvent` TryPick methods** (naming drops the `Message`/`Raw` prefix): `TryPickStart`, `TryPickDelta`, `TryPickStop`, `TryPickContentBlockStart`, `TryPickContentBlockDelta`, `TryPickContentBlockStop`. There is no `TryPickMessageStop` — use `TryPickStop`.

---

## Thinking

**Adaptive thinking is the recommended mode for Claude 4.6+ models.** Claude decides dynamically when and how much to think.

```csharp
using Anthropic.Models.Messages;

var response = await client.Messages.Create(new MessageCreateParams
{
    Model = Model.ClaudeOpus4_6,
    MaxTokens = 16000,
    // ThinkingConfigParam? implicitly converts from the concrete variant classes —
    // no wrapper needed.
    Thinking = new ThinkingConfigAdaptive(),
    Messages =
    [
        new() { Role = Role.User, Content = "Solve: 27 * 453" },
    ],
});

// ThinkingBlock(s) precede TextBlock in Content. TryPick* narrows the union.
foreach (var block in response.Content)
{
    if (block.TryPickThinking(out ThinkingBlock? t))
    {
        Console.WriteLine($"[thinking] {t.Thinking}");
    }
    else if (block.TryPickText(out TextBlock? text))
    {
        Console.WriteLine(text.Text);
    }
}
```

> **Deprecated:** `new ThinkingConfigEnabled { BudgetTokens = N }` (fixed-budget extended thinking) still works on Claude 4.6 but is deprecated. Use adaptive thinking above.

Alternative to `TryPick*`: `.Select(b => b.Value).OfType<ThinkingBlock>()` (same LINQ pattern as the Basic Message example).

---

## Tool Use

### Defining a tool

`Tool` (NOT `ToolParam`) with an `InputSchema` record. `InputSchema.Type` is auto-set to `"object"` by the constructor — don't set it. `ToolUnion` has an implicit conversion from `Tool`, triggered by the collection expression `[...]`.

```csharp
using System.Text.Json;
using Anthropic.Models.Messages;

var parameters = new MessageCreateParams
{
    Model = Model.ClaudeSonnet4_6,
    MaxTokens = 16000,
    Tools = [
        new Tool {
            Name = "get_weather",
            Description = "Get the current weather in a given location",
            InputSchema = new() {
                Properties = new Dictionary<string, JsonElement> {
                    ["location"] = JsonSerializer.SerializeToElement(
                        new { type = "string", description = "City name" }),
                },
                Required = ["location"],
            },
        },
    ],
    Messages = [new() { Role = Role.User, Content = "Weather in Paris?" }],
};
```

Derived from `anthropic-sdk-csharp/src/Anthropic/Models/Messages/Tool.cs` and `ToolUnion.cs:799` (implicit conversion).

See [shared tool use concepts](../shared/tool-use-concepts.md) for the loop pattern.
### Converting response content to the follow-up assistant message

When echoing Claude's response back in the assistant turn, **there is no `.ToParam()` helper** — manually reconstruct each `ContentBlock` variant as its `*Param` counterpart. Do NOT use `new ContentBlockParam(block.Json)`: it compiles and serializes, but `.Value` stays `null` so `TryPick*`/`Validate()` fail (degraded JSON pass-through, not the typed path).

```csharp
using Anthropic.Models.Messages;

Message response = await client.Messages.Create(parameters);

// No .ToParam() — reconstruct per variant. Implicit conversions from each
// *Param type to ContentBlockParam mean no explicit wrapper.
List<ContentBlockParam> assistantContent = [];
List<ContentBlockParam> toolResults = [];
foreach (ContentBlock block in response.Content)
{
    if (block.TryPickText(out TextBlock? text))
    {
        assistantContent.Add(new TextBlockParam { Text = text.Text });
    }
    else if (block.TryPickThinking(out ThinkingBlock? thinking))
    {
        // Signature MUST be preserved — the API rejects tampering
        assistantContent.Add(new ThinkingBlockParam
        {
            Thinking = thinking.Thinking,
            Signature = thinking.Signature,
        });
    }
    else if (block.TryPickRedactedThinking(out RedactedThinkingBlock? redacted))
    {
        assistantContent.Add(new RedactedThinkingBlockParam { Data = redacted.Data });
    }
    else if (block.TryPickToolUse(out ToolUseBlock? toolUse))
    {
        // ToolUseBlock has required Caller; ToolUseBlockParam.Caller is optional — don't copy it
        assistantContent.Add(new ToolUseBlockParam
        {
            ID = toolUse.ID,
            Name = toolUse.Name,
            Input = toolUse.Input,
        });
        // Execute the tool; collect ONE result per tool_use block — the API
        // rejects the follow-up if any tool_use ID lacks a matching tool_result.
        string result = ExecuteYourTool(toolUse.Name, toolUse.Input);
        toolResults.Add(new ToolResultBlockParam
        {
            ToolUseID = toolUse.ID,
            Content = result,
        });
    }
}

// Follow-up: prior messages + assistant echo + user tool_result(s)
List<MessageParam> followUpMessages =
[
    .. parameters.Messages,
    new() { Role = Role.Assistant, Content = assistantContent },
    new() { Role = Role.User, Content = toolResults },
];
```

`ToolResultBlockParam` has no tuple constructor — use the object initializer. `Content` is a string-or-list union; a plain `string` implicitly converts.

---

## Context Editing / Compaction (Beta)

**Beta-namespace prefix is inconsistent** (source-verified against `src/Anthropic/Models/Beta/Messages/*.cs` @ 12.9.0). No prefix: `MessageCreateParams`, `MessageCountTokensParams`, `Role`. **Everything else has the `Beta` prefix**: `BetaMessageParam`, `BetaMessage`, `BetaContentBlock`, `BetaToolUseBlock`, all block param types. The unprefixed `Role` WILL collide with `Anthropic.Models.Messages.Role` if you import both namespaces (CS0104). Safest: import only Beta; if mixing, alias the beta `Role`:

```csharp
using Anthropic.Models.Beta.Messages;
using NonBeta = Anthropic.Models.Messages;  // only if you also need non-beta types
// Now: MessageCreateParams, BetaMessageParam, Role (beta's), NonBeta.Role (if needed)
```


`BetaMessage.Content` is `IReadOnlyList<BetaContentBlock>` — a 15-variant discriminated union. Narrow with `TryPick*`. **Response `BetaContentBlock` is NOT assignable to param `BetaContentBlockParam`** — there's no `.ToParam()` in C#. Round-trip by converting each block:

```csharp
using Anthropic.Models.Beta.Messages;

var betaParams = new MessageCreateParams   // no Beta prefix — one of only 2 unprefixed
{
    Model = Model.ClaudeOpus4_6,
    MaxTokens = 16000,
    Betas = ["compact-2026-01-12"],
    ContextManagement = new BetaContextManagementConfig
    {
        Edits = [new BetaCompact20260112Edit()],
    },
    Messages = messages,
};
BetaMessage resp = await client.Beta.Messages.Create(betaParams);

foreach (BetaContentBlock block in resp.Content)
{
    if (block.TryPickCompaction(out BetaCompactionBlock? compaction))
    {
        // Content is nullable — compaction can fail server-side
        Console.WriteLine($"compaction summary: {compaction.Content}");
    }
}

// Context-edit metadata lives on a separate nullable field
if (resp.ContextManagement is { } ctx)
{
    foreach (var edit in ctx.AppliedEdits)
        Console.WriteLine($"cleared {edit.ClearedInputTokens} tokens");
}

// ROUND-TRIP: BetaMessageParam.Content is BetaMessageParamContent (a string|list
// union). It implicit-converts from List<BetaContentBlockParam>, NOT from the
// response's IReadOnlyList<BetaContentBlock>. Convert each block:
List<BetaContentBlockParam> paramBlocks = [];
foreach (var b in resp.Content)
{
    if (b.TryPickText(out var t)) paramBlocks.Add(new BetaTextBlockParam { Text = t.Text });
    else if (b.TryPickCompaction(out var c)) paramBlocks.Add(new BetaCompactionBlockParam { Content = c.Content });
    // ... other variants as needed
}
messages.Add(new BetaMessageParam { Role = Role.Assistant, Content = paramBlocks });
```

All 15 `BetaContentBlock.TryPick*` variants: `Text`, `Thinking`, `RedactedThinking`, `ToolUse`, `ServerToolUse`, `WebSearchToolResult`, `WebFetchToolResult`, `CodeExecutionToolResult`, `BashCodeExecutionToolResult`, `TextEditorCodeExecutionToolResult`, `ToolSearchToolResult`, `McpToolUse`, `McpToolResult`, `ContainerUpload`, `Compaction`.

**`BetaToolUseBlock.Input` is `IReadOnlyDictionary<string, JsonElement>`** — index by key then call the `JsonElement` extractor:

```csharp
if (block.TryPickToolUse(out BetaToolUseBlock? tu))
{
    int a = tu.Input["a"].GetInt32();
    string s = tu.Input["name"].GetString()!;
}
```

---

## Effort Parameter

Effort is nested under `OutputConfig`, NOT a top-level property. `ApiEnum<string, Effort>` has an implicit conversion from the enum, so assign `Effort.High` directly.

```csharp
OutputConfig = new OutputConfig { Effort = Effort.High },
```

Values: `Effort.Low`, `Effort.Medium`, `Effort.High`, `Effort.Max`. Combine with `Thinking = new ThinkingConfigAdaptive()` for cost-quality control.

---

## Prompt Caching

`System` takes `MessageCreateParamsSystem?` — a union of `string` or `List<TextBlockParam>`. There is no `SystemTextBlockParam`; use plain `TextBlockParam`. The implicit conversion needs the concrete `List<TextBlockParam>` type (array literals won't convert). For placement patterns and the silent-invalidator audit checklist, see `shared/prompt-caching.md`.

```csharp
System = new List<TextBlockParam> {
    new() {
        Text = longSystemPrompt,
        CacheControl = new CacheControlEphemeral(),  // auto-sets Type = "ephemeral"
    },
},
```

Optional `Ttl` on `CacheControlEphemeral`: `new() { Ttl = Ttl.Ttl1h }` or `Ttl.Ttl5m`. `CacheControl` also exists on `Tool.CacheControl` and top-level `MessageCreateParams.CacheControl`.

Verify hits via `response.Usage.CacheCreationInputTokens` / `response.Usage.CacheReadInputTokens`.

---

## Token Counting

```csharp
MessageTokensCount result = await client.Messages.CountTokens(new MessageCountTokensParams {
    Model = Model.ClaudeOpus4_6,
    Messages = [new() { Role = Role.User, Content = "Hello" }],
});
long tokens = result.InputTokens;
```

`MessageCountTokensParams.Tools` uses a different union type (`MessageCountTokensTool`) than `MessageCreateParams.Tools` (`ToolUnion`) — if you're passing tools, the compiler will tell you when it matters.

---

## Structured Output

```csharp
OutputConfig = new OutputConfig {
    Format = new JsonOutputFormat {
        Schema = new Dictionary<string, JsonElement> {
            ["type"] = JsonSerializer.SerializeToElement("object"),
            ["properties"] = JsonSerializer.SerializeToElement(
                new { name = new { type = "string" } }),
            ["required"] = JsonSerializer.SerializeToElement(new[] { "name" }),
        },
    },
},
```

`JsonOutputFormat.Type` is auto-set to `"json_schema"` by the constructor. `Schema` is `required`.

---

## PDF / Document Input

`DocumentBlockParam` takes a `DocumentBlockParamSource` union: `Base64PdfSource` / `UrlPdfSource` / `PlainTextSource` / `ContentBlockSource`. `Base64PdfSource` auto-sets `MediaType = "application/pdf"` and `Type = "base64"`.

```csharp
new MessageParam {
    Role = Role.User,
    Content = new List<ContentBlockParam> {
        new DocumentBlockParam { Source = new Base64PdfSource { Data = base64String } },
        new TextBlockParam { Text = "Summarize this PDF" },
    },
}
```

---

## Server-Side Tools

Web search, bash, text editor, and code execution are built-in server tools. Type names are version-suffixed; constructors auto-set `name`/`type`. All implicit-convert to `ToolUnion`.

```csharp
Tools = [
    new WebSearchTool20260209(),
    new ToolBash20250124(),
    new ToolTextEditor20250728(),
    new CodeExecutionTool20260120(),
],
```

Also available: `WebFetchTool20260209`, `MemoryTool20250818`. `WebSearchTool20260209` optionals: `AllowedDomains`, `BlockedDomains`, `MaxUses`, `UserLocation`.

---

## Files API (Beta)

Files live under `client.Beta.Files` (namespace `Anthropic.Models.Beta.Files`). `BinaryContent` implicit-converts from `Stream` and `byte[]`.

```csharp
using Anthropic.Models.Beta.Files;
using Anthropic.Models.Beta.Messages;

FileMetadata meta = await client.Beta.Files.Upload(
    new FileUploadParams { File = File.OpenRead("doc.pdf") });

// Referencing the uploaded file requires Beta message types:
new BetaRequestDocumentBlock {
    Source = new BetaFileDocumentSource { FileID = meta.ID },
}
```

The non-beta `DocumentBlockParamSource` union has no file-ID variant — file references need `client.Beta.Messages.Create()`.
