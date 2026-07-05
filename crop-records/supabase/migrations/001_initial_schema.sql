-- =============================================
-- 農作物生產履歷系統 - 資料庫結構
-- =============================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- =============================================
-- Table: profiles（使用者公開資料）
-- Auto-created on signup via trigger
-- auth.users is not queryable from public schema, so we mirror email here
-- =============================================
create table if not exists profiles (
  id    uuid primary key references auth.users(id) on delete cascade,
  email text not null
);

alter table profiles enable row level security;

create policy "profiles: anyone can read"
  on profiles for select using (true);

create policy "profiles: users can update own"
  on profiles for update using (auth.uid() = id);

-- Trigger to auto-create profile on user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles(id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- Table: farms（農場）
-- =============================================
create table if not exists farms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  address     text,
  invite_code text not null unique default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at  timestamptz not null default now()
);

-- =============================================
-- Table: farm_members（農場成員）
-- =============================================
create type farm_role as enum ('owner', 'member');

create table if not exists farm_members (
  id         uuid primary key default gen_random_uuid(),
  farm_id    uuid not null references farms(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       farm_role not null default 'member',
  joined_at  timestamptz not null default now(),
  unique(farm_id, user_id)
);

-- =============================================
-- Table: fields（田區）
-- =============================================
create table if not exists fields (
  id         uuid primary key default gen_random_uuid(),
  farm_id    uuid not null references farms(id) on delete cascade,
  name       text not null,
  area       numeric(10,4),        -- 面積（公頃）
  location   text,                 -- 地段地號或描述
  notes      text,
  created_at timestamptz not null default now()
);

-- =============================================
-- Table: crops（作物）
-- =============================================
create type crop_status as enum ('active', 'harvested');

create table if not exists crops (
  id           uuid primary key default gen_random_uuid(),
  field_id     uuid not null references fields(id) on delete cascade,
  farm_id      uuid not null references farms(id) on delete cascade,
  name         text not null,      -- 作物名稱（如：水稻、番茄）
  variety      text,               -- 品種
  start_date   date not null,      -- 種植日期
  end_date     date,               -- 採收日期
  status       crop_status not null default 'active',
  notes        text,
  created_at   timestamptz not null default now()
);

-- =============================================
-- Table: activity_records（農事記錄）
-- =============================================
create type activity_type as enum (
  '整地', '播種', '定植', '施肥', '追肥', '用藥', '病蟲害', '灌溉', '採收', '其他'
);

create type weather_type as enum ('晴', '多雲', '陰', '雨', '不記錄');

create table if not exists activity_records (
  id            uuid primary key default gen_random_uuid(),
  crop_id       uuid references crops(id) on delete set null,
  field_id      uuid not null references fields(id) on delete cascade,
  farm_id       uuid not null references farms(id) on delete cascade,
  recorded_by   uuid not null references profiles(id),
  activity_type activity_type not null,
  record_date   date not null default current_date,
  weather       weather_type not null default '不記錄',
  -- materials: [{name, quantity, unit, purpose}]
  materials     jsonb not null default '[]',
  description   text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- Index for common query patterns
create index on activity_records(farm_id, record_date desc);
create index on activity_records(field_id, record_date desc);
create index on activity_records(crop_id);

-- =============================================
-- Row Level Security (RLS)
-- All tables gated through farm_members
-- =============================================

alter table farms enable row level security;
alter table farm_members enable row level security;
alter table fields enable row level security;
alter table crops enable row level security;
alter table activity_records enable row level security;

-- Helper function: check if current user is a member of given farm
create or replace function is_farm_member(p_farm_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from farm_members
    where farm_id = p_farm_id and user_id = auth.uid()
  );
$$;

-- Helper function: check if current user is owner of given farm
create or replace function is_farm_owner(p_farm_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from farm_members
    where farm_id = p_farm_id and user_id = auth.uid() and role = 'owner'
  );
$$;

-- ---- farms policies ----
create policy "farms: members can view"
  on farms for select using (is_farm_member(id));

create policy "farms: owner can update"
  on farms for update using (is_farm_owner(id));

create policy "farms: authenticated can create"
  on farms for insert with check (auth.uid() = owner_id);

create policy "farms: owner can delete"
  on farms for delete using (is_farm_owner(id));

-- ---- farm_members policies ----
create policy "farm_members: members can view"
  on farm_members for select using (is_farm_member(farm_id));

create policy "farm_members: owner can manage"
  on farm_members for all using (is_farm_owner(farm_id));

-- Allow self-insert when joining via invite code (handled by join_farm function)
create policy "farm_members: can insert own membership"
  on farm_members for insert with check (user_id = auth.uid());

-- ---- fields policies ----
create policy "fields: farm members can view"
  on fields for select using (is_farm_member(farm_id));

create policy "fields: farm members can insert"
  on fields for insert with check (is_farm_member(farm_id));

create policy "fields: farm members can update"
  on fields for update using (is_farm_member(farm_id));

create policy "fields: farm owners can delete"
  on fields for delete using (is_farm_owner(farm_id));

-- ---- crops policies ----
create policy "crops: farm members can view"
  on crops for select using (is_farm_member(farm_id));

create policy "crops: farm members can insert"
  on crops for insert with check (is_farm_member(farm_id));

create policy "crops: farm members can update"
  on crops for update using (is_farm_member(farm_id));

create policy "crops: farm owners can delete"
  on crops for delete using (is_farm_owner(farm_id));

-- ---- activity_records policies ----
create policy "activity_records: farm members can view"
  on activity_records for select using (is_farm_member(farm_id));

create policy "activity_records: farm members can insert"
  on activity_records for insert with check (
    is_farm_member(farm_id) and recorded_by = auth.uid()
  );

create policy "activity_records: recorder or owner can update"
  on activity_records for update using (
    recorded_by = auth.uid() or is_farm_owner(farm_id)
  );

create policy "activity_records: recorder or owner can delete"
  on activity_records for delete using (
    recorded_by = auth.uid() or is_farm_owner(farm_id)
  );

-- =============================================
-- Function: join_farm_by_invite_code
-- Used by frontend to join a farm atomically
-- =============================================
create or replace function join_farm_by_invite_code(p_invite_code text)
returns jsonb
language plpgsql security definer
as $$
declare
  v_farm farms;
begin
  select * into v_farm from farms where invite_code = upper(p_invite_code);
  if not found then
    return jsonb_build_object('error', '邀請碼不存在');
  end if;
  -- Check if already a member
  if exists (select 1 from farm_members where farm_id = v_farm.id and user_id = auth.uid()) then
    return jsonb_build_object('error', '您已是此農場成員');
  end if;
  insert into farm_members(farm_id, user_id, role) values (v_farm.id, auth.uid(), 'member');
  return jsonb_build_object('farm_id', v_farm.id, 'farm_name', v_farm.name);
end;
$$;

-- =============================================
-- Function: regenerate_invite_code (owner only)
-- =============================================
create or replace function regenerate_invite_code(p_farm_id uuid)
returns text
language plpgsql security definer
as $$
declare
  v_new_code text;
begin
  if not is_farm_owner(p_farm_id) then
    raise exception '只有農場負責人才能重新產生邀請碼';
  end if;
  v_new_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  update farms set invite_code = v_new_code where id = p_farm_id;
  return v_new_code;
end;
$$;
