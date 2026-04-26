# Installing Karpathy Guidelines for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

## Installation

Just run the following command in your terminal:

```bash
 npm install karpathy-guidelines@git+https://github.com/forrestchang/andrej-karpathy-skills.git --prefix ~/.config/opencode
```

NOT NEED to estart OpenCode. That's it — the plugin auto-installs and registers the skill.

Verify by asking: "use skill tool to list skills"

## Usage

Use OpenCode's native `skill` tool:

```
use skill tool to list skills
use skill tool to load karpathy-guidelines
```

The guidelines will also be automatically injected into every session via bootstrap.

## What It Does

This plugin:

1. **Registers the skill** - Makes `karpathy-guidelines` available via the skill tool
2. **Injects bootstrap** - Adds behavioral guidelines to every session automatically

## The Four Principles

- **Think Before Coding** - Don't assume, surface tradeoffs, ask when unclear
- **Simplicity First** - Minimum code that solves the problem, nothing speculative
- **Surgical Changes** - Touch only what you must, clean up only your own mess
- **Goal-Driven Execution** - Define success criteria, loop until verified

## Updating

Updating

To update to the latest version, simply re-run the installation command:

```bash
npm install karpathy-guidelines@git+https://github.com/forrestchang/andrej-karpathy-skills.git --prefix ~/.config/opencode
```

The plugin will be updated to the latest commit. No need to modify opencode.json or restart OpenCode.

## Tool Mapping

When skills reference Claude Code tools:

- `TodoWrite` → `todowrite`
- `Task` with subagents → `@mention` syntax
- `Skill` tool → OpenCode's native `skill` tool
- File operations → your native tools

## Getting Help

- Report issues: <https://github.com/forrestchang/andrej-karpathy-skills/issues>
- Original project: <https://github.com/forrestchang/andrej-karpathy-skills>

