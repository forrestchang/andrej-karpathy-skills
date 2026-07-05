-- =============================================
-- 002: 自動化系統對接支援 + 安全性修正
-- =============================================

-- ---- activity_records: 記錄來源 ----
-- 'manual'：使用者手動輸入；'automation'：自動化溫室控制系統透過 API 寫入
alter table activity_records
  add column if not exists source text not null default 'manual'
  check (source in ('manual', 'automation'));

-- 自動化記錄沒有對應的使用者帳號
alter table activity_records alter column recorded_by drop not null;

alter table activity_records
  add constraint activity_records_recorder_required
  check (source = 'automation' or recorded_by is not null);

-- =============================================
-- Table: farm_automation（每農場一組自動化對接設定）
-- api_key 供自動化系統呼叫 Edge Function 時驗證
-- sheet_webhook_url 為 Google Apps Script 部署網址（寫入產銷履歷試算表）
-- =============================================
create table if not exists farm_automation (
  farm_id           uuid primary key references farms(id) on delete cascade,
  api_key           text not null unique default encode(gen_random_bytes(24), 'hex'),
  sheet_webhook_url text,
  created_at        timestamptz not null default now(),
  last_used_at      timestamptz
);

alter table farm_automation enable row level security;

create policy "farm_automation: owner can view"
  on farm_automation for select using (is_farm_owner(farm_id));

create policy "farm_automation: owner can insert"
  on farm_automation for insert with check (is_farm_owner(farm_id));

create policy "farm_automation: owner can update"
  on farm_automation for update using (is_farm_owner(farm_id));

create policy "farm_automation: owner can delete"
  on farm_automation for delete using (is_farm_owner(farm_id));

-- =============================================
-- 安全性修正：profiles 原政策允許任何登入者讀取全部使用者 email
-- 改為僅本人與同農場成員可讀
-- =============================================
create or replace function shares_farm_with(p_user_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1
    from farm_members a
    join farm_members b on a.farm_id = b.farm_id
    where a.user_id = auth.uid() and b.user_id = p_user_id
  );
$$;

drop policy if exists "profiles: anyone can read" on profiles;
create policy "profiles: self or farm co-members can read"
  on profiles for select using (id = auth.uid() or shares_farm_with(id));
