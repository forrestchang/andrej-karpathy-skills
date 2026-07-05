-- =============================================
-- 農家/農民官方資料 + 資材成本 + 病蟲害判斷
-- =============================================

-- =============================================
-- Table: farmers（官方農民身分資料，獨立於 app 登入帳號 farm_members）
-- =============================================
create table if not exists farmers (
  id            uuid primary key default gen_random_uuid(),
  farm_id       uuid not null references farms(id) on delete cascade,
  name          text not null,
  id_number     text not null,
  phone         text,
  email         text,
  farmer_no     text,
  class_ser_no  text,
  status        text not null default 'active' check (status in ('active','inactive')),
  notes         text,
  created_at    timestamptz not null default now(),
  unique (farm_id, id_number)
);

-- =============================================
-- Table: farmlands（官方地籍/農地資料）
-- =============================================
create table if not exists farmlands (
  id                   uuid primary key default gen_random_uuid(),
  farm_id              uuid not null references farms(id) on delete cascade,
  farmer_id            uuid references farmers(id) on delete set null,
  field_id             uuid references fields(id) on delete set null,
  city                 text not null,
  town                 text not null,
  section              text,
  section_sub          text,
  lot_no_main          text,
  lot_no_sub           text,
  is_river_land        boolean not null default false,
  land_area_sqm        numeric(10,2),
  cultivable_area_sqm  numeric(10,2),
  notes                text,
  created_at           timestamptz not null default now()
);

-- =============================================
-- Table: farmland_owners（持分人清單）
-- =============================================
create table if not exists farmland_owners (
  id               uuid primary key default gen_random_uuid(),
  farmland_id      uuid not null references farmlands(id) on delete cascade,
  owner_name       text not null,
  owner_id_number  text,
  owner_area_sqm   numeric(10,2)
);

-- =============================================
-- Table: materials（資材主檔，farm-scoped）
-- =============================================
create table if not exists materials (
  id                   uuid primary key default gen_random_uuid(),
  farm_id              uuid not null references farms(id) on delete cascade,
  name                 text not null,
  category             text not null check (category in ('fertilizer','pesticide','seed','other')),
  unit                 text not null default '公升',
  unit_price           numeric(12,2),
  safety_harvest_days  integer,
  is_active            boolean not null default true,
  notes                text,
  created_at           timestamptz not null default now()
);

-- 依 quantity * unit_price 加總 activity_records.materials jsonb 陣列成本
create or replace function activity_material_cost(materials jsonb)
returns numeric
language sql immutable
as $$
  select coalesce(sum(
    (elem->>'quantity')::numeric * coalesce((elem->>'unit_price')::numeric, 0)
  ), 0)
  from jsonb_array_elements(materials) as elem;
$$;

-- =============================================
-- Table: pest_diagnoses（病蟲害判斷紀錄）
-- =============================================
create table if not exists pest_diagnoses (
  id                  uuid primary key default gen_random_uuid(),
  activity_record_id  uuid not null references activity_records(id) on delete cascade,
  photo_url           text,
  diagnosis_label     text,
  confidence          numeric(5,2),
  suggested_materials jsonb not null default '[]',
  source              text not null default 'manual' check (source in ('manual','ai')),
  created_at          timestamptz not null default now()
);

create index on farmers(farm_id);
create index on farmlands(farm_id);
create index on farmland_owners(farmland_id);
create index on materials(farm_id);
create index on pest_diagnoses(activity_record_id);

-- =============================================
-- Row Level Security
-- =============================================
alter table farmers enable row level security;
alter table farmlands enable row level security;
alter table farmland_owners enable row level security;
alter table materials enable row level security;
alter table pest_diagnoses enable row level security;

-- ---- farmers ----
create policy "farmers: farm members can view"
  on farmers for select using (is_farm_member(farm_id));
create policy "farmers: farm members can insert"
  on farmers for insert with check (is_farm_member(farm_id));
create policy "farmers: farm members can update"
  on farmers for update using (is_farm_member(farm_id));
create policy "farmers: farm owners can delete"
  on farmers for delete using (is_farm_owner(farm_id));

-- ---- farmlands ----
create policy "farmlands: farm members can view"
  on farmlands for select using (is_farm_member(farm_id));
create policy "farmlands: farm members can insert"
  on farmlands for insert with check (is_farm_member(farm_id));
create policy "farmlands: farm members can update"
  on farmlands for update using (is_farm_member(farm_id));
create policy "farmlands: farm owners can delete"
  on farmlands for delete using (is_farm_owner(farm_id));

-- ---- farmland_owners (透過 farmlands.farm_id 判斷) ----
create policy "farmland_owners: farm members can view"
  on farmland_owners for select using (
    exists (select 1 from farmlands where farmlands.id = farmland_owners.farmland_id and is_farm_member(farmlands.farm_id))
  );
create policy "farmland_owners: farm members can insert"
  on farmland_owners for insert with check (
    exists (select 1 from farmlands where farmlands.id = farmland_owners.farmland_id and is_farm_member(farmlands.farm_id))
  );
create policy "farmland_owners: farm members can update"
  on farmland_owners for update using (
    exists (select 1 from farmlands where farmlands.id = farmland_owners.farmland_id and is_farm_member(farmlands.farm_id))
  );
create policy "farmland_owners: farm owners can delete"
  on farmland_owners for delete using (
    exists (select 1 from farmlands where farmlands.id = farmland_owners.farmland_id and is_farm_owner(farmlands.farm_id))
  );

-- ---- materials ----
create policy "materials: farm members can view"
  on materials for select using (is_farm_member(farm_id));
create policy "materials: farm members can insert"
  on materials for insert with check (is_farm_member(farm_id));
create policy "materials: farm members can update"
  on materials for update using (is_farm_member(farm_id));
create policy "materials: farm owners can delete"
  on materials for delete using (is_farm_owner(farm_id));

-- ---- pest_diagnoses (透過 activity_records.farm_id 判斷) ----
create policy "pest_diagnoses: farm members can view"
  on pest_diagnoses for select using (
    exists (select 1 from activity_records where activity_records.id = pest_diagnoses.activity_record_id and is_farm_member(activity_records.farm_id))
  );
create policy "pest_diagnoses: farm members can insert"
  on pest_diagnoses for insert with check (
    exists (select 1 from activity_records where activity_records.id = pest_diagnoses.activity_record_id and is_farm_member(activity_records.farm_id))
  );
create policy "pest_diagnoses: farm members can update"
  on pest_diagnoses for update using (
    exists (select 1 from activity_records where activity_records.id = pest_diagnoses.activity_record_id and is_farm_member(activity_records.farm_id))
  );
create policy "pest_diagnoses: farm owners can delete"
  on pest_diagnoses for delete using (
    exists (select 1 from activity_records where activity_records.id = pest_diagnoses.activity_record_id and is_farm_owner(activity_records.farm_id))
  );
