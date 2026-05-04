import re

# Read both files
with open('README.md', 'r', encoding='utf-8') as f:
    en_content = f.read()
with open('README.zh.md', 'r', encoding='utf-8') as f:
    zh_content = f.read()

# English sections that need to be added to Chinese
en_principles_detail_marker = "## The Solution\n\nFour principles that directly address these issues:"
zh_principles_detail_marker = "## 解决方案\n\n四个原则，集中在一个文件中，直接解决这些问题："

# Extract the detailed principles section from zh_content
zh_principles_detail = re.search(r'(## 四个原则详解.*?)(?=## 安装)', zh_content, flags=re.DOTALL)
if zh_principles_detail:
    zh_detail_text = zh_principles_detail.group(1)
    
    # Translate and adapt for English
    en_detail_text = """## The Four Principles in Detail

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Present tradeoffs.**

LLMs often silently choose an interpretation and run with it. This principle forces explicit reasoning:
- **State assumptions explicitly** - If unsure, ask instead of guessing
- **Present interpretations** - When ambiguous, don't silently pick one
- **Push back** - If there's a simpler way, say so
- **Stop on confusion** - Point out what's unclear and demand clarification

### 2. Simplicity First
**Solve the problem with the least code. Don't over-speculate.**

Combats the tendency to over-engineer:
- Do not add unrequested features
- Do not create abstractions for one-off code
- Do not add unasked "flexibility" or "configurability"
- Do not add error handling for impossible scenarios
- If 200 lines can be written in 50, rewrite it

**Test:** Would a senior engineer roll their eyes at the complexity? If yes, simplify.

### 3. Surgical Changes
**Touch only what must be touched. Clean up only your own messes.**

When editing existing code:
- Do not "improve" adjacent code, comments, or formatting
- Do not refactor what isn't broken
- Match existing style even if you prefer differently
- If you notice unrelated dead code, mention it — do not delete it

When your changes create orphans:
- DO delete imports/variables/functions made useless by your change
- DO NOT delete pre-existing dead code unless asked

**Test:** Every changed line should directly trace back to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop to verify until met.**

Turn imperative tasks into verifiable goals:

| Don't do this... | Turn it into... |
|------------------|-----------------|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces the bug, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after refactoring" |

For multi-step tasks, state a short plan:
```
1. [Step] -> Verify: [Check]
2. [Step] -> Verify: [Check]
3. [Step] -> Verify: [Check]
```

Strong success criteria let the LLM run autonomous loops. Weak criteria ("make it work") require constant clarification.

"""
    
    # Insert en_detail_text into README.md before "## Installation and Usage by Agent"
    en_content = re.sub(r'(## Installation and Usage by Agent)', f'{en_detail_text}\\1', en_content)


# Chinese sections that need to be updated from English (Installation section)
zh_install_section = """## 各 Agent 的安装与使用

选择与你正在使用的 AI 编程助手相匹配的接入方式：

### Claude Code
**选项 A：插件形式（推荐）**
```bash
/plugin marketplace add tamochii/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```
**选项 B：项目文件形式**
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/CLAUDE.md
```

### Cursor
本仓库包含一个已提交的 Cursor 项目规则，因此在 Cursor 中打开项目时指南会自动生效。
详细设置请参见 **[CURSOR.md](CURSOR.md)**。

### OpenCode
将 SKILL.md 下载到你项目的 `.opencode/skills` 目录中：
```bash
mkdir -p .opencode/skills/karpathy-guidelines
curl -o .opencode/skills/karpathy-guidelines/SKILL.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/.opencode/skills/karpathy-guidelines/SKILL.md
```

### Hermes Agent (及通用自治 Agent)
Hermes Agent 原生支持读取 `AGENTS.md` 来定义运行约束。
```bash
curl -o AGENTS.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/AGENTS.md
```

### VS Code Copilot (GitHub Copilot)
你可以通过 `.github/copilot-instructions.md` 文件（或追加到该文件中）为 Copilot 提供指南：
```bash
mkdir -p .github
curl -o .github/copilot-instructions.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/agents/vscode-copilot/COPILOT.md
```

### Codex, OpenClaw, Gemini CLI
对于基于命令行的 Agent，你可以将规则追加到项目的主上下文文件中，或者放入它们各自的 `.md` 配置文件中：
```bash
# Codex
curl -o CODEX.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/agents/codex/CODEX.md

# OpenClaw
curl -o OPENCLAW.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/agents/openclaw/OPENCLAW.md

# Gemini CLI
curl -o GEMINI.md https://raw.githubusercontent.com/tamochii/andrej-karpathy-skills/main/agents/gemini-cli/GEMINI.md
```

---
"""

# Replace the old install section in zh_content
zh_content = re.sub(r'## 安装.*?(?=## 核心洞察|## 如何判断)', zh_install_section, zh_content, flags=re.DOTALL)
zh_content = re.sub(r'## 在 Cursor 中使用.*?(?=## 核心洞察|## 如何判断)', '', zh_content, flags=re.DOTALL) # Remove redundant cursor section
zh_content = re.sub(r'## 核心洞察.*?(?=## 如何判断)', '', zh_content, flags=re.DOTALL) # Remove redundant core insight section to match EN


# Write back
with open('README.md', 'w', encoding='utf-8') as f:
    f.write(en_content)
with open('README.zh.md', 'w', encoding='utf-8') as f:
    f.write(zh_content)

