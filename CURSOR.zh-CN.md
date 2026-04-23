# 在 Cursor 中使用本仓库

本项目包含一个 **Cursor 项目规则**，因此当你在这里工作时，受 Karpathy 启发的行为准则会自动生效。

## 在本仓库中

1. 在 Cursor 中打开该文件夹。
2. 规则文件 [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) 已提交，且 `alwaysApply: true`，因此无需额外安装步骤。
3. 在 Cursor 中，你可以在 **Settings → Rules**（或项目规则 UI）中确认，应该能看到 `karpathy-guidelines`。

## 在其他项目中复用同样的准则

**Cursor（推荐）：** 将 `.cursor/rules/karpathy-guidelines.mdc` 复制到目标项目的 `.cursor/rules/` 目录（如有需要先创建目录）。你可以按需调整或与已有规则合并。

**其他工具：** 如果某个工具链只支持根目录指令文件，请改为复制 [`CLAUDE.md`](CLAUDE.md) 到目标项目（或合并到你现有的指令中）。

## 可选：个人 Agent Skills

如果你希望在 `~/.cursor/skills` 下以可复用技能的方式使用同样内容，请使用 [`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)。你可以复制或软链接到你的个人技能目录；按你现有的技能组织方式即可。

## Claude Code 与 Cursor 的差异

- **Claude Code：** 按 [`README.md`](README.md) 中的插件市场说明安装；插件会暴露本仓库的 skill。按项目使用时也可以依赖 `CLAUDE.md`。
- **Cursor：** 使用上文所述已提交的 `.cursor/rules/` 文件。Cursor 默认不会读取 `.claude-plugin/` 或 `CLAUDE.md`。

## 贡献者说明

当你修改四个核心原则时，请保持 **[`CLAUDE.md`](CLAUDE.md)** 与 **[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)** 同步。如果发布的 skill/plugin 文本也需要一致，请同步更新 **[`skills/karpathy-guidelines/SKILL.md`](skills/karpathy-guidelines/SKILL.md)**。
