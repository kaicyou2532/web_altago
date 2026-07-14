import { createClient } from '@/lib/supabase/client';
import type { Application, ApplicationStatus } from '@/types';

export type TaskApplicationDetails = Application & {
  runnerName: string;
  runnerAvatarUrl?: string;
  runnerCity?: string;
  runnerRating: number;
};

type ApplicationRow = {
  id: string;
  task_id: string;
  runner_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
};

type RunnerRow = {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  rating_avg: number | string;
};

function mapApplication(row: ApplicationRow, runner?: RunnerRow): TaskApplicationDetails {
  return {
    id: row.id,
    taskId: row.task_id,
    runnerId: row.runner_id,
    message: row.message ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    runnerName: runner?.name ?? '応募者',
    runnerAvatarUrl: runner?.avatar_url ?? undefined,
    runnerCity: runner?.city ?? undefined,
    runnerRating: Number(runner?.rating_avg ?? 0),
  };
}

/** 依頼者向け：タスクに届いた応募一覧。 */
export async function getTaskApplications(taskId: string): Promise<TaskApplicationDetails[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .select('id, task_id, runner_id, message, status, created_at')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const applications = (data ?? []) as ApplicationRow[];
  const runnerIds = [...new Set(applications.map((application) => application.runner_id))];
  if (runnerIds.length === 0) return [];

  const { data: runners, error: runnerError } = await supabase
    .from('users')
    .select('id, name, avatar_url, city, rating_avg')
    .in('id', runnerIds);
  if (runnerError) throw runnerError;
  const runnerMap = new Map((runners as RunnerRow[]).map((runner) => [runner.id, runner]));
  return applications.map((application) => mapApplication(application, runnerMap.get(application.runner_id)));
}

/** チャット参加者向け：応募情報を1件取得。RLSで当事者だけに制限される。 */
export async function getApplicationById(applicationId: string): Promise<TaskApplicationDetails | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .select('id, task_id, runner_id, message, status, created_at')
    .eq('id', applicationId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const application = data as ApplicationRow;
  const { data: runner, error: runnerError } = await supabase
    .from('users')
    .select('id, name, avatar_url, city, rating_avg')
    .eq('id', application.runner_id)
    .maybeSingle();
  if (runnerError) throw runnerError;
  return mapApplication(application, (runner as RunnerRow | null) ?? undefined);
}
