'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { ArrowLeft, MapPin, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getTaskById } from '@/lib/api/tasks';
import { getApplicationById, type TaskApplicationDetails } from '@/lib/api/applications';
import { getApplicationMessages, sendApplicationMessage } from '@/lib/api/messages';
import type { Message, Task } from '@/types';

export default function ApplicationChatPage() {
  const { id, applicationId } = useParams<{ id: string; applicationId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [application, setApplication] = useState<TaskApplicationDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { user: currentUser } } = await createClient().auth.getUser();
        if (!currentUser) throw new Error('AUTH_REQUIRED');
        const [loadedTask, loadedApplication, loadedMessages] = await Promise.all([
          getTaskById(id),
          getApplicationById(applicationId),
          getApplicationMessages(applicationId),
        ]);
        if (!loadedTask || !loadedApplication || loadedApplication.taskId !== id) {
          throw new Error('NOT_FOUND');
        }
        if (!active) return;
        setUser(currentUser);
        setTask(loadedTask);
        setApplication(loadedApplication);
        setMessages(loadedMessages);
      } catch (loadError) {
        console.error('Failed to load application chat:', loadError);
        if (active) setError('チャットを表示できません。応募者または依頼者としてログインしてください。');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [applicationId, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const content = input.trim();
    if (!content || !user || !task || !application || sending) return;
    setSending(true);
    setError(null);
    try {
      const message = await sendApplicationMessage(task.id, application.id, user.id, content);
      setMessages((current) => [...current, message]);
      setInput('');
    } catch (sendError) {
      console.error('Failed to send application message:', sendError);
      setError('メッセージを送信できませんでした。');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><div className="h-7 w-7 animate-spin rounded-full border-2 border-[#007B63] border-t-transparent" /></div>;
  }

  if (!task || !application || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center text-sm text-red-600">{error ?? 'チャットが見つかりません'}</div>;
  }

  const isClient = user.id === task.clientId;
  const partnerName = isClient ? application.runnerName : '依頼者';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-16 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button type="button" onClick={() => router.back()} className="rounded-lg p-2 hover:bg-gray-100" aria-label="戻る"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{partnerName}とのチャット</p>
            <p className="truncate text-xs text-gray-400">{task.title}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{application.status === 'PENDING' ? '承認待ち' : application.status === 'ACCEPTED' ? '採用' : application.status === 'REJECTED' ? '不採用' : '辞退済み'}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900">{task.title}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><MapPin className="h-3.5 w-3.5" />{task.location}</p>
          {application.message && <div className="mt-3 rounded-lg bg-gray-50 p-3"><p className="mb-1 text-[11px] font-semibold text-gray-400">応募メッセージ</p><p className="whitespace-pre-line text-sm text-gray-600">{application.message}</p></div>}
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="h-[55vh] space-y-4 overflow-y-auto px-5 py-5">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center"><p className="text-sm text-gray-400">まだメッセージはありません。<br />確認したいことを送ってみましょう。</p></div>
            ) : messages.map((message) => {
              const isMine = message.senderId === user.id;
              return (
                <div key={message.id} className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[11px] text-gray-400">{isMine ? 'あなた' : message.senderName}</span>
                  <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMine ? 'rounded-br-md bg-[#007B63] text-white' : 'rounded-bl-md bg-gray-100 text-gray-800'}`}>{message.content}</div>
                  <span className="text-[10px] text-gray-300">{new Date(message.createdAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {error && <p role="alert" className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}
          <div className="flex gap-2 border-t border-gray-100 p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              maxLength={2000}
              placeholder="メッセージを入力（Shift+Enterで改行）"
              className="min-h-11 flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#007B63] focus:ring-2 focus:ring-emerald-100"
            />
            <button type="button" onClick={handleSend} disabled={!input.trim() || sending} className="self-end rounded-lg bg-[#007B63] p-3 text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label="送信"><Send className="h-5 w-5" /></button>
          </div>
        </section>
      </main>
    </div>
  );
}
