'use client';

import { FormEvent, useState, useEffect } from 'react';
import { getOpenTaskCount, getTasks } from '@/lib/api/tasks';
import { Task, TaskStatus } from '@/types';
import { MapPin, ChevronLeft, ChevronRight, Search, List, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { LatLngBounds } from 'leaflet';
import { formatReward } from '@/lib/currency';

const TasksMap = dynamic(() => import('@/components/TasksMap'), { ssr: false, loading: () => <div className="h-full animate-pulse bg-gray-100" /> });
const PAGE_SIZE = 10;

const STATUS_LABEL: Record<TaskStatus, string> = {
  OPEN: '募集中',
  ASSIGNED: '交渉中',
  IN_PROGRESS: '対応中',
  COMPLETED: '完了',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ASSIGNED: 'bg-blue-50 text-blue-700 border border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-200',
  COMPLETED: 'bg-gray-100 text-gray-500 border border-gray-200',
};

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [requestKey, setRequestKey] = useState(0);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  useEffect(() => {
    let active = true;
    getTasks({ status: filterStatus, query, page, pageSize: PAGE_SIZE })
      .then(({ tasks, total: matchingTotal }) => {
        if (!active) return;
        setAllTasks(tasks);
        setTotal(matchingTotal);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Failed to load tasks:', error);
        setLoadError('タスクを読み込めませんでした。SupabaseのAPI設定と権限を確認してください。');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [filterStatus, page, query, requestKey]);

  useEffect(() => {
    getOpenTaskCount().then(setOpenCount).catch((error) => {
      console.error('Failed to load open task count:', error);
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setLoadError(null);
    setPage(1);
    setQuery(queryInput.trim());
    setRequestKey((key) => key + 1);
  }

  function selectStatus(status: TaskStatus | 'ALL') {
    setLoading(true);
    setLoadError(null);
    setPage(1);
    setFilterStatus(status);
    setRequestKey((key) => key + 1);
  }

  function selectPage(nextPage: number) {
    setLoading(true);
    setLoadError(null);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filtered = allTasks.filter((t) => {
    const matchBounds = view !== 'map' || !mapBounds || t.latitude == null || t.longitude == null || mapBounds.contains([t.latitude, t.longitude]);
    return matchBounds;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-sm font-medium mb-1" style={{ color: '#007B63' }}>
            Runner向け
          </p>
          <h1 className="text-2xl font-bold text-gray-950 mb-1">オープンタスク</h1>
          <p className="text-sm text-gray-500">
            現在{' '}
            <span className="font-semibold text-gray-900">{loading ? '...' : openCount}件</span>{' '}
            の依頼が募集中です
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
        <form onSubmit={submitSearch} className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="タスク名・都市名で検索"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#007B63' } as React.CSSProperties}
            />
          </div>
          <button type="submit" className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#007B63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#006653]">
            <Search className="h-4 w-4" />検索
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => selectStatus(s)}
              className="px-3 py-1 text-xs font-medium rounded-full border transition-colors"
              style={
                filterStatus === s
                  ? { backgroundColor: '#007B63', color: '#fff', borderColor: '#007B63' }
                  : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
              }
            >
              {s === 'ALL' ? 'すべて' : STATUS_LABEL[s]}
            </button>
          ))}
          <div className="ml-auto flex rounded-lg border border-gray-200 bg-white p-1">
            <button onClick={() => setView('list')} className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}><List className="h-3.5 w-3.5" />一覧</button>
            <button onClick={() => setView('map')} className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs ${view === 'map' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}><MapIcon className="h-3.5 w-3.5" />地図</button>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-3">
        {loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{loadError}</div>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#007B63] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === 'map' ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="h-[65vh] overflow-hidden rounded-2xl border border-gray-200 bg-white"><TasksMap tasks={allTasks} onBoundsChangeAction={setMapBounds} /></div>
              <div className="max-h-[65vh] space-y-3 overflow-y-auto">{filtered.length ? filtered.map((task) => <TaskCard key={task.id} task={task} />) : <p className="rounded-xl bg-white p-6 text-sm text-gray-400">この地図範囲にタスクはありません</p>}</div>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={selectPage} />
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            条件に一致するタスクがありません
          </div>
        ) : (
          <>
            {filtered.map((task) => <TaskCard key={task.id} task={task} />)}
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={selectPage} />
          </>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, total, onPageChange }: { page: number; totalPages: number; total: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between gap-3 pt-5" aria-label="タスク一覧のページネーション">
      <p className="text-xs text-gray-500">全{total}件・{page}/{totalPages}ページ</p>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" />前へ
        </button>
        <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40">
          次へ<ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

function TaskCard({ task }: { task: Task }) {
  const isApplyable = task.status === 'OPEN';

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[task.status]}`}>
                {STATUS_LABEL[task.status]}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                {task.location}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
              {task.title}
            </p>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="font-bold text-gray-900"><span className="text-lg">{formatReward(task.reward, task.currency)}</span></div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        </div>
        {isApplyable && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: '#e6f4f1', color: '#007B63' }}
            >
              応募可能
            </span>
          </div>
        )}
        {task.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{task.tags.map((tag) => <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">#{tag}</span>)}</div>}
      </div>
    </Link>
  );
}
