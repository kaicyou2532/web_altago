'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { currencies } from '@/lib/currency';
import type { CreateTaskInput } from '@/lib/api/tasks';

const TaskLocationPicker = dynamic(() => import('@/components/TaskLocationPicker'), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-xl bg-gray-100" />,
});

interface TaskCreateFormProps {
  onTaskCreateAction: (task: CreateTaskInput) => void;
}

export default function TaskCreateForm({ onTaskCreateAction }: TaskCreateFormProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [latitude, setLatitude] = useState(35.6812);
  const [longitude, setLongitude] = useState(139.7671);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'タイトルを入力してください';
    if (!location.trim()) e.location = '国・地域を入力してください';
    if (!description.trim()) e.description = '詳細を入力してください';
    if (!reward || Number(reward) <= 0) e.reward = '有効な報酬金額を入力してください';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onTaskCreateAction({ title, location, description, reward: Number(reward), currency, tags, latitude, longitude });
    setTitle(''); setLocation(''); setDescription(''); setReward('');
    setErrors({});
  };

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 5) setTags((current) => [...current, tag]);
    setTagInput('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          タスクタイトル <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：パリの花屋で赤いバラを買ってきてほしい"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#007B63] focus:ring-2 focus:ring-[#007B63]/10"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">実施場所</label>
        <TaskLocationPicker latitude={latitude} longitude={longitude} onChangeAction={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          国・地域 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="例：Paris, France"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#007B63] focus:ring-2 focus:ring-[#007B63]/10"
        />
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          タスク詳細 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="ランナーへの具体的な指示を記載してください。何をどこで、どのくらいの予算で、など。"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#007B63] focus:ring-2 focus:ring-[#007B63]/10 resize-none"
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Reward */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          報酬金額・通貨 <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#007B63]">
            {currencies.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}
          </select>
          <input
            type="number"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder="0"
            min={1}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#007B63] focus:ring-2 focus:ring-[#007B63]/10"
          />
        </div>
        {errors.reward && <p className="mt-1 text-xs text-red-500">{errors.reward}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">タグ（最大5件）</label>
        <div className="flex gap-2">
          <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} placeholder="例：買い物代行" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#007B63]" />
          <button type="button" onClick={addTag} className="rounded-xl border border-gray-200 px-4 text-sm font-semibold">追加</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => <button type="button" key={tag} onClick={() => setTags((current) => current.filter((item) => item !== tag))} className="rounded-full bg-[#e6f4f1] px-3 py-1 text-xs font-medium text-[#007B63]">#{tag} ×</button>)}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: '#007B63' }}
      >
        タスクを投稿する
      </button>
    </form>
  );
}
