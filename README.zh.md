# Karpathy AI 编码智能体规则

> **阻止 AI 编码智能体过度设计、默默猜测以及修改不该触碰的代码。**
> 基于 [Andrej Karpathy 对 LLM 编码缺陷的观察](https://x.com/karpathy/status/2015883857489522876)。

[English](./README.md) | 简体中文

## 问题所在

来自 Andrej 的推文：

> "模型会代你做错误假设，然后不假思索地执行。它们不管理自身的困惑，不寻求澄清，不呈现矛盾，不展示权衡，在应该提出异议时也不反驳。"

> "它们真的很喜欢把代码和 API 搞复杂，堆砌抽象概念，不清理死代码……明明 100 行能搞定的事情，非要实现成 1000 行的臃肿架构。"

> "它们有时仍会改动或删除自己理解不足的代码和注释，即使这些内容与任务本身无关。"

## 解决方案

七条精简规则，并提供针对不同平台的指令文件和一个自适应技能：

| 规则 | 防止的问题 |
|------|-----------|
| **编码前思考** | 错误假设、隐藏困惑、遗漏权衡 |
| **只修改要求的内容** | 顺手重构、风格漂移、无关编辑 |
| **开始前定义完成标准** | 模糊目标、缺少验证、无效循环 |
| **YAGNI** | 过度设计、代码膨胀、过早抽象 |
| **输出纪律** | 冗长回复、无用计划和解释 |
| **工具纪律** | 重复读取、不必要的终端操作、临时文件膨胀 |
| **安全优先** | 对高风险操作的灾难性误解 |

## 基准测试

审计发现，始终加载完整规则虽然提高了合成任务的质量，却增加了 token 使用量。使用 `gpt-5.3-codex` 的重复测试确认了这一点：通过率从 66.7% 提高到 100%，但**可见请求 token 增加 203.6%**，**中位延迟增加 34.6%**。

优化后的技能只在相关时加载缺失的护栏；面对信息不足的任务，只提出一个简短的澄清问题后停止。在 30 次调用中，它实现了：

- **可见请求 token 减少 45.1%**
- **中位延迟降低 12.5%**
- **通过率从 66.7% 提高到 100%**
- token 变化的配对 bootstrap 95% 区间为 **-64.6% 到 -16.4%**

这是指令层面的微型基准测试，并非完整的仓库编辑智能体基准。方法、原始数据和限制请参阅[基准测试报告](benchmark/README.md)、[分析器](benchmark/analyze.py)和[原始结果](benchmark/results-openai-optimized-v2.json)。

## 自行运行测试

仓库提供 6 个 [`demo-tasks/`](demo-tasks/) 任务，每个任务都有评分标准、通过/失败条件和 CSV 记录模板。重复 OpenAI 基准使用三个任务、五次重复、随机交错顺序，每个实验共 30 次调用。

## 安装

### 选项 A：AGENTS.md（Antigravity / Codex / OpenCode）

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/sumonrh/karpathy-skills-for-antigravity-and-codex/main/AGENTS.md
```

### 选项 B：CLAUDE.md（Claude Code）

```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/sumonrh/karpathy-skills-for-antigravity-and-codex/main/CLAUDE.md
```

### 选项 C：Cursor 规则

将 [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) 复制到项目的 `.cursor/rules/` 目录。详情参阅 [CURSOR.md](CURSOR.md)。

### 选项 D：Claude Code 插件

```bash
/plugin marketplace add forrestchang/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```

### 选项 E：Google AI Studio / Hermes

将 [GOOGLE_AI_STUDIO.md](GOOGLE_AI_STUDIO.md) 或 [HERMES.md](HERMES.md) 中的系统指令正文复制到对应平台。

## 如何判断它在起作用

如果你看到以下情况，说明这些指南正在发挥作用：

- **diff 中不必要的改动更少** —— 只有请求的改动出现
- **因过度复杂而导致的重写更少** —— 代码第一次就写得简洁
- **澄清问题在实现之前提出** —— 而不是在犯错之后
- **干净、精简的 PR** —— 没有顺带的重构或"改进"
- **更短的 AI 输出** —— 更少文字，更多有效代码

## 兼容平台

- **Antigravity** —— 使用 `AGENTS.md` 和 `skills/karpathy-guidelines/` 技能
- **Claude Code** —— 使用 `CLAUDE.md` 或官方插件
- **Cursor** —— 使用 `.cursor/rules/karpathy-guidelines.mdc`
- **Google AI Studio** —— 使用 `GOOGLE_AI_STUDIO.md`
- **Hermes** —— 使用 `HERMES.md`
- **OpenAI / Codex** —— 使用 `.agents/rules/` 或自定义指令

## 定制

这些指南应与项目特定指令合并。可以添加如下章节：

```markdown
## 项目特定指南

- 使用 TypeScript 严格模式
- 所有 API 端点必须有测试
- 遵循 `src/utils/errors.ts` 中现有的错误处理模式
```

## 权衡说明

这些指南倾向于**谨慎而非速度**。对于琐碎任务（简单拼写修复、显而易见的一行修改），请自行判断，并非每个改动都需要完整流程。自适应技能通过只加载缺失的护栏来减少这种开销。

目标是减少非琐碎工作中的高成本错误，而不是拖慢简单任务。

## 许可

MIT
