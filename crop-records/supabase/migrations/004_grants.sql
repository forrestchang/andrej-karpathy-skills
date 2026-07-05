-- =============================================
-- 004: 恢復 Supabase 標準資料表權限
-- （部署環境發現 anon/authenticated/service_role 缺少基本 CRUD 權限，
--   造成「permission denied for table farms」；資料列級安全仍由 RLS 政策控管）
-- =============================================
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

-- 未來新建的表也自動套用
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
