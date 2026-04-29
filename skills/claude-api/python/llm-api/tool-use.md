# Tool Use — Python

For conceptual overview (tool definitions, tool choice, tips), see [shared/tool-use-concepts.md](../../shared/tool-use-concepts.md).

## Tool Runner (Recommended)

**Beta:** The tool runner is in beta in the Python SDK.

Use the `@beta_tool` decorator to define tools as typed functions, then pass them to `client.beta.messages.tool_runner()`:

```python
import anthropic
from anthropic import beta_tool

client = anthropic.Anthropic()

@beta_tool
def get_weather(location: str, unit: str = "celsius") -> str:
    """Get current weather for a location.

    Args:
        location: City and state, e.g., San Francisco, CA.
        unit: Temperature unit, either "celsius" or "fahrenheit".
    """
    # Your implementation here
    return f"72°F and sunny in {location}"

# The tool runner handles the agentic loop automatically
runner = client.beta.messages.tool_runner(
    model="claude-opus-4-7",
    max_tokens=16000,
    tools=[get_weather],
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
)

# Each iteration yields a BetaMessage; iteration stops when Claude is done
for message in runner:
    print(message)
```

For async usage, use `@beta_async_tool` with `async def` functions.

**Key benefits of the tool runner:**

- No manual loop — the SDK handles calling tools and feeding results back
- Type-safe tool inputs via decorators
- Tool schemas are generated automatically from function signatures
- Iteration stops automatically when Claude has no more tool calls

---

## MCP Tool Conversion Helpers

**Beta.** Convert [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) tools, prompts, and resources to Anthropic API types for use with the tool runner. Requires `pip install anthropic[mcp]` (Python 3.10+).

> **Note:** The Claude API also supports an `mcp_servers` parameter that lets Claude connect directly to remote MCP servers. Use these helpers instead when you need local MCP servers, prompts, resources, or more control over the MCP connection.

### MCP Tools with Tool Runner

```python
from anthropic import AsyncAnthropic
from anthropic.lib.tools.mcp import async_mcp_tool
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

client = AsyncAnthropic()

async with stdio_client(StdioServerParameters(command="mcp-server")) as (read, write):
    async with ClientSession(read, write) as mcp_client:
        await mcp_client.initialize()

        tools_result = await mcp_client.list_tools()
        # tool_runner is sync — returns the runner, not a coroutine
        runner = client.beta.messages.tool_runner(
            model="claude-opus-4-7",
            max_tokens=16000,
            messages=[{"role": "user", "content": "Use the available tools"}],
            tools=[async_mcp_tool(t, mcp_client) for t in tools_result.tools],
        )
        async for message in runner:
            print(message)
```

For sync usage, use `mcp_tool` instead of `async_mcp_tool`.

### MCP Prompts

```python
from anthropic.lib.tools.mcp import mcp_message

prompt = await mcp_client.get_prompt(name="my-prompt")
response = await client.beta.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[mcp_message(m) for m in prompt.messages],
)
```

### MCP Resources as Content

```python
from anthropic.lib.tools.mcp import mcp_resource_to_content

resource = await mcp_client.read_resource(uri="file:///path/to/doc.txt")
response = await client.beta.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{
        "role": "user",
        "content": [
            mcp_resource_to_content(resource),
            {"type": "text", "text": "Summarize this document"},
        ],
    }],
)
```

### Upload MCP Resources as Files

```python
from anthropic.lib.tools.mcp import mcp_resource_to_file

resource = await mcp_client.read_resource(uri="file:///path/to/data.json")
uploaded = await client.beta.files.upload(file=mcp_resource_to_file(resource))
```

Conversion functions raise `UnsupportedMCPValueError` if an MCP value cannot be converted (e.g., unsupported content types like audio, unsupported MIME types).

---

## Manual Agentic Loop

Use this when you need fine-grained control over the loop (e.g., custom logging, conditional tool execution, human-in-the-loop approval):

```python
import anthropic

client = anthropic.Anthropic()
tools = [...]  # Your tool definitions
messages = [{"role": "user", "content": user_input}]

# Agentic loop: keep going until Claude stops calling tools
while True:
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=16000,
        tools=tools,
        messages=messages
    )

    # If Claude is done (no more tool calls), break
    if response.stop_reason == "end_turn":
        break

    # Server-side tool hit iteration limit; re-send to continue
    if response.stop_reason == "pause_turn":
        messages = [
            {"role": "user", "content": user_input},
            {"role": "assistant", "content": response.content},
        ]
        continue

    # Extract tool use blocks from the response
    tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

    # Append assistant's response (including tool_use blocks)
    messages.append({"role": "assistant", "content": response.content})

    # Execute each tool and collect results
    tool_results = []
    for tool in tool_use_blocks:
        result = execute_tool(tool.name, tool.input)  # Your implementation
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": tool.id,  # Must match the tool_use block's id
            "content": result
        })

    # Append tool results as a user message
    messages.append({"role": "user", "content": tool_results})

# Final response text
final_text = next(b.text for b in response.content if b.type == "text")
```

---

## Handling Tool Results

```python
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather in Paris?"}]
)

for block in response.content:
    if block.type == "tool_use":
        tool_name = block.name
        tool_input = block.input
        tool_use_id = block.id

        result = execute_tool(tool_name, tool_input)

        followup = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=16000,
            tools=tools,
            messages=[
                {"role": "user", "content": "What's the weather in Paris?"},
                {"role": "assistant", "content": response.content},
                {
                    "role": "user",
                    "content": [{
                        "type": "tool_result",
                        "tool_use_id": tool_use_id,
                        "content": result
                    }]
                }
            ]
        )
```

---

## Multiple Tool Calls

```python
tool_results = []

for block in response.content:
    if block.type == "tool_use":
        result = execute_tool(block.name, block.input)
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": result
        })

# Send all results back at once
if tool_results:
    followup = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=16000,
        tools=tools,
        messages=[
            *previous_messages,
            {"role": "assistant", "content": response.content},
            {"role": "user", "content": tool_results}
        ]
    )
```

---

## Error Handling in Tool Results

```python
tool_result = {
    "type": "tool_result",
    "tool_use_id": tool_use_id,
    "content": "Error: Location 'xyz' not found. Please provide a valid city name.",
    "is_error": True
}
```

---

## Tool Choice

```python
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    tools=tools,
    tool_choice={"type": "tool", "name": "get_weather"},  # Force specific tool
    messages=[{"role": "user", "content": "What's the weather in Paris?"}]
)
```

---

## Code Execution

### Basic Usage

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{
        "role": "user",
        "content": "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
    }],
    tools=[{
        "type": "code_execution_20260120",
        "name": "code_execution"
    }]
)

for block in response.content:
    if block.type == "text":
        print(block.text)
    elif block.type == "bash_code_execution_tool_result":
        print(f"stdout: {block.content.stdout}")
```

### Upload Files for Analysis

```python
# 1. Upload a file
uploaded = client.beta.files.upload(file=open("sales_data.csv", "rb"))

# 2. Pass to code execution via container_upload block
# Code execution is GA; Files API is still beta (pass via extra_headers)
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    extra_headers={"anthropic-beta": "files-api-2025-04-14"},
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Analyze this sales data. Show trends and create a visualization."},
            {"type": "container_upload", "file_id": uploaded.id}
        ]
    }],
    tools=[{"type": "code_execution_20260120", "name": "code_execution"}]
)
```

### Retrieve Generated Files

```python
import os

OUTPUT_DIR = "./claude_outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

for block in response.content:
    if block.type == "bash_code_execution_tool_result":
        result = block.content
        if result.type == "bash_code_execution_result" and result.content:
            for file_ref in result.content:
                if file_ref.type == "bash_code_execution_output":
                    metadata = client.beta.files.retrieve_metadata(file_ref.file_id)
                    file_content = client.beta.files.download(file_ref.file_id)
                    # Use basename to prevent path traversal; validate result
                    safe_name = os.path.basename(metadata.filename)
                    if not safe_name or safe_name in (".", ".."):
                        print(f"Skipping invalid filename: {metadata.filename}")
                        continue
                    output_path = os.path.join(OUTPUT_DIR, safe_name)
                    file_content.write_to_file(output_path)
                    print(f"Saved: {output_path}")
```

### Container Reuse

```python
# First request: set up environment
response1 = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{"role": "user", "content": "Install tabulate and create data.json with sample data"}],
    tools=[{"type": "code_execution_20260120", "name": "code_execution"}]
)

# Get container ID from response
container_id = response1.container.id

# Second request: reuse the same container
response2 = client.messages.create(
    container=container_id,
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{"role": "user", "content": "Read data.json and display as a formatted table"}],
    tools=[{"type": "code_execution_20260120", "name": "code_execution"}]
)
```

### Response Structure

```python
for block in response.content:
    if block.type == "text":
        print(block.text)  # Claude's explanation
    elif block.type == "server_tool_use":
        print(f"Running: {block.name} - {block.input}")  # What Claude is doing
    elif block.type == "bash_code_execution_tool_result":
        result = block.content
        if result.type == "bash_code_execution_result":
            if result.return_code == 0:
                print(f"Output: {result.stdout}")
            else:
                print(f"Error: {result.stderr}")
        else:
            print(f"Tool error: {result.error_code}")
    elif block.type == "text_editor_code_execution_tool_result":
        print(f"File operation: {block.content}")
```

---

## Memory Tool

### Basic Usage

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{"role": "user", "content": "Remember that my preferred language is Python."}],
    tools=[{"type": "memory_20250818", "name": "memory"}],
)
```

### SDK Memory Helper

Subclass `BetaAbstractMemoryTool`:

```python
from anthropic.lib.tools import BetaAbstractMemoryTool

class MyMemoryTool(BetaAbstractMemoryTool):
    def view(self, command): ...
    def create(self, command): ...
    def str_replace(self, command): ...
    def insert(self, command): ...
    def delete(self, command): ...
    def rename(self, command): ...

memory = MyMemoryTool()

# Use with tool runner
runner = client.beta.messages.tool_runner(
    model="claude-opus-4-7",
    max_tokens=16000,
    tools=[memory],
    messages=[{"role": "user", "content": "Remember my preferences"}],
)

for message in runner:
    print(message)
```

For full implementation examples, use WebFetch:

- `https://github.com/anthropics/anthropic-sdk-python/blob/main/examples/memory/basic.py`

---

## Structured Outputs

### JSON Outputs (Pydantic — Recommended)

```python
from pydantic import BaseModel
from typing import List
import anthropic

class ContactInfo(BaseModel):
    name: str
    email: str
    plan: str
    interests: List[str]
    demo_requested: bool

client = anthropic.Anthropic()

response = client.messages.parse(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{
        "role": "user",
        "content": "Extract: Jane Doe (jane@co.com) wants Enterprise, interested in API and SDKs, wants a demo."
    }],
    output_format=ContactInfo,
)

# response.parsed_output is a validated ContactInfo instance
contact = response.parsed_output
print(contact.name)           # "Jane Doe"
print(contact.interests)      # ["API", "SDKs"]
```

### Raw Schema

```python
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{
        "role": "user",
        "content": "Extract info: John Smith (john@example.com) wants the Enterprise plan."
    }],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "plan": {"type": "string"},
                    "demo_requested": {"type": "boolean"}
                },
                "required": ["name", "email", "plan", "demo_requested"],
                "additionalProperties": False
            }
        }
    }
)

import json
# output_config.format guarantees the first block is text with valid JSON
text = next(b.text for b in response.content if b.type == "text")
data = json.loads(text)
```

### Strict Tool Use

```python
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{"role": "user", "content": "Book a flight to Tokyo for 2 passengers on March 15"}],
    tools=[{
        "name": "book_flight",
        "description": "Book a flight to a destination",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "destination": {"type": "string"},
                "date": {"type": "string", "format": "date"},
                "passengers": {"type": "integer", "enum": [1, 2, 3, 4, 5, 6, 7, 8]}
            },
            "required": ["destination", "date", "passengers"],
            "additionalProperties": False
        }
    }]
)
```

### Using Both Together

```python
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    messages=[{"role": "user", "content": "Plan a trip to Paris next month"}],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "next_steps": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["summary", "next_steps"],
                "additionalProperties": False
            }
        }
    },
    tools=[{
        "name": "search_flights",
        "description": "Search for available flights",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "destination": {"type": "string"},
                "date": {"type": "string", "format": "date"}
            },
            "required": ["destination", "date"],
            "additionalProperties": False
        }
    }]
)
```
