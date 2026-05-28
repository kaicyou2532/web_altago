'use client';

import { useState } from 'react';
import { mockTasks } from '@/lib/mockData';
import { Task, TaskStatus } from '@/types';
import { MapPin, DollarSign, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

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
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');

  const filtered = mockTasks.filter((t) => {
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchQuery =
      query === '' ||
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.location.toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchQuery;
  });

  const openCount = mockTasks.filter((t) => t.status === 'OPEN').length;

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
            <span className="font-semibold text-gray-900">{openCount}件</span>{' '}
            の依頼が募集中です
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="タスク名・都市名で検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#007B63' } as React.CSSProperties}
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
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
        </div>
      </div>

      {/* Task list */}
      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            条件に一致するタスクがありません
          </div>
        ) : (
          filtered.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const isApplyable = task.status === 'OPEN';

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Status + Location */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[task.status]}`}
              >
                {STATUS_LABEL[task.status]}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                {task.location}
              </span>
            </div>

            {/* Title */}
            <p className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
              {task.title}
            </p>

            {/* Description preview */}
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Reward + Arrow */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-0.5 font-bold text-gray-900">
              <DollarSign className="w-4 h-4" />
              <span className="text-lg">{task.reward}</span>
            </div>
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
      </div>
    </Link>
  );
}
