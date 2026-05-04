<p align="right">
  <a href="./README.md">English</a> | 简体中文
</p>

<h1 align="center">Andrej Karpathy Skills</h1>

<p align="center">
  一份受 Andrej Karpathy 启发编写的 AI 编程助手行为规范，让各种 Agent 变得更聪明、更克制。
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">
  <img alt="Support" src="https://img.shields.io/badge/Agents-Claude_|_Cursor_|_Copilot_|_Hermes-7A3FFF.svg">
</p>

## 问题所在

来自 Andrej 的推文：

> "模型会代你做错误假设，然后不假思索地执行。它们不管理自身的困惑，不寻求澄清，不呈现矛盾，不展示权衡，在应该提出异议时也不反驳。"

> "它们真的很喜欢把代码和 API 搞复杂，堆砌抽象概念，不清理死代码……明明 100 行能搞定的事情，非要实现成 1000 行的臃肿架构。"

> "它们有时仍会改动或删除自己理解不足的代码和注释，即使这些内容与任务本身无关。"

## 解决方案

四个原则，集中在一个文件中，直接解决这些问题：

| 原则 | 解决什么问题 |
|-----------|-----------|
| **编码前思考** | 错误假设、隐藏困惑、缺少权衡 |
| **简洁优先** | 过度复杂、臃肿抽象 |
| **精准修改** | 无关编辑、触碰不应碰的代码 |
| **目标驱动执行** | 通过测试优先、可验证的成功标准 |

## 四个原则详解

### 1. 编码前思考

**不要假设。不要隐藏困惑。呈现权衡。**

LLM 经常默默选择一种解释然后执行。这个原则强制明确推理：

- **明确说明假设** — 如果不确定，询问而不是猜测
- **呈现多种解释** — 当存在歧义时，不要默默选择
- **适时提出异议** — 如果存在更简单的方法，说出来
- **困惑时停下来** — 指出不清楚的地方并要求澄清

### 2. 简洁优先

**用最少的代码解决问题。不要过度推测。**

对抗过度工程的倾向：

- 不要添加要求之外的功能
- 不要为一次性代码创建抽象
- 不要添加未要求的"灵活性"或"可配置性"
- 不要为不可能发生的场景做错误处理
- 如果 200 行代码可以写成 50 行，重写它

**检验标准：** 资深工程师会觉得这过于复杂吗？如果是，简化。

### 3. 精准修改

**只碰必须碰的。只清理自己造成的混乱。**

编辑现有代码时：

- 不要"改进"相邻的代码、注释或格式
- 不要重构没坏的东西
- 匹配现有风格，即使你更倾向于不同的写法
- 如果注意到无关的死代码，提一下 —— 不要删除它

当你的改动产生孤儿代码时：

- 删除因你的改动而变得无用的导入/变量/函数
- 不要删除预先存在的死代码，除非被要求

**检验标准：** 每一行修改都应该能直接追溯到用户的请求。

### 4. 目标驱动执行

**定义成功标准。循环验证直到达成。**

将指令式任务转化为可验证的目标：

| 不要这样做... | 转化为... |
|--------------|-----------------|
| "添加验证" | "为无效输入编写测试，然后让它们通过" |
| "修复 bug" | "编写重现 bug 的测试，然后让它通过" |
| "重构 X" | "确保重构前后测试都能通过" |

对于多步骤任务，说明一个简短的计划：

```
1. [步骤] → 验证: [检查]
2. [步骤] → 验证: [检查]
3. [步骤] → 验证: [检查]
```

强有力的成功标准让 LLM 能够独立循环执行。弱标准（"让它工作"）需要不断澄清。

## 各 Agent 的安装与使用

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
## 如何判断它在起作用

如果你看到以下情况，说明这些指南正在发挥作用：

- **diff 中不必要的改动更少** —— 只有请求的改动出现
- **因过度复杂而导致的重写更少** —— 代码第一次就写得简洁
- **澄清问题在实现之前提出** —— 而不是在犯错之后
- **干净、精简的 PR** —— 没有顺带的重构或"改进"

## 定制

这些指南设计用于与项目特定指令合并。将它们添加到你现有的 `CLAUDE.md` 或创建一个新的。

对于项目特定规则，添加如下章节：

```markdown
## 项目特定指南

- 使用 TypeScript 严格模式
- 所有 API 端点必须有测试
- 遵循 `src/utils/errors.ts` 中现有的错误处理模式
```

## 权衡说明

这些指南倾向于**谨慎而非速度**。对于琐碎的任务（简单的拼写错误修复、显而易见的一行修改），请自行判断 —— 并非每个改动都需要完整的严谨流程。

目标是减少非琐碎工作中的代价高昂的错误，而不是拖慢简单任务。
