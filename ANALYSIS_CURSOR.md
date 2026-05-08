# 深度解析：CURSOR 體系與自動化規則

## 1. 檔案定位
包含 `CURSOR.md` 與 `.cursor/rules/karpathy-guidelines.mdc`。這是將原則轉化為「編輯器原生自動化」的關鍵。

## 2. 技術規格分析

### A. .cursor/rules/*.mdc
- **自動掛載**：透過 `alwaysApply: true`，讓規則在無需手動指名的情況下生效。
- **約束力度**：這是最強的約束方式。在 Cursor 的 Composer 模式下，AI 會強制過濾不符合這些規則的生成結果。

### B. 跨工具兼容性
- **技術差異**：
    - **Claude Code**：依賴專案根目錄的 `CLAUDE.md`。
    - **Cursor**：優先讀取 `.cursorrules` 或 `.cursor/rules/` 下的規則。
- **同步機制**：專案建議開發者在修改原則後，必須同步更新這兩個地方，確保行為一致。

## 3. 實施建議
如果您使用 Cursor，請務必將 `.cursor/rules/karpathy-guidelines.mdc` 複製到您自己的專案中。這是目前提升 Cursor 產出品質最快的方式。
