<p align="right">
  <a href="./README.md">English</a> | 简体中文
</p>

<h1 align="center">Karpathy Guidelines for OpenCode</h1>

<p align="center">
  一份受 Andrej Karpathy 启发编写的 AI 编程助手行为规范，打包为 OpenCode 技能。
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">
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

## 安装

安装分两个层次。**全局安装**让指南在每个项目中生效。**项目安装**将指南限定在单个仓库中。可以两者都做，让全局指南生效的同时在特定项目中覆盖。

### 全局安装

OpenCode 会自动从以下两个位置发现技能，任选其一：

**方式 A — 全局技能目录（推荐）：**
```bash
mkdir -p ~/.config/opencode/skills/karpathy-guidelines
curl -o ~/.config/opencode/skills/karpathy-guidelines/SKILL.md \
  https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/.opencode/skills/karpathy-guidelines/SKILL.md
```

**方式 B — Agent 技能目录（自动发现的外部技能）：**
```bash
mkdir -p ~/.agents/skills/karpathy-guidelines
curl -o ~/.agents/skills/karpathy-guidelines/SKILL.md \
  https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/.opencode/skills/karpathy-guidelines/SKILL.md
```

如果想在每个项目中默认加载指南作为系统指令，在 `~/.config/opencode/opencode.json` 中添加：

```json
{
  "instructions": ["~/AGENTS.md"]
}
```

然后复制指令文件：

```bash
curl -o ~/AGENTS.md \
  https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/AGENTS.md
```

### 项目安装

每个新项目需要两个文件。技能文件让指南作为可加载的技能可用。指令文件让它们默认生效。

```bash
cd your-project

# 1. 安装技能（OpenCode 自动发现）
mkdir -p .opencode/skills/karpathy-guidelines
curl -o .opencode/skills/karpathy-guidelines/SKILL.md \
  https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/.opencode/skills/karpathy-guidelines/SKILL.md

# 2. 安装指令（OpenCode 从项目根目录自动加载）
curl -o AGENTS.md \
  https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/AGENTS.md
```

如果你的项目已有 `AGENTS.md`，或更倾向于使用 `opencode.json`，可显式配置指令路径：

```json
{
  "instructions": ["AGENTS.md"]
}
```

### 验证安装

OpenCode 启动时会输出类似以下日志：

```
Loaded skill: karpathy-guidelines
Loaded instructions from AGENTS.md
```

## 如何判断它在起作用

如果你看到以下情况，说明这些指南正在发挥作用：

- **diff 中不必要的改动更少** — 只有请求的改动出现
- **因过度复杂而导致的重写更少** — 代码第一次就写得简洁
- **澄清问题在实现之前提出** — 而不是在犯错之后
- **干净、精简的 PR** — 没有顺带的重构或"改进"

## 定制

编辑 `AGENTS.md` 或在项目的 `opencode.json` 中添加规则，与项目特定指令合并：

```markdown
## 项目特定指南

- 使用 TypeScript 严格模式
- 所有 API 端点必须有测试
- 遵循 `src/utils/errors.ts` 中现有的错误处理模式
```

## 权衡说明

这些指南倾向于**谨慎而非速度**。对于琐碎的任务（简单的拼写错误修复、显而易见的一行修改），请自行判断 — 并非每个改动都需要完整的严谨流程。

目标是减少非琐碎工作中的代价高昂的错误，而不是拖慢简单任务。
