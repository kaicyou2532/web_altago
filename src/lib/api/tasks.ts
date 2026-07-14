import { createClient } from '@/lib/supabase/client';
import type { Task, DbTask } from '@/types';
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

/** 全 OPEN タスク（Runner向けタスク一覧） */
export async function getTasks(filter?: {
  status?: string;
  query?: string;
}): Promise<Task[]> {
  const supabase = createClient();
  let q = supabase.from('tasks').select('*');

  if (filter?.status && filter.status !== 'ALL') {
    q = q.eq('status', filter.status);
  }
  if (filter?.query) {
    q = q.or(
      `title.ilike.%${filter.query}%,city.ilike.%${filter.query}%`
    );
  }

  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbTask[]).map(mapDbTask);
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
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('applications').insert({
    task_id: taskId,
    runner_id: runnerId,
    message: message ?? null,
  });
  if (error) throw error;
}
