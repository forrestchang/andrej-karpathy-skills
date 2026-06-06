<div align="center">

# Karpathy 风格 Agent Skills

面向 Claude Code 的可复用技能，用于更安全地编码、做目标对齐计划审查，以及控制多 Agent 执行。

[English](./README.md) | 简体中文

</div>

---

这个仓库把 Karpathy 风格的 Agent 行为封装成可安装的 Claude Code skills。它保留原有的编码纪律 skill，并新增 `plan-review`，面向复杂任务做目标对齐计划审查，用于显式定义任务总目标、独立审查方案，并在权限边界前停止执行。

> 灵感来自 [Andrej Karpathy 对 LLM 编码陷阱的观察](https://x.com/karpathy/status/2015883857489522876)。

## 可用 Skills

| Skill | 适用场景 | 核心行为 |
|---|---|---|
| `karpathy-guidelines` | 编写、审查或重构代码 | 先思考再编码、保持简洁、精准修改、定义可验证成功标准 |
| `plan-review` | 审查或执行多步骤计划、handoff、多文件改动、ID/引用变更，或涉及权限边界的任务 | 将输入转成任务总目标，运行五 Agent 方案/审查闭环，闭合 P0/P1/P2 风险，并只在目标对齐且权限允许时执行 |

`karpathy-plan-review` 保留为旧提示词和旧工作流的兼容别名。新用法优先使用 `plan-review`。

## 安装

在 Claude Code 中添加插件市场：

```text
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

然后安装插件：

```text
/plugin install andrej-karpathy-skills@karpathy-skills
```

安装后，Claude Code 可以在项目中加载本插件提供的 skills。

## `karpathy-guidelines`

原始 skill 通过四条原则减少 LLM 常见编码错误：

| 原则 | 解决的问题 |
|---|---|
| **Think Before Coding / 编码前思考** | 错误假设、隐藏困惑、缺少权衡 |
| **Simplicity First / 简洁优先** | 过度复杂和不必要抽象 |
| **Surgical Changes / 精准修改** | 无关编辑和顺手重构 |
| **Goal-Driven Execution / 目标驱动执行** | 成功标准模糊、完成未验证 |

这个 skill 最适合实现类工作，防止 Agent 过度设计、默默猜测或碰无关代码。

## `plan-review`

复杂计划执行前使用这个 skill。它的核心规则是：**任务总目标是唯一权威来源**。

它使用五 Agent 闭环：

1. **Task Recognition Agent / 任务识别 Agent** 从所有接收信息中识别任务总目标。
2. **Supervisor Agent / 监督 Agent** 传递共享任务信封并监督角色边界。
3. **Plan Agent / 方案 Agent** 产出与任务总目标对齐的最优方案。
4. **Review Agent / 审查 Agent** 只发现 P0/P1/P2 风险，不生成替代方案。
5. **Execution Agent / 执行 Agent** 在执行前检查目标对齐、权限和能力边界。

关键门禁：

- 每个 Agent 都收到同一份共享任务信封。
- 每个 Agent 都可以使用相关 superpower skill 和 Karpathy 思路。
- P0/P1/P2 风险必须被修复，或用证据闭合为不改项。
- 收敛要求连续两轮审查零新增 P0/P1/P2。
- 执行遇到人工授权、生产权限、不可逆操作、资金、合同、合规、缺资料或能力不足时必须停住。

## 在 Cursor 中使用

本仓库包含 Cursor 项目规则：[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)，在 Cursor 打开项目时也可以应用同一套编码指南。详情见 [CURSOR.md](CURSOR.md)。

## 如何判断它在起作用

你应该看到：

- diff 中不必要的改动减少。
- 因过度复杂导致的返工减少。
- 实现前能更清楚地说明假设。
- 计划会明确成功标准和验证命令。
- 复杂执行会在真实权限或能力边界前停住，而不是猜测继续。

## 定制

这些 skills 适合与项目级规则组合使用。项目规则继续放在 `CLAUDE.md`、仓库文档或本地 agent 指令中；这些 skills 提供可复用的审查和执行纪律。

## 许可

MIT
