-- 応募ごとに会話を分離する。既存のタスク参加者チャットはNULLのまま維持する。
ALTER TABLE altago.messages
ADD COLUMN IF NOT EXISTS application_id UUID
REFERENCES altago.applications(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_application
ON altago.messages(application_id, created_at);

GRANT SELECT, INSERT, UPDATE ON altago.messages TO authenticated;
ALTER TABLE altago.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages: select participants" ON altago.messages;
CREATE POLICY "messages: select participants"
ON altago.messages
FOR SELECT
TO authenticated
USING (
  (
    application_id IS NULL
    AND EXISTS (
      SELECT 1 FROM altago.tasks t
      WHERE t.id = messages.task_id
        AND (t.client_id = (SELECT auth.uid()) OR t.runner_id = (SELECT auth.uid()))
    )
  )
  OR EXISTS (
    SELECT 1
    FROM altago.applications a
    JOIN altago.tasks t ON t.id = a.task_id
    WHERE a.id = messages.application_id
      AND a.task_id = messages.task_id
      AND (a.runner_id = (SELECT auth.uid()) OR t.client_id = (SELECT auth.uid()))
  )
);

DROP POLICY IF EXISTS "messages: insert participants" ON altago.messages;
CREATE POLICY "messages: insert participants"
ON altago.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND (
    (
      application_id IS NULL
      AND EXISTS (
        SELECT 1 FROM altago.tasks t
        WHERE t.id = messages.task_id
          AND (t.client_id = (SELECT auth.uid()) OR t.runner_id = (SELECT auth.uid()))
      )
    )
    OR EXISTS (
      SELECT 1
      FROM altago.applications a
      JOIN altago.tasks t ON t.id = a.task_id
      WHERE a.id = messages.application_id
        AND a.task_id = messages.task_id
        AND (a.runner_id = (SELECT auth.uid()) OR t.client_id = (SELECT auth.uid()))
    )
  )
);

NOTIFY pgrst, 'reload schema';
