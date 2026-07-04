'use client';

import { useState } from 'react';
import { Task } from '@/types';

interface TaskCreateFormProps {
  onTaskCreateAction: (task: Omit<Task, 'id' | 'createdAt' | 'clientId' | 'status'>) => void;
}

export default function TaskCreateForm({ onTaskCreateAction }: TaskCreateFormProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
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
    onTaskCreateAction({ title, location, description, reward: Number(reward) });
    setTitle(''); setLocation(''); setDescription(''); setReward('');
    setErrors({});
  };

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
          報酬金額（USD） <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
          <input
            type="number"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder="0"
            min={1}
            className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#007B63] focus:ring-2 focus:ring-[#007B63]/10"
          />
        </div>
        {errors.reward && <p className="mt-1 text-xs text-red-500">{errors.reward}</p>}
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
