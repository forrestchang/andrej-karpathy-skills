-- =============================================
-- 005: 修正建立農場的 RLS 問題與權限提升漏洞
-- =============================================

-- 修正：INSERT ... RETURNING 需通過 SELECT 政策，但建立農場當下使用者
-- 尚未成為 farm_members 成員，導致寫入後讀不回、整個操作被撤銷
-- （"new row violates row-level security policy for table farms"）
drop policy if exists "farms: members can view" on farms;
create policy "farms: members and owner can view"
  on farms for select using (is_farm_member(id) or owner_id = auth.uid());

-- 安全性修正：原政策僅檢查 user_id = auth.uid()，任何登入者皆可把自己
-- 插入「任何」現有農場的 farm_members 並宣稱自己是 owner（權限提升漏洞）。
-- 收緊為：僅該農場的建立者（owner_id）本人可把自己登記為 owner。
-- 邀請碼加入流程走 join_farm_by_invite_code（security definer），不受影響。
drop policy if exists "farm_members: can insert own membership" on farm_members;
create policy "farm_members: farm creator can insert self as owner"
  on farm_members for insert with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (select 1 from farms where id = farm_id and owner_id = auth.uid())
  );
