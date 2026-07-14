'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, ListChecks, MapPin, ShieldCheck, Star, UserRound } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getMyTasks } from '@/lib/api/tasks';
import type { Task } from '@/types';
import { formatReward } from '@/lib/currency';

export default function MyPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) getMyTasks(data.user.id).then(setTasks).catch(() => setTasks([]));
    });
  }, []);

  if (user === undefined) return <div className="grid min-h-[60vh] place-items-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#007B63] border-t-transparent" /></div>;
  if (!user) return <div className="mx-auto max-w-lg px-6 py-24 text-center"><UserRound className="mx-auto mb-5 h-10 w-10 text-gray-300" /><h1 className="text-2xl font-bold">マイページにはログインが必要です</h1><p className="mt-2 text-sm text-gray-500">ヘッダーのGoogleログインから続けてください。</p></div>;

  const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User';
  const completed = tasks.filter((task) => task.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-8">
        <section className="rounded-3xl bg-[#062f29] p-7 text-white sm:p-10"><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/45">My page</p><div className="mt-5 flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-full bg-white/10 text-xl font-black">{name.charAt(0).toUpperCase()}</div><div><h1 className="text-2xl font-black">{name}</h1><p className="text-sm text-white/50">{user.email}</p></div></div></section>
        <div className="grid gap-4 sm:grid-cols-3">{[{ icon: ListChecks, label: '依頼したタスク', value: tasks.length }, { icon: ShieldCheck, label: '完了', value: completed }, { icon: Star, label: '評価', value: '—' }].map(({ icon: Icon, label, value }) => <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5"><Icon className="h-5 w-5 text-[#007B63]" /><p className="mt-4 text-2xl font-black">{value}</p><p className="text-xs text-gray-400">{label}</p></div>)}</div>
        <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
          <section className="rounded-2xl border border-gray-100 bg-white p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-bold">最近のタスク</h2><Link href="/dashboard" className="text-xs font-semibold text-[#007B63]">すべて見る</Link></div><div className="space-y-3">{tasks.slice(0, 4).map((task) => <Link href={`/tasks/${task.id}`} key={task.id} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{task.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><MapPin className="h-3 w-3" />{task.location}</p></div><strong className="shrink-0 text-sm text-[#007B63]">{formatReward(task.reward, task.currency)}</strong></Link>)}{tasks.length === 0 && <p className="py-8 text-center text-sm text-gray-400">タスクはまだありません</p>}</div></section>
          <aside className="space-y-3"><Link href="/payments" className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm"><CreditCard className="h-5 w-5 text-[#007B63]" /><div><p className="text-sm font-bold">支払い管理</p><p className="text-xs text-gray-400">デモ決済・履歴</p></div></Link><Link href="/tasks" className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm"><MapPin className="h-5 w-5 text-[#007B63]" /><div><p className="text-sm font-bold">地図から探す</p><p className="text-xs text-gray-400">近くのタスクを表示</p></div></Link></aside>
        </div>
      </div>
    </div>
  );
}
