-- =============================================
-- 資材庫存管理 + 栽培批次(farmer/farmland) + 採後處理作業
-- 對齊農糧署官方系統「步驟2 資材管理」「步驟3 栽培紀錄」欄位
-- =============================================

-- 補上 002 遺漏的欄位
alter table materials add column if not exists supplier text;

-- =============================================
-- A. 修改 materials：對齊官方 2-1~2-5 五種資材頁籤
-- =============================================
alter table materials drop constraint if exists materials_category_check;
alter table materials drop column if exists category;
alter table materials add column subtype text;
update materials set subtype = 'other' where subtype is null;
alter table materials alter column subtype set not null;
alter table materials add constraint materials_subtype_check
  check (subtype in ('fertilizer_commercial','fertilizer_self','pesticide_registered','pesticide_exempt','other'));
alter table materials add column registration_no text;
alter table materials add column pesticide_class text;

-- =============================================
-- B. 資材庫存相關表
-- =============================================
create table if not exists material_purchases (
  id             uuid primary key default gen_random_uuid(),
  material_id    uuid not null references materials(id) on delete cascade,
  purchase_date  date not null default current_date,
  quantity       numeric(12,3) not null,
  unit_price     numeric(12,2),
  notes          text,
  created_at     timestamptz not null default now()
);

create table if not exists material_losses (
  id          uuid primary key default gen_random_uuid(),
  material_id uuid not null references materials(id) on delete cascade,
  loss_date   date not null default current_date,
  quantity    numeric(12,3) not null,
  reason      text,
  notes       text,
  created_at  timestamptz not null default now()
);

create table if not exists material_self_productions (
  id               uuid primary key default gen_random_uuid(),
  material_id      uuid not null references materials(id) on delete cascade,
  production_date  date not null default current_date,
  quantity         numeric(12,3) not null,
  formula          text,
  notes            text,
  created_at       timestamptz not null default now()
);

create or replace function material_remaining_stock(p_material_id uuid)
returns numeric
language sql stable
as $$
  select
    coalesce((select sum(quantity) from material_purchases where material_id = p_material_id), 0)
  + coalesce((select sum(quantity) from material_self_productions where material_id = p_material_id), 0)
  - coalesce((select sum(quantity) from material_losses where material_id = p_material_id), 0)
  - coalesce((
      select sum((elem->>'quantity')::numeric)
      from activity_records, jsonb_array_elements(activity_records.materials) as elem
      where (elem->>'material_id') is not null
        and (elem->>'material_id')::uuid = p_material_id
    ), 0);
$$;

-- =============================================
-- C. 修改 crops：對齊官方 3-1 栽培批次
-- =============================================
alter table crops add column farmer_id uuid references farmers(id);
alter table crops add column crop_category text;

create table if not exists crop_farmlands (
  id          uuid primary key default gen_random_uuid(),
  crop_id     uuid not null references crops(id) on delete cascade,
  farmland_id uuid not null references farmlands(id) on delete restrict,
  unique (crop_id, farmland_id)
);

-- =============================================
-- D. 採後處理作業（對應官方 3-2）
-- =============================================
create table if not exists processing_batches (
  id              uuid primary key default gen_random_uuid(),
  farm_id         uuid not null references farms(id) on delete cascade,
  output_quantity numeric(12,3),
  output_unit     text not null default '公斤',
  notes           text,
  recorded_by     uuid references profiles(id),
  created_at      timestamptz not null default now()
);

create table if not exists processing_batch_sources (
  id                        uuid primary key default gen_random_uuid(),
  processing_batch_id       uuid not null references processing_batches(id) on delete cascade,
  source_crop_id            uuid references crops(id) on delete restrict,
  source_processing_batch_id uuid references processing_batches(id) on delete restrict,
  quantity_used             numeric(12,3) not null,
  check (
    (source_crop_id is not null and source_processing_batch_id is null)
    or (source_crop_id is null and source_processing_batch_id is not null)
  )
);

create table if not exists processing_steps (
  id                  uuid primary key default gen_random_uuid(),
  processing_batch_id uuid not null references processing_batches(id) on delete cascade,
  sequence_no         integer not null,
  step_date           date not null default current_date,
  description         text not null,
  notes               text,
  created_at          timestamptz not null default now(),
  unique (processing_batch_id, sequence_no)
);

create index on material_purchases(material_id);
create index on material_losses(material_id);
create index on material_self_productions(material_id);
create index on crop_farmlands(crop_id);
create index on crop_farmlands(farmland_id);
create index on processing_batches(farm_id);
create index on processing_batch_sources(processing_batch_id);
create index on processing_steps(processing_batch_id);

-- =============================================
-- RLS
-- =============================================
alter table material_purchases enable row level security;
alter table material_losses enable row level security;
alter table material_self_productions enable row level security;
alter table crop_farmlands enable row level security;
alter table processing_batches enable row level security;
alter table processing_batch_sources enable row level security;
alter table processing_steps enable row level security;

-- ---- material_purchases / material_losses / material_self_productions (透過 materials.farm_id) ----
create policy "material_purchases: farm members can view"
  on material_purchases for select using (
    exists (select 1 from materials where materials.id = material_purchases.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_purchases: farm members can insert"
  on material_purchases for insert with check (
    exists (select 1 from materials where materials.id = material_purchases.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_purchases: farm members can update"
  on material_purchases for update using (
    exists (select 1 from materials where materials.id = material_purchases.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_purchases: farm owners can delete"
  on material_purchases for delete using (
    exists (select 1 from materials where materials.id = material_purchases.material_id and is_farm_owner(materials.farm_id))
  );

create policy "material_losses: farm members can view"
  on material_losses for select using (
    exists (select 1 from materials where materials.id = material_losses.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_losses: farm members can insert"
  on material_losses for insert with check (
    exists (select 1 from materials where materials.id = material_losses.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_losses: farm members can update"
  on material_losses for update using (
    exists (select 1 from materials where materials.id = material_losses.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_losses: farm owners can delete"
  on material_losses for delete using (
    exists (select 1 from materials where materials.id = material_losses.material_id and is_farm_owner(materials.farm_id))
  );

create policy "material_self_productions: farm members can view"
  on material_self_productions for select using (
    exists (select 1 from materials where materials.id = material_self_productions.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_self_productions: farm members can insert"
  on material_self_productions for insert with check (
    exists (select 1 from materials where materials.id = material_self_productions.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_self_productions: farm members can update"
  on material_self_productions for update using (
    exists (select 1 from materials where materials.id = material_self_productions.material_id and is_farm_member(materials.farm_id))
  );
create policy "material_self_productions: farm owners can delete"
  on material_self_productions for delete using (
    exists (select 1 from materials where materials.id = material_self_productions.material_id and is_farm_owner(materials.farm_id))
  );

-- ---- crop_farmlands (透過 crops.farm_id) ----
create policy "crop_farmlands: farm members can view"
  on crop_farmlands for select using (
    exists (select 1 from crops where crops.id = crop_farmlands.crop_id and is_farm_member(crops.farm_id))
  );
create policy "crop_farmlands: farm members can insert"
  on crop_farmlands for insert with check (
    exists (select 1 from crops where crops.id = crop_farmlands.crop_id and is_farm_member(crops.farm_id))
  );
create policy "crop_farmlands: farm members can update"
  on crop_farmlands for update using (
    exists (select 1 from crops where crops.id = crop_farmlands.crop_id and is_farm_member(crops.farm_id))
  );
create policy "crop_farmlands: farm owners can delete"
  on crop_farmlands for delete using (
    exists (select 1 from crops where crops.id = crop_farmlands.crop_id and is_farm_owner(crops.farm_id))
  );

-- ---- processing_batches (farm_id 直接欄位) ----
create policy "processing_batches: farm members can view"
  on processing_batches for select using (is_farm_member(farm_id));
create policy "processing_batches: farm members can insert"
  on processing_batches for insert with check (is_farm_member(farm_id));
create policy "processing_batches: farm members can update"
  on processing_batches for update using (is_farm_member(farm_id));
create policy "processing_batches: farm owners can delete"
  on processing_batches for delete using (is_farm_owner(farm_id));

-- ---- processing_batch_sources / processing_steps (透過 processing_batches.farm_id) ----
create policy "processing_batch_sources: farm members can view"
  on processing_batch_sources for select using (
    exists (select 1 from processing_batches where processing_batches.id = processing_batch_sources.processing_batch_id and is_farm_member(processing_batches.farm_id))
  );
create policy "processing_batch_sources: farm members can insert"
  on processing_batch_sources for insert with check (
    exists (select 1 from processing_batches where processing_batches.id = processing_batch_sources.processing_batch_id and is_farm_member(processing_batches.farm_id))
  );
create policy "processing_batch_sources: farm members can update"
  on processing_batch_sources for update using (
    exists (select 1 from processing_batches where processing_batches.id = processing_batch_sources.processing_batch_id and is_farm_member(processing_batches.farm_id))
  );
create policy "processing_batch_sources: farm owners can delete"
  on processing_batch_sources for delete using (
    exists (select 1 from processing_batches where processing_batches.id = processing_batch_sources.processing_batch_id and is_farm_owner(processing_batches.farm_id))
  );

create policy "processing_steps: farm members can view"
  on processing_steps for select using (
    exists (select 1 from processing_batches where processing_batches.id = processing_steps.processing_batch_id and is_farm_member(processing_batches.farm_id))
  );
create policy "processing_steps: farm members can insert"
  on processing_steps for insert with check (
    exists (select 1 from processing_batches where processing_batches.id = processing_steps.processing_batch_id and is_farm_member(processing_batches.farm_id))
  );
create policy "processing_steps: farm members can update"
  on processing_steps for update using (
    exists (select 1 from processing_batches where processing_batches.id = processing_steps.processing_batch_id and is_farm_member(processing_batches.farm_id))
  );
create policy "processing_steps: farm owners can delete"
  on processing_steps for delete using (
    exists (select 1 from processing_batches where processing_batches.id = processing_steps.processing_batch_id and is_farm_owner(processing_batches.farm_id))
  );
