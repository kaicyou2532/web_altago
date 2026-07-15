'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types';
import { getMyTasks, createTask, type CreateTaskInput } from '@/lib/api/tasks';
import { createClient } from '@/lib/supabase/client';
import TaskCreateForm from '@/components/TaskCreateForm';
import { MapPin, Clock, ChevronRight, Plus, X, LogIn } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { formatReward } from '@/lib/currency';

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  OPEN:        { label: '募集中',       bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  ASSIGNED:    { label: 'マッチング済', bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  IN_PROGRESS: { label: '進行中',       bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  COMPLETED:   { label: '完了',         bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400' },
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        try {
          const myTasks = await getMyTasks(user.id);
          setTasks(myTasks);
        } catch {
          // エラーは無視してempty状態を表示
        }
      }
      setLoading(false);
    });
  }, []);

  const handleTaskCreate = async (data: CreateTaskInput) => {
    if (!user) throw new Error('ログインが必要です');
    setCreateError(null);
    try {
      const newTask = await createTask(user.id, data);
      setTasks((prev) => [newTask, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : '';
      setCreateError(
        code === '23503'
          ? 'ユーザープロフィールが未作成です。タスク作成用マイグレーションを実行してください。'
          : code === '42501'
            ? 'タスクを作成する権限がありません。RLS設定を確認してください。'
            : message.includes('schema cache')
              ? 'Supabaseのスキーマキャッシュが更新されていません。PostgRESTを再読み込みしてください。'
              : `タスクの作成に失敗しました${code ? `（${code}）` : ''}。もう一度お試しください。`
      );
      throw error;
    }
  };

  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === 'OPEN').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#007B63] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-2">
          <LogIn className="h-7 w-7 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">ログインが必要です</h1>
        <p className="text-sm text-gray-500">ダッシュボードを利用するにはGoogleでログインしてください。</p>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
            });
          }}
          className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white mt-2"
          style={{ background: '#007B63' }}
        >
          Googleでログイン
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-1">DASHBOARD</p>
              <h1 className="text-2xl font-bold text-gray-900">マイタスク</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#007B63' }}
            >
              <Plus className="h-4 w-4" /> 新しいタスクを作成
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '合計', value: stats.total },
              { label: '募集中', value: stats.open },
              { label: '進行中', value: stats.inProgress },
              { label: '完了', value: stats.completed },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Plus className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-gray-900 font-semibold mb-1">タスクがまだありません</p>
            <p className="text-sm text-gray-400">「新しいタスクを作成」から最初の依頼を投稿しましょう。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const s = statusConfig[task.status];
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
                >
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                        {s.label}
                      </span>
                      <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{task.location}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(task.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold" style={{ color: '#007B63' }}>{formatReward(task.reward, task.currency)}</p>
                    <p className="text-xs text-gray-400">{task.currency}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create task modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">新しいタスクを作成</h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-7 py-6">
              {createError && (
                <p className="text-xs text-red-500 mb-4">{createError}</p>
              )}
              <TaskCreateForm onTaskCreateAction={handleTaskCreate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
