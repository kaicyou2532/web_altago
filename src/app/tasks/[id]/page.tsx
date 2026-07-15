'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTaskById, applyToTask, getMyApplication } from '@/lib/api/tasks';
import { getMessages, sendMessage } from '@/lib/api/messages';
import { getTaskApplications, type TaskApplicationDetails } from '@/lib/api/applications';
import { createClient } from '@/lib/supabase/client';
import { Task, Message, TaskStatus, Application } from '@/types';
import { MapPin, ArrowLeft, Send, CheckCircle2, Clock, AlertCircle, MessageCircle, Star } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { formatReward } from '@/lib/currency';
import Link from 'next/link';

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
  const [application, setApplication] = useState<Application | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [taskApplications, setTaskApplications] = useState<TaskApplicationDetails[]>([]);
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
    if (!id || !user || !task) return;
    const isParticipant = user.id === task.clientId || user.id === task.runnerId;
    if (!isParticipant || (task.status !== 'ASSIGNED' && task.status !== 'IN_PROGRESS')) return;
    getMessages(id)
      .then(setMessages)
      .catch((error) => console.error('Failed to load messages:', error));
  }, [id, task, user]);

  // 自分の応募状態を復元（再読込後の重複応募を防ぐ）
  useEffect(() => {
    if (!id || !user) return;
    getMyApplication(id, user.id)
      .then(setApplication)
      .catch((error) => console.error('Failed to load application:', error));
  }, [id, user]);

  // 公開チャット一覧
  useEffect(() => {
    if (!id || !task) return;
    getTaskApplications(id)
      .then(setTaskApplications)
      .catch((error) => console.error('Failed to load task applications:', error));
  }, [id, task]);

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
  const canApply = task.status === 'OPEN' && !application && !isClient && !!user;
  const showChat = (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') && (isClient || isRunner);

  async function handleApply() {
    if (!user || applying) return;
    const message = applicationMessage.trim();
    if (message.length < 10) {
      setApplicationError('応募メッセージを10文字以上入力してください。');
      return;
    }
    setApplying(true);
    setApplicationError(null);
    try {
      const created = await applyToTask(task!.id, user.id, message);
      setApplication(created);
      setApplicationMessage('');
    } catch (error) {
      console.error('Failed to apply to task:', error);
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      setApplicationError(
        code === '23505'
          ? 'このタスクにはすでに応募済みです。'
          : code === '23503'
            ? 'ユーザープロフィールが未作成です。応募用マイグレーションを適用してください。'
            : '応募を送信できませんでした。時間をおいてもう一度お試しください。'
      );
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
              <span className="flex items-center gap-1 font-semibold text-gray-900">{formatReward(task.reward, task.currency)}</span>
            </div>

            {task.tags.length > 0 && <div className="flex flex-wrap gap-2">{task.tags.map((tag) => <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">#{tag}</span>)}</div>}

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
              <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div>
                  <label htmlFor="application-message" className="mb-1.5 block text-sm font-semibold text-gray-800">応募メッセージ</label>
                  <p className="mb-2 text-xs text-gray-500">対応可能な日時や経験、依頼者に伝えたいことを入力してください。</p>
                  <textarea
                    id="application-message"
                    value={applicationMessage}
                    onChange={(event) => setApplicationMessage(event.target.value)}
                    rows={5}
                    maxLength={1000}
                    placeholder="例：現地から徒歩10分の場所に住んでいます。明日の午後に対応可能です。写真と動画で詳しく報告します。"
                    className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#007B63] focus:ring-2 focus:ring-emerald-100"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-gray-400"><span>10文字以上</span><span>{applicationMessage.length}/1000</span></div>
                </div>
                {applicationError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{applicationError}</p>}
                <button
                  onClick={handleApply}
                  disabled={applying || applicationMessage.trim().length < 10}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: '#007B63' }}
                >
                  {applying ? '応募を送信中...' : '応募を送信する'}
                </button>
              </div>
            )}

            {application && (
              <div className="space-y-3 rounded-xl p-4 text-sm" style={{ backgroundColor: '#e6f4f1', color: '#007B63' }}>
                <p className="text-center font-semibold">✓ 応募済み（{application.status === 'PENDING' ? '承認待ち' : application.status === 'ACCEPTED' ? '採用' : application.status === 'REJECTED' ? '不採用' : '辞退済み'}）</p>
                <Link href={`/tasks/${task.id}/applications/${application.id}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-semibold shadow-sm hover:bg-emerald-50">
                  <MessageCircle className="h-4 w-4" />依頼者とチャットする
                </Link>
              </div>
            )}

            {task.status === 'COMPLETED' && (
              <div className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-gray-100 text-gray-400">
                このタスクは完了済みです
              </div>
            )}
          </div>
        </div>

        {taskApplications.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">公開チャット</h2>
                <p className="mt-0.5 text-xs text-gray-400">応募者との会話は誰でも閲覧できます</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">{taskApplications.length}件</span>
            </div>
              <div className="divide-y divide-gray-100">
                {taskApplications.map((candidate) => (
                  <div key={candidate.id} className="p-5">
                    <div className="flex items-start gap-3">
                      {candidate.runnerAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={candidate.runnerAvatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">{candidate.runnerName.slice(0, 1)}</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900">{candidate.runnerName}</p>
                          <span className="flex items-center gap-1 text-xs text-amber-600"><Star className="h-3.5 w-3.5 fill-current" />{candidate.runnerRating.toFixed(1)}</span>
                          {candidate.runnerCity && <span className="text-xs text-gray-400">{candidate.runnerCity}</span>}
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{candidate.message || '応募メッセージはありません'}</p>
                      </div>
                    </div>
                    <Link href={`/tasks/${task.id}/applications/${candidate.id}`} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-[#007B63] hover:bg-emerald-50">
                      <MessageCircle className="h-4 w-4" />公開チャットを見る
                    </Link>
                  </div>
                ))}
              </div>
          </section>
        )}

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
