# 農作物生產履歷系統

農事記錄 PWA，供農場記錄從整地到採收的完整生產履歷，資料儲存於 Supabase 雲端，可匯出 PDF 作為申請有機耕作/友善種植認證的附件。

## 功能

- **農事記錄**：整地、播種、定植、施肥、追肥、用藥、病蟲害、灌溉、採收
- **田區管理**：多田區、多作物管理
- **作物分類查詢**：新增作物時自動帶出農委會分類歸屬（大分類 > 次分類 > 科），輸入作物名稱即時顯示，並提供名稱自動完成。資料見 `src/lib/cropClassification.js`，查詢函式見 `src/lib/cropLookup.js`
- **多人協作**：農場負責人可產生邀請碼邀請成員
- **PDF 匯出**：產生農場生產履歷報告（符合農委會友善耕作記錄格式）
- **PWA**：可加入手機桌面、離線通知
- **自動化系統對接**：溫室自動化控制系統（澆灌、施肥、抽風）可透過 API 自動寫入農事記錄與產銷履歷 Google 試算表，詳見 [integration/README.md](integration/README.md)
- **Android APP**：以 Capacitor 打包，GitHub Actions 自動產出 APK（`.github/workflows/android-apk.yml`）

## 快速開始

### 1. 建立 Supabase 專案

1. 前往 [supabase.com](https://supabase.com) 建立免費帳號與新專案
2. 進入專案的 **SQL Editor**，貼上並執行 `supabase/migrations/001_initial_schema.sql` 的內容
3. 在 **Authentication → Settings** 中確認 Email auth 已啟用

### 2. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env`，填入您的 Supabase 專案設定：
- `VITE_SUPABASE_URL`：從 Supabase 專案 Settings → API → Project URL 取得
- `VITE_SUPABASE_ANON_KEY`：從 Supabase 專案 Settings → API → anon public key 取得

### 3. 安裝與啟動

```bash
npm install
npm run dev
```

開啟 `http://localhost:5173`

## 部署

```bash
npm run build
```

`dist/` 目錄可部署至 Netlify、Vercel、Cloudflare Pages 等靜態主機。

## 技術棧

| 工具 | 用途 |
|------|------|
| React 18 + Vite | 前端框架 |
| Tailwind CSS v4 | 樣式 |
| Supabase | 認證 + 雲端資料庫（PostgreSQL）|
| React Router v7 | 頁面路由 |
| jsPDF + autoTable | PDF 報告產生 |
| vite-plugin-pwa | PWA / Service Worker |

## 資料庫結構

```
farms           農場
farm_members    農場成員（多對多，含 role: owner/member）
fields          田區
crops           作物（關聯田區）
activity_records 農事記錄（整地/施肥/用藥等）
```

所有表格均啟用 **Row Level Security (RLS)**，資料完全隔離於各農場之間。

## 使用說明

1. 註冊帳號後建立農場（或使用邀請碼加入現有農場）
2. 在「田區」頁面新增田區與作物
3. 在「首頁」快速新增農事記錄，或至「記錄」頁面查詢歷史
4. 需要申請認證時，至「報告」頁面選擇田區與日期範圍，下載 PDF

## PDF 報告

PDF 報告包含：
- 農場基本資料
- 田區與作物資訊
- 完整農事作業記錄（日期、類型、天氣、使用資材、說明）
- 記錄期間與產出日期

可作為申請以下認證的農事記錄附件：
- 農委會有機農業認證
- 慈心有機農業發展基金會（TOAF）
- 台灣有機認證（MOA/TOPA 等）
- 友善耕作自我聲明
