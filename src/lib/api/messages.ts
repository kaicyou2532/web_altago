import { createClient } from '@/lib/supabase/client';
import type { Message, DbMessage } from '@/types';
import { mapDbMessage } from '@/types';

/** タスクのメッセージ一覧を取得 */
export async function getMessages(taskId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*, users(name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as DbMessage[]).map(mapDbMessage);
}

/** メッセージ送信 */
export async function sendMessage(
  taskId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({ task_id: taskId, sender_id: senderId, content })
    .select('*, users(name)')
    .single();
  if (error) throw error;
  return mapDbMessage(data as DbMessage);
}
