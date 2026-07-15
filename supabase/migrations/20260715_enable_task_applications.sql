-- 今後作成されるOAuthユーザーのプロフィールを自動作成する。
CREATE OR REPLACE FUNCTION altago.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = altago
AS $$
BEGIN
  INSERT INTO altago.users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION altago.handle_new_auth_user();

-- 既存OAuthユーザーにプロフィールがない場合、応募の外部キー制約を満たすため補完する。
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
GRANT SELECT, INSERT ON altago.applications TO authenticated;

ALTER TABLE altago.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications: select own" ON altago.applications;
CREATE POLICY "applications: select own"
ON altago.applications
FOR SELECT
TO authenticated
USING (
  runner_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1
    FROM altago.tasks t
    WHERE t.id = task_id
      AND t.client_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "applications: insert runner" ON altago.applications;
CREATE POLICY "applications: insert runner"
ON altago.applications
FOR INSERT
TO authenticated
WITH CHECK (
  runner_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM altago.tasks t
    WHERE t.id = task_id
      AND t.status = 'OPEN'::altago.task_status
      AND t.client_id <> (SELECT auth.uid())
  )
);

NOTIFY pgrst, 'reload schema';
