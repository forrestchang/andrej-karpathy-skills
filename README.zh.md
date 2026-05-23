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

## 安装 — OpenCode

本仓库已包含该技能，位于 `.opencode/skills/karpathy-guidelines/SKILL.md`。OpenCode 会自动发现它。

在**其他项目**中使用：

```bash
# 将技能复制到你的项目
mkdir -p .opencode/skills/karpathy-guidelines
curl -o .opencode/skills/karpathy-guidelines/SKILL.md https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/.opencode/skills/karpathy-guidelines/SKILL.md

# 复制指令文件（通过 AGENTS.md 约定加载）
curl -o AGENTS.md https://raw.githubusercontent.com/chius-me/AK-skills-opencode/main/AGENTS.md
```

## 如何判断它在起作用

如果你看到以下情况，说明这些指南正在发挥作用：

- **diff 中不必要的改动更少** —— 只有请求的改动出现
- **因过度复杂而导致的重写更少** —— 代码第一次就写得简洁
- **澄清问题在实现之前提出** —— 而不是在犯错之后
- **干净、精简的 PR** —— 没有顺带的重构或"改进"

## 权衡说明

这些指南倾向于**谨慎而非速度**。对于琐碎的任务（简单的拼写错误修复、显而易见的一行修改），请自行判断 —— 并非每个改动都需要完整的严谨流程。

目标是减少非琐碎工作中的代价高昂的错误，而不是拖慢简单任务。
