# 受 Karpathy 启发的编码智能体指南

一套可移植的编码智能体行为准则，源自 [Andrej Karpathy 对常见 LLM 编码问题的观察](https://x.com/karpathy/status/2015883857489522876)。

同一套四项原则可用于 **Claude Code**、**OpenAI Codex**、**Cursor**，以及任何支持项目指令或 Agent Skills 的编码智能体。

[English](README.md) | 简体中文

> 另请参阅 [Multica](https://github.com/multica-ai/multica)：一个使用可复用技能来运行编码智能体的开源平台。

## 为什么需要这套指南

编码智能体能力很强，但它们经常以可预测的方式失败：默默做出假设、过度设计、修改无关代码，以及在没有验证结果的情况下宣布完成。

本仓库把这些失败模式转化为四项明确的工作约定：

| 原则 | 工作约定 | 防止的问题 |
| --- | --- | --- |
| **编码前思考** | 编辑前明确假设、歧义与权衡 | 基于错误理解自信地推进 |
| **简洁优先** | 只编写解决当前问题所需的最少代码 | 推测性功能与过早抽象 |
| **精准修改** | 只改动直接服务于请求的内容 | 顺手重构与嘈杂 diff |
| **目标驱动执行** | 定义成功标准并实际验证 | 模糊实现与未经测试的完成声明 |

完整指南以各工具的原生格式提供，无需自行转换规则。

## 支持的集成

| 工具 | 仓库文件 | 最适合的用法 |
| --- | --- | --- |
| **Claude Code** | [`CLAUDE.md`](CLAUDE.md) 与 [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md) | 插件安装、项目指令或可复用技能 |
| **OpenAI Codex** | [`AGENTS.md`](AGENTS.md) 与 [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md) | 始终生效的项目/全局指令或可调用技能 |
| **Cursor** | [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) | 始终应用的项目规则 |
| **其他编码智能体** | [`CLAUDE.md`](CLAUDE.md) | 复制或合并到该工具支持的指令文件中 |

## 快速开始

### OpenAI Codex

Codex 会在开始工作前自动读取 `AGENTS.md`。请选择所需作用域：

#### 当前项目

如果项目中还没有 `AGENTS.md`：

```bash
curl -L https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/AGENTS.md -o AGENTS.md
```

如果项目已经有 `AGENTS.md`，请把四项原则合并进去，不要覆盖项目专用指令。

#### 所有 Codex 项目

将 [`AGENTS.md`](AGENTS.md) 合并到 `~/.codex/AGENTS.md`。Codex 会为每个仓库加载这个全局文件，然后在其上叠加项目级指令。

在仓库根目录验证结果：

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

#### 可复用 Codex 技能

在 Codex 中，让内置的 skill installer 安装本仓库的技能：

```text
$skill-installer Install karpathy-guidelines from https://github.com/multica-ai/andrej-karpathy-skills/tree/main/skills/karpathy-guidelines
```

之后可用 `$karpathy-guidelines` 显式调用；当编码任务符合技能描述时，Codex 也可以自动选择它。

Windows 命令、全局与项目作用域、验证和故障排除请参阅 [`CODEX.md`](CODEX.md)。该设置遵循 OpenAI 官方的 [AGENTS.md](https://developers.openai.com/codex/guides/agents-md/) 与 [Codex skills](https://developers.openai.com/codex/skills/) 文档。

### Claude Code

#### 安装插件（推荐）

在 Claude Code 中，将本仓库添加为 marketplace 并安装插件：

```text
/plugin marketplace add multica-ai/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```

这样可在所有项目中使用该可复用技能。

#### 项目指令

如果项目中还没有 `CLAUDE.md`：

```bash
curl -L https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/CLAUDE.md -o CLAUDE.md
```

如果 `CLAUDE.md` 已存在，请合并指南，不要替换原文件。

### Cursor

将已提交的规则复制到另一个项目的 `.cursor/rules/` 目录：

```bash
mkdir -p .cursor/rules
curl -L https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/.cursor/rules/karpathy-guidelines.mdc -o .cursor/rules/karpathy-guidelines.mdc
```

规则使用 `alwaysApply: true`，因此只要在 Cursor 中打开该项目就会生效。详情请参阅 [`CURSOR.md`](CURSOR.md)。

## 四项原则

### 1. 编码前思考

**不要假设。不要隐藏困惑。呈现权衡。**

- 实现前说明重要假设。
- 当存在多种合理解释时，列出它们，不要默默选择。
- 如果有更简单的方案或明显代价，应主动指出。
- 如果缺失信息会实质性改变方案，请停止并询问。

### 2. 简洁优先

**只编写解决当前问题所需的最少代码。**

- 不添加未被要求的功能。
- 不为单一用例创建抽象。
- 不为假想的未来需求添加可配置性。
- 让复杂度与当前需求中的证据相匹配。
- 如果 200 行显然可以写成 50 行，就简化。

### 3. 精准修改

**只触碰任务要求的内容。只清理因本次修改而过时的内容。**

- 没有与任务相关的理由时，不要格式化、重命名或重构相邻代码。
- 匹配现有风格与模式。
- 对无关问题进行说明，而不是默默修复。
- 只有当自己的修改使导入、变量或函数不再使用时才删除它们。

检验标准：每一行改动都应能追溯到用户请求，或追溯到对所请求行为的验证。

### 4. 目标驱动执行

**把指令转化为可观察的成功标准，然后循环执行直到验证通过。**

| 请求 | 可验证目标 |
| --- | --- |
| “添加验证” | 为无效输入添加测试，然后让测试通过 |
| “修复 bug” | 用测试重现问题、修复问题并运行回归检查 |
| “重构 X” | 确保重构前后的检查都通过 |

对于多步骤工作，为每一步配对检查项：

```text
1. 重现行为 -> 验证：聚焦测试按预期原因失败
2. 完成最小修复 -> 验证：聚焦测试通过
3. 检查回归 -> 验证：相关测试套件与 diff 审查通过
```

## 正确采用后的表现

- 澄清问题发生在高成本实现之前，而不是错误发生之后。
- diff 中无关编辑更少。
- 解决方案中的推测性层次和抽象更少。
- 完成报告会明确列出实际运行过的检查。
- Pull request 更小、更易审查，也更易回滚。

这些行为准则不能替代项目要求、安全策略、测试或人工审查。

## 仓库结构

```text
.
|-- AGENTS.md                              # Codex 项目指令
|-- CLAUDE.md                              # Claude Code 项目指令
|-- CODEX.md                               # Codex 详细设置
|-- CURSOR.md                              # Cursor 详细设置
|-- EXAMPLES.md                            # 修改前/后的示例
|-- .claude-plugin/                        # Claude Code 插件元数据
|-- .cursor/rules/karpathy-guidelines.mdc  # Cursor 项目规则
`-- skills/karpathy-guidelines/SKILL.md     # 可复用 Agent Skill
```

## 在不丢失项目上下文的前提下定制

把这四项原则作为行为层，并在原生项目指令文件中保留仓库特定事实：

```markdown
## 项目专用指南

- 使用 TypeScript strict mode。
- 修改应用代码后运行 `npm test`。
- 遵循 `src/utils/errors.ts` 中的错误处理模式。
```

如果目标文件已经存在，请审查并合并。直接替换可能删除重要的设置、测试或安全指令。

## 贡献

各工具专用文件有意表达相同的四项原则。修改其行为时，请保持以下文件一致：

- [`AGENTS.md`](AGENTS.md)
- [`CLAUDE.md`](CLAUDE.md)
- [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)
- [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)

用于解释安装或发现机制的文档措辞可以保持工具特定形式。

## 权衡

本指南偏向谨慎而不是速度。对于明显的拼写修复和其他低风险小改动，请自行判断；目标是避免代价高昂的错误，而不是把每个单行修改都变成繁琐流程。

## 致谢

灵感来自 [Andrej Karpathy 对编码智能体的观察](https://x.com/karpathy/status/2015883857489522876)。仓库由 [Multica](https://github.com/multica-ai) 维护。

## 许可

MIT
