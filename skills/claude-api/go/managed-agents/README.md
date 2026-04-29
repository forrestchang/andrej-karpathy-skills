# Managed Agents — Go

> **Bindings not shown here:** This README covers the most common managed-agents flows for Go. If you need a class, method, namespace, field, or behavior that isn't shown, WebFetch the Go SDK repo **or the relevant docs page** from `shared/live-sources.md` rather than guess. Do not extrapolate from cURL shapes or another language's SDK.

> **Agents are persistent — create once, reference by ID.** Store the agent ID returned by `agents.New` and pass it to every subsequent `sessions.New`; do not call `agents.New` in the request path. The Anthropic CLI is one convenient way to create agents and environments from version-controlled YAML — its URL is in `shared/live-sources.md`. The examples below show in-code creation for completeness; in production the create call belongs in setup, not in the request path.

## Installation

```bash
go get github.com/anthropics/anthropic-sdk-go
```

## Client Initialization

```go
import (
    "context"

    "github.com/anthropics/anthropic-sdk-go"
    "github.com/anthropics/anthropic-sdk-go/option"
)

// Default (uses ANTHROPIC_API_KEY env var)
client := anthropic.NewClient()

// Explicit API key
client := anthropic.NewClient(
    option.WithAPIKey("your-api-key"),
)

ctx := context.Background()
```

---

## Create an Environment

```go
environment, err := client.Beta.Environments.New(ctx, anthropic.BetaEnvironmentNewParams{
    Name: "my-dev-env",
    Config: anthropic.BetaCloudConfigParams{
        Networking: anthropic.BetaCloudConfigParamsNetworkingUnion{
            OfUnrestricted: &anthropic.UnrestrictedNetworkParam{},
        },
    },
})
if err != nil {
    panic(err)
}
fmt.Println(environment.ID) // env_...
```

---

## Create an Agent (required first step)

> ⚠️ **There is no inline agent config.** `Model`/`System`/`Tools` live on the agent object, not the session. Always start with `Beta.Agents.New()` — the session only takes `Agent: anthropic.BetaSessionNewParamsAgentUnion{OfString: anthropic.String(agent.ID)}` (or the typed `OfBetaManagedAgentsAgents` variant when you need a specific version).

### Minimal

```go
// 1. Create the agent (reusable, versioned)
agent, err := client.Beta.Agents.New(ctx, anthropic.BetaAgentNewParams{
    Name: "Coding Assistant",
    Model: anthropic.BetaManagedAgentsModelConfigParams{
        ID:   "claude-opus-4-7",
        Type: anthropic.BetaManagedAgentsModelConfigParamsTypeModelConfig,
    },
    System: anthropic.String("You are a helpful coding assistant."),
    Tools: []anthropic.BetaAgentNewParamsToolUnion{{
        OfAgentToolset20260401: &anthropic.BetaManagedAgentsAgentToolset20260401Params{
            Type: anthropic.BetaManagedAgentsAgentToolset20260401ParamsTypeAgentToolset20260401,
        },
    }},
})
if err != nil {
    panic(err)
}

// 2. Start a session
session, err := client.Beta.Sessions.New(ctx, anthropic.BetaSessionNewParams{
    Agent: anthropic.BetaSessionNewParamsAgentUnion{
        OfBetaManagedAgentsAgents: &anthropic.BetaManagedAgentsAgentParams{
            Type:    anthropic.BetaManagedAgentsAgentParamsTypeAgent,
            ID:      agent.ID,
            Version: anthropic.Int(agent.Version),
        },
    },
    EnvironmentID: environment.ID,
    Title:         anthropic.String("Quickstart session"),
})
if err != nil {
    panic(err)
}
fmt.Printf("Session ID: %s, status: %s\n", session.ID, session.Status)
```

### Updating an Agent

Updates create new versions; the agent object is immutable per version.

```go
updatedAgent, err := client.Beta.Agents.Update(ctx, agent.ID, anthropic.BetaAgentUpdateParams{
    Version: agent.Version,
    System:  anthropic.String("You are a helpful coding agent. Always write tests."),
})
if err != nil {
    panic(err)
}
fmt.Printf("New version: %d\n", updatedAgent.Version)

// List all versions
iter := client.Beta.Agents.Versions.ListAutoPaging(ctx, agent.ID, anthropic.BetaAgentVersionListParams{})
for iter.Next() {
    version := iter.Current()
    fmt.Printf("Version %d: %s\n", version.Version, version.UpdatedAt.Format(time.RFC3339))
}
if err := iter.Err(); err != nil {
    panic(err)
}

// Archive the agent
_, err = client.Beta.Agents.Archive(ctx, agent.ID, anthropic.BetaAgentArchiveParams{})
if err != nil {
    panic(err)
}
```

---

## Send a User Message

```go
_, err = client.Beta.Sessions.Events.Send(ctx, session.ID, anthropic.BetaSessionEventSendParams{
    Events: []anthropic.SendEventsParamsUnion{{
        OfUserMessage: &anthropic.BetaManagedAgentsUserMessageEventParams{
            Type: anthropic.BetaManagedAgentsUserMessageEventParamsTypeUserMessage,
            Content: []anthropic.BetaManagedAgentsUserMessageEventParamsContentUnion{{
                OfText: &anthropic.BetaManagedAgentsTextBlockParam{
                    Type: anthropic.BetaManagedAgentsTextBlockTypeText,
                    Text: "Review the auth module",
                },
            }},
        },
    }},
})
if err != nil {
    panic(err)
}
```

> 💡 **Stream-first:** Open the stream *before* (or concurrently with) sending the message. The stream only delivers events that occur after it opens — stream-after-send means early events arrive buffered in one batch. See [Steering Patterns](../../shared/managed-agents-events.md#steering-patterns).

---

## Stream Events (SSE)

```go
// Open the stream first, then send the user message
stream := client.Beta.Sessions.Events.StreamEvents(ctx, session.ID, anthropic.BetaSessionEventStreamParams{})
defer stream.Close()

if _, err := client.Beta.Sessions.Events.Send(ctx, session.ID, anthropic.BetaSessionEventSendParams{
    Events: []anthropic.SendEventsParamsUnion{{
        OfUserMessage: &anthropic.BetaManagedAgentsUserMessageEventParams{
            Type: anthropic.BetaManagedAgentsUserMessageEventParamsTypeUserMessage,
            Content: []anthropic.BetaManagedAgentsUserMessageEventParamsContentUnion{{
                OfText: &anthropic.BetaManagedAgentsTextBlockParam{
                    Type: anthropic.BetaManagedAgentsTextBlockTypeText,
                    Text: "Summarize the repo README",
                },
            }},
        },
    }},
}); err != nil {
    panic(err)
}

events:
for stream.Next() {
    switch event := stream.Current().AsAny().(type) {
    case anthropic.BetaManagedAgentsAgentMessageEvent:
        for _, block := range event.Content {
            fmt.Print(block.Text)
        }
    case anthropic.BetaManagedAgentsAgentToolUseEvent:
        fmt.Printf("\n[Using tool: %s]\n", event.Name)
    case anthropic.BetaManagedAgentsSessionStatusIdleEvent:
        break events
    case anthropic.BetaManagedAgentsSessionErrorEvent:
        fmt.Printf("\n[Error: %s]\n", event.Error.Message)
        break events
    }
}
if err := stream.Err(); err != nil {
    panic(err)
}
```

### Reconnecting and Tailing

When reconnecting mid-session, list past events first to dedupe, then tail live events:

```go
stream := client.Beta.Sessions.Events.StreamEvents(ctx, session.ID, anthropic.BetaSessionEventStreamParams{})
defer stream.Close()

// Stream is open and buffering. List history before tailing live.
seenEventIDs := map[string]struct{}{}
history := client.Beta.Sessions.Events.ListAutoPaging(ctx, session.ID, anthropic.BetaSessionEventListParams{})
for history.Next() {
    seenEventIDs[history.Current().ID] = struct{}{}
}
if err := history.Err(); err != nil {
    panic(err)
}

// Tail live events, skipping anything already seen
tail:
for stream.Next() {
    event := stream.Current()
    if _, seen := seenEventIDs[event.ID]; seen {
        continue
    }
    seenEventIDs[event.ID] = struct{}{}
    switch event := event.AsAny().(type) {
    case anthropic.BetaManagedAgentsAgentMessageEvent:
        for _, block := range event.Content {
            fmt.Print(block.Text)
        }
    case anthropic.BetaManagedAgentsSessionStatusIdleEvent:
        break tail
    }
}
if err := stream.Err(); err != nil {
    panic(err)
}
```

---

## Provide Custom Tool Result

> ℹ️ The Go managed-agents bindings for `user.custom_tool_result` are not yet documented in this skill or in the apps source examples. Refer to `shared/managed-agents-events.md` for the wire format and the `github.com/anthropics/anthropic-sdk-go` repository for the corresponding Go params types.

---

## Poll Events

```go
// Auto-paginating iterator
iter := client.Beta.Sessions.Events.ListAutoPaging(ctx, session.ID, anthropic.BetaSessionEventListParams{})
for iter.Next() {
    event := iter.Current()
    fmt.Printf("%s: %s\n", event.Type, event.ID)
}
if err := iter.Err(); err != nil {
    panic(err)
}
```

---

## Upload a File

```go
csvFile, err := os.Open("data.csv")
if err != nil {
    panic(err)
}
defer csvFile.Close()

file, err := client.Beta.Files.Upload(ctx, anthropic.BetaFileUploadParams{
    File: csvFile,
})
if err != nil {
    panic(err)
}
fmt.Printf("File ID: %s\n", file.ID)

// Mount in a session
session, err := client.Beta.Sessions.New(ctx, anthropic.BetaSessionNewParams{
    Agent: anthropic.BetaSessionNewParamsAgentUnion{
        OfString: anthropic.String(agent.ID),
    },
    EnvironmentID: environment.ID,
    Resources: []anthropic.BetaSessionNewParamsResourceUnion{{
        OfFile: &anthropic.BetaManagedAgentsFileResourceParams{
            Type:      anthropic.BetaManagedAgentsFileResourceParamsTypeFile,
            FileID:    file.ID,
            MountPath: anthropic.String("/workspace/data.csv"),
        },
    }},
})
if err != nil {
    panic(err)
}
```

### Add and Manage Resources on an Existing Session

```go
// Attach an additional file to an open session
resource, err := client.Beta.Sessions.Resources.Add(ctx, session.ID, anthropic.BetaSessionResourceAddParams{
    BetaManagedAgentsFileResourceParams: anthropic.BetaManagedAgentsFileResourceParams{
        Type:   anthropic.BetaManagedAgentsFileResourceParamsTypeFile,
        FileID: file.ID,
    },
})
if err != nil {
    panic(err)
}
fmt.Println(resource.ID) // "sesrsc_01ABC..."

// List resources on the session
listed, err := client.Beta.Sessions.Resources.List(ctx, session.ID, anthropic.BetaSessionResourceListParams{})
if err != nil {
    panic(err)
}
for _, entry := range listed.Data {
    fmt.Println(entry.ID, entry.Type)
}

// Detach a resource
if _, err := client.Beta.Sessions.Resources.Delete(ctx, resource.ID, anthropic.BetaSessionResourceDeleteParams{
    SessionID: session.ID,
}); err != nil {
    panic(err)
}
```

---

## List and Download Session Files

> ℹ️ Listing and downloading files an agent wrote during a session is not yet documented for Go in this skill or in the apps source examples. See `shared/managed-agents-events.md` and the `github.com/anthropics/anthropic-sdk-go` repository for the `Beta.Files.List` and `Beta.Files.Download` Go params types.

---

## Session Management

```go
// List environments
environments, err := client.Beta.Environments.List(ctx, anthropic.BetaEnvironmentListParams{})
if err != nil {
    panic(err)
}

// Retrieve a specific environment
env, err := client.Beta.Environments.Get(ctx, environment.ID, anthropic.BetaEnvironmentGetParams{})
if err != nil {
    panic(err)
}

// Archive an environment (read-only, existing sessions continue)
_, err = client.Beta.Environments.Archive(ctx, environment.ID, anthropic.BetaEnvironmentArchiveParams{})
if err != nil {
    panic(err)
}

// Delete an environment (only if no sessions reference it)
_, err = client.Beta.Environments.Delete(ctx, environment.ID, anthropic.BetaEnvironmentDeleteParams{})
if err != nil {
    panic(err)
}

// Delete a session
_, err = client.Beta.Sessions.Delete(ctx, session.ID, anthropic.BetaSessionDeleteParams{})
if err != nil {
    panic(err)
}
```

---

## MCP Server Integration

```go
// Agent declares MCP server (no auth here — auth goes in a vault)
agent, err := client.Beta.Agents.New(ctx, anthropic.BetaAgentNewParams{
    Name: "GitHub Assistant",
    Model: anthropic.BetaManagedAgentsModelConfigParams{
        ID:   "claude-opus-4-7",
        Type: anthropic.BetaManagedAgentsModelConfigParamsTypeModelConfig,
    },
    MCPServers: []anthropic.BetaManagedAgentsUrlmcpServerParams{{
        Type: anthropic.BetaManagedAgentsUrlmcpServerParamsTypeURL,
        Name: "github",
        URL:  "https://api.githubcopilot.com/mcp/",
    }},
    Tools: []anthropic.BetaAgentNewParamsToolUnion{
        {
            OfAgentToolset20260401: &anthropic.BetaManagedAgentsAgentToolset20260401Params{
                Type: anthropic.BetaManagedAgentsAgentToolset20260401ParamsTypeAgentToolset20260401,
            },
        },
        {
            OfMCPToolset: &anthropic.BetaManagedAgentsMCPToolsetParams{
                Type:          anthropic.BetaManagedAgentsMCPToolsetParamsTypeMCPToolset,
                MCPServerName: "github",
            },
        },
    },
})
if err != nil {
    panic(err)
}

// Session attaches vault(s) containing credentials for those MCP server URLs
session, err := client.Beta.Sessions.New(ctx, anthropic.BetaSessionNewParams{
    Agent: anthropic.BetaSessionNewParamsAgentUnion{
        OfBetaManagedAgentsAgents: &anthropic.BetaManagedAgentsAgentParams{
            Type:    anthropic.BetaManagedAgentsAgentParamsTypeAgent,
            ID:      agent.ID,
            Version: anthropic.Int(agent.Version),
        },
    },
    EnvironmentID: environment.ID,
    VaultIDs:      []string{vault.ID},
})
if err != nil {
    panic(err)
}
```

See `shared/managed-agents-tools.md` §Vaults for creating vaults and adding credentials.

---

## Vaults

```go
// Create a vault
vault, err := client.Beta.Vaults.New(ctx, anthropic.BetaVaultNewParams{
    DisplayName: "Alice",
    Metadata:    map[string]string{"external_user_id": "usr_abc123"},
})
if err != nil {
    panic(err)
}

// Add an OAuth credential
credential, err := client.Beta.Vaults.Credentials.New(ctx, vault.ID, anthropic.BetaVaultCredentialNewParams{
    DisplayName: anthropic.String("Alice's Slack"),
    Auth: anthropic.BetaVaultCredentialNewParamsAuthUnion{
        OfMCPOAuth: &anthropic.BetaManagedAgentsMCPOAuthCreateParams{
            Type:         anthropic.BetaManagedAgentsMCPOAuthCreateParamsTypeMCPOAuth,
            MCPServerURL: "https://mcp.slack.com/mcp",
            AccessToken:  "xoxp-...",
            ExpiresAt:    anthropic.Time(time.Date(2026, time.April, 15, 0, 0, 0, 0, time.UTC)),
            Refresh: anthropic.BetaManagedAgentsMCPOAuthRefreshParams{
                TokenEndpoint: "https://slack.com/api/oauth.v2.access",
                ClientID:      "1234567890.0987654321",
                Scope:         anthropic.String("channels:read chat:write"),
                RefreshToken:  "xoxe-1-...",
                TokenEndpointAuth: anthropic.BetaManagedAgentsMCPOAuthRefreshParamsTokenEndpointAuthUnion{
                    OfClientSecretPost: &anthropic.BetaManagedAgentsTokenEndpointAuthPostParam{
                        Type:         anthropic.BetaManagedAgentsTokenEndpointAuthPostParamTypeClientSecretPost,
                        ClientSecret: "abc123...",
                    },
                },
            },
        },
    },
})
if err != nil {
    panic(err)
}

// Rotate the credential (e.g., after a token refresh)
_, err = client.Beta.Vaults.Credentials.Update(ctx, credential.ID, anthropic.BetaVaultCredentialUpdateParams{
    VaultID: vault.ID,
    Auth: anthropic.BetaVaultCredentialUpdateParamsAuthUnion{
        OfMCPOAuth: &anthropic.BetaManagedAgentsMCPOAuthUpdateParams{
            Type:        anthropic.BetaManagedAgentsMCPOAuthUpdateParamsTypeMCPOAuth,
            AccessToken: anthropic.String("xoxp-new-..."),
            ExpiresAt:   anthropic.Time(time.Date(2026, time.May, 15, 0, 0, 0, 0, time.UTC)),
            Refresh: anthropic.BetaManagedAgentsMCPOAuthRefreshUpdateParams{
                RefreshToken: anthropic.String("xoxe-1-new-..."),
            },
        },
    },
})
if err != nil {
    panic(err)
}

// Archive a vault
_, err = client.Beta.Vaults.Archive(ctx, vault.ID, anthropic.BetaVaultArchiveParams{})
if err != nil {
    panic(err)
}
```

---

## GitHub Repository Integration

Mount a GitHub repository as a session resource (a vault holds the GitHub MCP credential):

```go
session, err := client.Beta.Sessions.New(ctx, anthropic.BetaSessionNewParams{
    Agent:         anthropic.BetaSessionNewParamsAgentUnion{OfString: anthropic.String(agent.ID)},
    EnvironmentID: environment.ID,
    VaultIDs:      []string{vault.ID},
    Resources: []anthropic.BetaSessionNewParamsResourceUnion{
        {
            OfGitHubRepository: &anthropic.BetaManagedAgentsGitHubRepositoryResourceParams{
                Type:               anthropic.BetaManagedAgentsGitHubRepositoryResourceParamsTypeGitHubRepository,
                URL:                "https://github.com/org/repo",
                MountPath:          anthropic.String("/workspace/repo"),
                AuthorizationToken: "ghp_your_github_token",
            },
        },
    },
})
if err != nil {
    panic(err)
}
```

Multiple repositories on the same session:

```go
resources := []anthropic.BetaSessionNewParamsResourceUnion{
    {
        OfGitHubRepository: &anthropic.BetaManagedAgentsGitHubRepositoryResourceParams{
            Type:               anthropic.BetaManagedAgentsGitHubRepositoryResourceParamsTypeGitHubRepository,
            URL:                "https://github.com/org/frontend",
            MountPath:          anthropic.String("/workspace/frontend"),
            AuthorizationToken: "ghp_your_github_token",
        },
    },
    {
        OfGitHubRepository: &anthropic.BetaManagedAgentsGitHubRepositoryResourceParams{
            Type:               anthropic.BetaManagedAgentsGitHubRepositoryResourceParamsTypeGitHubRepository,
            URL:                "https://github.com/org/backend",
            MountPath:          anthropic.String("/workspace/backend"),
            AuthorizationToken: "ghp_your_github_token",
        },
    },
}
```

Rotating a repository's authorization token:

```go
listed, err := client.Beta.Sessions.Resources.List(ctx, session.ID, anthropic.BetaSessionResourceListParams{})
if err != nil {
    panic(err)
}
repoResourceID := listed.Data[0].ID

_, err = client.Beta.Sessions.Resources.Update(ctx, repoResourceID, anthropic.BetaSessionResourceUpdateParams{
    SessionID:          session.ID,
    AuthorizationToken: "ghp_your_new_github_token",
})
if err != nil {
    panic(err)
}
```
