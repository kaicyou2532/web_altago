-- OAuthログイン済みでもaltago.usersが存在しない既存ユーザーを補完する。
INSERT INTO altago.users (id, name, email, avatar_url)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  au.email,
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE au.email IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM altago.users u WHERE u.id = au.id)
ON CONFLICT DO NOTHING;

GRANT USAGE ON SCHEMA altago TO authenticated;
GRANT SELECT, INSERT ON altago.tasks TO authenticated;

ALTER TABLE altago.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks: insert authenticated" ON altago.tasks;
CREATE POLICY "tasks: insert authenticated"
ON altago.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM altago.users u
    WHERE u.id = (SELECT auth.uid())
      AND u.is_active = TRUE
  )
);

NOTIFY pgrst, 'reload schema';
