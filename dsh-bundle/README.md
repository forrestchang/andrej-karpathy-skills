# DSH Skill: Andrej Karpathy Coding Guidelines

> Andrej Karpathy inspired coding guidelines as a DSH skill bundle. Reduces common LLM coding mistakes through four principles: Think Before Coding, Simplicity First, Surgical Changes, and Goal-Driven Execution.

## Installation

```bash
dsh plugin --profile web add dsh-skill-andrej-karpathy
```

Or install from GitHub:

```bash
dsh plugin --profile web add "github:multica-ai/andrej-karpathy-skills#<ref>&path:/dsh-bundle"
```

After installation, **restart DSH web** for the skill to take effect.

## Features

Installs a global skill `andrej-karpathy-coding-guidelines` that guides the agent to:

| Principle | What it does |
|-----------|-------------|
| **Think Before Coding** | Explicit assumptions, present interpretations, push back, ask when confused |
| **Simplicity First** | Minimum code, no speculative features, no unnecessary abstractions |
| **Surgical Changes** | Touch only what's needed, match existing style, clean up own orphans only |
| **Goal-Driven Execution** | Define verifiable success criteria, test-first, loop until verified |

## Development

### Local Testing

```bash
cd dsh-bundle
dsh plugin --profile web add .
```

### File Structure

```
dsh-bundle/
├── package.json          # npm package + dsh.bundle/dsh.skills declarations
├── cordis.patch.yml      # Bundle patch: inserts skill-filesystem provider
├── index.mjs             # Node half entry (Cordis plugin)
└── skills/
    └── andrej-karpathy-coding-guidelines/
        └── SKILL.md      # Skill content
```

## License

MIT
