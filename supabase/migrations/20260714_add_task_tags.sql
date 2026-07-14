ALTER TABLE altago.tasks
ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_tasks_tags ON altago.tasks USING GIN (tags);
