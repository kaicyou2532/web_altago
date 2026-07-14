'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, FileText, Gift, MapPin, Star, Zap, CheckCircle2 } from 'lucide-react';
import { getTasks } from '@/lib/api/tasks';
import { Task } from '@/types';
import { formatReward } from '@/lib/currency';

const taskExamples = [
  { title: 'パリの蚤の市でヴィンテージ時計を確認', location: 'Paris, France', reward: '$60', tag: '現物確認' },
  { title: 'ホテルの忘れ物を回収してDHL発送', location: 'Los Angeles, USA', reward: '$45', tag: '回収・発送' },
  { title: '留学先周辺の夜道を動画レポート', location: 'Seoul, Korea', reward: '₩48,000', tag: '現地調査' },
];

/* スクロールアニメーション用フック */
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const observe = useCallback(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    ref.current.querySelectorAll('.animate-on-scroll, .animate-on-scroll-fade, .animate-on-scroll-scale').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  useEffect(() => { const cleanup = observe(); return cleanup; }, [observe]);
  return ref;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  OPEN:        { label: '募集中',     color: 'bg-[#007B63]/10 text-[#007B63]' },
  ASSIGNED:    { label: 'マッチング済', color: 'bg-black/5 text-black' },
  IN_PROGRESS: { label: '進行中',     color: 'bg-black/5 text-black' },
  COMPLETED:   { label: '完了',       color: 'bg-black/5 text-black/40' },
};

const useCases = [
  {
    icon: ShoppingBag,
    title: '購入前の現物検証',
    description:
      'eBay・メルカリ海外版で数十万円の取引を検討中。出品者と待ち合わせ、コンディションをリアルタイム動画で送信。カメラ、ピアノ、ヴィンテージ楽器など「個人買い入れ前の調査」に。',
    example: '例：パリ11区でライカM4のカビ・シャッター動作を動画検証（$60）',
  },
  {
    icon: FileText,
    title: '忘れ物回収・現地発送',
    description:
      'チェックアウト後に忘れたカメラ・パスポート・充電器など。ホテル・現地駐在機関に居寄して自分で回収、DHL/FedExに持ち込み発送。委任状準備さえあれば数日で手届く。',
    example: '例：L.A.のホテルからソニーミラーレスを回収・DHL発送（$45）',
  },
  {
    icon: Gift,
    title: '移住・留学前の居住環境調査',
    description:
      '不動産の写真ではわからない「深夜の騒音」「裏通りの暗さ」「近隣の雰囲気」をノーカット動画で提出。数十万円の契約を結ぶ前に、現地のリアルを確かめる。',
    example: '例：ソウル新村のアパート、深夜23時周辺環境を動画レポート（$35）',
  },
];

const features = [
  { icon: MapPin, title: '世界中どこでも', description: '世界各地のランナーがタスクに応答します。' },
  { icon: Zap, title: '迅速なマッチング', description: '依頼から数時間以内に着手が可能です。' },
  { icon: Star, title: '安心の評価制度', description: '実績・評価で信頼できるランナーを選択。' },
];

export default function HomePage() {
  const [liveTasks, setLiveTasks] = useState<Task[]>([]);
  const pageRef = useScrollAnimation();

  useEffect(() => {
    getTasks({ status: 'OPEN' })
      .then((tasks) => setLiveTasks(tasks.slice(0, 6)))
      .catch(() => setLiveTasks([]));
  }, []);


  const steps = [
    { num: '01', title: 'タスクを作成', desc: '場所・内容・報酬を設定するだけ。数分で完了します。' },
    { num: '02', title: 'ランナーとマッチング', desc: '現地にいるランナーが応募し、最適な人を選べます。' },
    { num: '03', title: 'タスク完了・受け取り', desc: '完了報告と写真で確認。安心して報酬を支払えます。' },
  ];

  return (
    <div className="flex flex-col bg-white" ref={pageRef}>

      {/* ── Hero ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <p className="animate-on-scroll text-xs font-semibold uppercase tracking-[0.2em] text-[#007B63] mb-6">
                Global Physical Gig Work
              </p>
              <h1 className="animate-on-scroll delay-100 text-5xl sm:text-6xl lg:text-[5rem] font-black tracking-tight text-black leading-[1.0] mb-8">
                世界中に、<br />あなたの<br />身体を。
              </h1>
              <p className="animate-on-scroll delay-200 text-base text-black/50 leading-relaxed mb-10 max-w-sm">
                遠くに行けなくても大丈夫。Altago なら、世界中の現地ワーカー（Runner）があなたの代わりに動きます。
              </p>
              <div className="animate-on-scroll delay-300 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#007B63] text-white font-semibold px-8 py-4 text-sm hover:bg-[#006655] transition-colors"
                >
                  タスクを依頼する <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tasks"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white text-black font-semibold px-8 py-4 text-sm hover:bg-black/5 transition-colors"
                >
                  ランナーとして稼ぐ
                </Link>
              </div>
              <div className="animate-on-scroll delay-400 mt-10 flex flex-wrap gap-6">
                {[].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-xs text-black/40 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#007B63]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="animate-on-scroll-scale delay-200 relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-8 rounded-full bg-[#007B63]/5 blur-3xl" />
              <div className="relative space-y-3 rounded-3xl border border-black/5 bg-[#f8faf9] p-4 shadow-xl shadow-black/5 sm:p-6">
                <div className="flex items-center justify-between px-1 pb-2"><p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Previous tasks</p><span className="h-2 w-2 rounded-full bg-[#00a882]" /></div>
                {taskExamples.map((task, index) => (
                  <div key={task.title} className={`rounded-2xl border border-black/5 bg-white p-5 shadow-sm ${index === 1 ? 'sm:translate-x-5' : ''}`}>
                    <div className="mb-3 flex items-center justify-between gap-3"><span className="rounded-full bg-[#e6f4f1] px-2.5 py-1 text-[11px] font-semibold text-[#007B63]">{task.tag}</span><strong>{task.reward}</strong></div>
                    <p className="text-sm font-bold text-black">{task.title}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-black/40"><MapPin className="h-3 w-3 text-[#007B63]" />{task.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="border-t border-b border-black/5 bg-[#F6F6F6]">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/5">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div key={title} className={`flex items-start gap-4 px-6 py-5 sm:py-0 animate-on-scroll delay-${(i + 1) * 100}`}>
                <Icon className="h-5 w-5 mt-0.5 shrink-0 text-[#007B63]" />
                <div>
                  <p className="font-semibold text-sm text-black">{title}</p>
                  <p className="text-black/40 text-xs mt-0.5 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-16 animate-on-scroll">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007B63] mb-4">Use Cases</p>
            <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight">こんなことができます</h2>
            <p className="mt-4 text-black/40 text-sm">物理的な距離の壁を、人の力で越えます。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5">
            {useCases.map(({ icon: Icon, title, description, example }, i) => (
              <div key={title} className={`bg-white p-8 hover:bg-[#F6F6F6] transition-colors animate-on-scroll delay-${(i + 1) * 100}`}>
                <Icon className="h-7 w-7 text-[#007B63] mb-6" />
                <h3 className="font-bold text-black text-lg mb-3">{title}</h3>
                <p className="text-sm text-black/50 leading-relaxed mb-5">{description}</p>
                <p className="text-xs text-[#007B63] font-medium">{example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#F6F6F6] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-16 animate-on-scroll">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007B63] mb-4">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight">使い方はシンプル</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} className={`animate-on-scroll delay-${(i + 1) * 100}`}>
                <div className="text-5xl font-black text-[#007B63] mb-6 leading-none">{num}</div>
                <h3 className="font-bold text-black text-lg mb-2">{title}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Tasks ── */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 animate-on-scroll">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007B63] mb-3">Live Tasks</p>
              <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight">今日のタスク</h2>
            </div>
            <Link href="/tasks" className="text-sm font-semibold inline-flex items-center gap-1 text-[#007B63] hover:underline">
              すべて見る <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveTasks.map((task, i) => {
              const status = statusLabel[task.status];
              return (
                <div key={task.id} className={`border border-black/5 rounded-xl p-6 hover:border-black/20 hover:shadow-sm transition-all animate-on-scroll delay-${(i % 5 + 1) * 100}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                    <span className="text-xl font-black text-[#007B63]">{formatReward(task.reward, task.currency)}</span>
                  </div>
                  <h3 className="font-semibold text-black line-clamp-2 mb-3 text-sm leading-snug">{task.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-black/40">
                    <MapPin className="h-3 w-3 flex-shrink-0 text-[#007B63]" />
                    <span>{task.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-black py-28 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007B63] mb-8 animate-on-scroll">Get Started</p>
          <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-[1.05] tracking-tight animate-on-scroll delay-100">
            世界はもっと、<br />身近になれる。
          </h2>
          <p className="text-white/40 mb-12 text-base leading-relaxed animate-on-scroll delay-200">
            依頼者としてタスクを出すも良し、ランナーとして世界中の人を助けながら稼ぐも良し。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll delay-300">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#007B63] text-white font-semibold px-10 py-4 hover:bg-[#006655] transition-colors"
            >
              タスクを依頼する <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 text-white/60 font-semibold px-10 py-4 hover:border-white/30 hover:text-white transition-colors"
            >
              タスク一覧を見る
            </Link>
          </div>
        </div>
      </section>

      {/* ── Traubling Partnership ── */}
      <section className="bg-white py-24 border-t border-black/5">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007B63] mb-6 animate-on-scroll">Partner</p>
          <h2 className="text-4xl sm:text-5xl font-black text-black mb-5 tracking-tight animate-on-scroll delay-100">
            現地で、あなたが困ったら
          </h2>
          <p className="text-black/40 text-sm leading-relaxed mb-10 max-w-lg mx-auto animate-on-scroll delay-200">
            旅先でのトラブル・緊急事態には、先人たちの知恵を利用しよう。
            altago の Runner ネットワークと連携し、あなたを全力でサポートします。
          </p>
          <a
            href="https://traubling.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#007B63] text-[#007B63] font-semibold px-8 py-3.5 text-sm hover:bg-[#007B63] hover:text-white transition-colors animate-on-scroll delay-300"
          >
            traubling.com
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

    </div>
  );
}
