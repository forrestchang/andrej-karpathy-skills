# 深度解析：SKILLS 與插件系統

## 1. 檔案定位
包含 `skills/karpathy-guidelines/SKILL.md` 以及 `.claude-plugin/` 目錄。這代表了專案的「可攜帶性」。

## 2. 組件功能

### A. SKILL.md (技能定義)
- **格式**：採用 Markdown 格式封裝。
- **內容**：將四大原則濃縮為可以被 AI 插件系統調用的「技能描述」。
- **應用**：用於支持客製化技能（Custom Skills）的 AI 平台，讓 AI 可以在跨專案、跨對話的情況下記住這些工程準則。

### B. .claude-plugin/ (Claude 官方插件)
- **定位**：讓這套守則變成 Claude Code 的一個「正式插件」。
- **安裝機制**：透過 `/plugin marketplace add` 安裝後，AI 就不再依賴單一檔案，而是獲得了全域的「行為能力增強」。

## 3. 未來擴展
這種「技能化」的趨勢預示了未來的 AI 開發者將不再只是接受簡單的 Prompt，而是可以加載不同的「專業模組（Skills）」來適應不同的開發場景（如：安全性模組、效能優化模組等）。
