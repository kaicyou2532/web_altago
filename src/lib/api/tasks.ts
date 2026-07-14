import { createClient } from '@/lib/supabase/client';
import type { Application, Task, DbTask } from '@/types';
import { mapDbTask } from '@/types';

export type CreateTaskInput = {
  title: string;
  description: string;
  location: string;
  reward: number;
  currency: string;
  tags: string[];
  latitude: number;
  longitude: number;
};

export type TaskSearchResult = {
  tasks: Task[];
  total: number;
};

/** 検索条件に一致するタスクをDB側で絞り込み、指定ページだけ取得する。 */
export async function getTasks(filter?: {
  status?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<TaskSearchResult> {
  const supabase = createClient();
  const page = Math.max(1, filter?.page ?? 1);
  const pageSize = Math.max(1, filter?.pageSize ?? 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let q = supabase.from('tasks').select('*', { count: 'exact' });

  if (filter?.status && filter.status !== 'ALL') {
    q = q.eq('status', filter.status);
  }
  const query = filter?.query?.trim();
  if (query) {
    const escapedQuery = query.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    q = q.or(
      `title.ilike."%${escapedQuery}%",city.ilike."%${escapedQuery}%"`
    );
  }

  const { data, error, count } = await q
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return {
    tasks: (data as DbTask[]).map(mapDbTask),
    total: count ?? 0,
  };
}

/** ヘッダー表示用の募集中タスク件数。行データは取得しない。 */
export async function getOpenTaskCount(): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'OPEN');
  if (error) throw error;
  return count ?? 0;
}

/** 自分が依頼したタスク（Dashboard向け） */
export async function getMyTasks(userId: string): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbTask[]).map(mapDbTask);
}

/** タスク詳細 */
export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return mapDbTask(data as DbTask);
}

/** タスク作成 */
export async function createTask(
  userId: string,
  input: CreateTaskInput
): Promise<Task> {
  const supabase = createClient();
  const city = input.location.split(',')[0].trim();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      client_id: userId,
      title: input.title,
      description: input.description,
      city,
      country_code: 'XX',
      reward_usd: input.reward,
      currency: input.currency,
      tags: input.tags,
      latitude: input.latitude,
      longitude: input.longitude,
    })
    .select()
    .single();
  if (error) throw error;
  return mapDbTask(data as DbTask);
}

/** ランナーがタスクに応募 */
export async function applyToTask(
  taskId: string,
  runnerId: string,
  message?: string
): Promise<Application> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .insert({
      task_id: taskId,
      runner_id: runnerId,
      message: message?.trim() || null,
    })
    .select('id, task_id, runner_id, message, status, created_at')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    taskId: data.task_id,
    runnerId: data.runner_id,
    message: data.message ?? undefined,
    status: data.status,
    createdAt: data.created_at,
  };
}

/** ログイン中Runnerの、このタスクへの応募を取得する。 */
export async function getMyApplication(
  taskId: string,
  runnerId: string
): Promise<Application | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .select('id, task_id, runner_id, message, status, created_at')
    .eq('task_id', taskId)
    .eq('runner_id', runnerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    taskId: data.task_id,
    runnerId: data.runner_id,
    message: data.message ?? undefined,
    status: data.status,
    createdAt: data.created_at,
  };
}
