-- タスク作成の認可は、ログイン中ユーザー本人の client_id だけで判定する。
-- users テーブルへの副問い合わせは、環境ごとのRLS設定に影響されて
-- 正常な認証ユーザーまで拒否することがあるため使用しない。
GRANT USAGE ON SCHEMA altago TO authenticated;
GRANT SELECT, INSERT ON altago.tasks TO authenticated;

ALTER TABLE altago.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks: insert authenticated" ON altago.tasks;
CREATE POLICY "tasks: insert authenticated"
ON altago.tasks
FOR INSERT
TO authenticated
WITH CHECK (client_id = (SELECT auth.uid()));

NOTIFY pgrst, 'reload schema';
