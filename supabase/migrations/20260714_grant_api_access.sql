-- RLSは「どの行を操作できるか」を制御する。
-- 以下のGRANTはPostgRESTロールがスキーマ／テーブルへ到達するために必要。
GRANT USAGE ON SCHEMA altago TO anon, authenticated, service_role;

-- 公開参照。実際に見える行は各テーブルのRLSポリシーに従う。
GRANT SELECT ON altago.users, altago.tasks, altago.reviews
TO anon, authenticated;

-- 認証ユーザー向け操作。こちらもRLSで本人・参加者のみに制限される。
GRANT INSERT, UPDATE ON altago.users, altago.tasks, altago.reviews
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON
  altago.applications,
  altago.messages,
  altago.proofs,
  altago.payments
TO authenticated;

-- RLSが有効な環境でも、募集中タスクは一覧に表示できるようにする。
-- 既存環境へ再適用しても重複しないよう、同名ポリシーを作り直す。
ALTER TABLE altago.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks: select open" ON altago.tasks;
CREATE POLICY "tasks: select open"
ON altago.tasks
FOR SELECT
TO anon, authenticated
USING (
  status = 'OPEN'::altago.task_status
  OR client_id = (SELECT auth.uid())
  OR runner_id = (SELECT auth.uid())
);

-- GRANT／ポリシー変更をPostgRESTへ即時反映する。
NOTIFY pgrst, 'reload schema';
