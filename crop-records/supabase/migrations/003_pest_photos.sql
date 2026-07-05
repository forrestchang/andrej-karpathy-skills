-- =============================================
-- 003: 病蟲害照片與 AI 辨識支援
-- =============================================

-- 記錄照片：[{url, drive_link}]
alter table activity_records
  add column if not exists photos jsonb not null default '[]';

-- Gemini API 金鑰（農場負責人於設定頁填入，僅負責人可讀寫）
alter table farm_automation
  add column if not exists gemini_api_key text;

-- 照片儲存桶（公開讀取；路徑含 UUID 不可猜測，僅伺服器端可寫入）
insert into storage.buckets (id, name, public)
values ('record-photos', 'record-photos', true)
on conflict (id) do nothing;
