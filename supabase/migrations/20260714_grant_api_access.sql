-- RLSは「どの行を操作できるか」を制御する。
-- 以下のGRANTはPostgRESTロールがスキーマ／テーブルへ到達するために必要。
GRANT USAGE ON SCHEMA altago TO anon, authenticated, service_role;

-- 公開参照。実際に見える行は各テーブルのRLSポリシーに従う。
GRANT SELECT ON altago.users, altago.tasks, altago.reviews
TO anon, authenticated;

-- 認証ユーザー向け操作。こちらもRLSで本人・参加者のみに制限される。
GRANT INSERT, UPDATE ON altago.users, altago.tasks, altago.reviews
TO authenticated;

NOTIFY pgrst, 'reload schema';

GRANT SELECT, INSERT, UPDATE ON
  altago.applications,
  altago.messages,
  altago.proofs,
  altago.payments
TO authenticated;
