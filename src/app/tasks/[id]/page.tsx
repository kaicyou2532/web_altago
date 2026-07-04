'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTaskById, applyToTask } from '@/lib/api/tasks';
import { getMessages, sendMessage } from '@/lib/api/messages';
import { createClient } from '@/lib/supabase/client';
import { Task, Message, TaskStatus } from '@/types';
import { MapPin, ArrowLeft, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const STATUS_LABEL: Record<TaskStatus, string> = {
  OPEN: '募集中',
  ASSIGNED: '交渉中',
  IN_PROGRESS: '対応中',
  COMPLETED: '完了',
};

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  OPEN: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  ASSIGNED: <Clock className="w-4 h-4 text-blue-500" />,
  IN_PROGRESS: <AlertCircle className="w-4 h-4 text-amber-500" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [task, setTask] = useState<Task | null | undefined>(undefined); // undefined=loading
  const [messages, setMessages] = useState<Message[]>([]);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 認証ユーザー取得
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // タスク取得
  useEffect(() => {
    if (!id) return;
    getTaskById(id).then(setTask);
  }, [id]);

  // メッセージ取得
  useEffect(() => {
    if (!id || !user) return;
    getMessages(id).then(setMessages);
  }, [id, user]);

  // 新着メッセージで自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (task === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#007B63] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        タスクが見つかりません
      </div>
    );
  }

  const isClient = user?.id === task.clientId;
  const isRunner = user?.id === task.runnerId;
  const canApply = task.status === 'OPEN' && !applied && !isClient && !!user;
  const showChat = (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || applied) && (isClient || isRunner || applied);

  async function handleApply() {
    if (!user) return;
    setApplying(true);
    try {
      await applyToTask(task!.id, user.id);
      setApplied(true);
    } catch {
      // エラー表示は省略
    } finally {
      setApplying(false);
    }
  }

  async function handleSend() {
    const trimmed = chatInput.trim();
    if (!trimmed || !user || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(task!.id, user.id, trimmed);
      setMessages((prev) => [...prev, msg]);
      setChatInput('');
    } catch {
      // エラー表示は省略
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-800 truncate flex-1">
            {task.title}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Task card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div
            className="px-5 py-2.5 text-xs font-semibold flex items-center gap-2"
            style={{
              backgroundColor: task.status === 'OPEN' ? '#e6f4f1' : '#f3f4f6',
              color: task.status === 'OPEN' ? '#007B63' : '#6b7280',
            }}
          >
            {STATUS_ICON[task.status]}
            {STATUS_LABEL[task.status]}
          </div>

          <div className="px-5 py-5 space-y-4">
            <h1 className="text-lg font-bold text-gray-950 leading-snug">{task.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {task.location}
              </span>
              <span className="flex items-center gap-1 font-semibold text-gray-900">
                <span className="text-base">$</span>
                {task.reward}
              </span>
            </div>

            <hr className="border-gray-100" />

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">依頼内容</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{task.description}</p>
            </div>

            {/* CTAs */}
            {!user && task.status === 'OPEN' && (
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback?next=/tasks/${task.id}` },
                  });
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: '#007B63' }}
              >
                ログインして応募する
              </button>
            )}

            {canApply && (
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#007B63' }}
              >
                {applying ? '応募中...' : 'このタスクに応募する'}
              </button>
            )}

            {applied && (
              <div
                className="w-full py-3 rounded-xl text-sm font-semibold text-center"
                style={{ backgroundColor: '#e6f4f1', color: '#007B63' }}
              >
                ✓ 応募しました — クライアントの承認をお待ちください
              </div>
            )}

            {task.status === 'COMPLETED' && (
              <div className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-gray-100 text-gray-400">
                このタスクは完了済みです
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        {showChat && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">メッセージ</p>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">メッセージはまだありません</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[11px] text-gray-400">{msg.senderName}</span>
                      <div
                        className="px-3.5 py-2.5 rounded-2xl text-sm max-w-[80%] leading-relaxed"
                        style={isMe
                          ? { backgroundColor: '#007B63', color: '#fff' }
                          : { backgroundColor: '#f3f4f6', color: '#1f2937' }
                        }
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-300">
                        {new Date(msg.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="メッセージを入力..."
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#007B63' } as React.CSSProperties}
              />
              <button
                onClick={handleSend}
                disabled={!chatInput.trim() || sending}
                className="p-2 rounded-lg text-white transition-opacity disabled:opacity-30"
                style={{ backgroundColor: '#007B63' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
