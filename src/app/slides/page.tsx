'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Zap, Shield, Globe, DollarSign, TrendingUp, ArrowRight, Users } from 'lucide-react';

const BRAND = '#007B63';
const BRAND_LIGHT = '#e6f4f1';

/* ────────────────────────────────────────────
   スライドデータ
──────────────────────────────────────────── */
const slides = [
  { id: 'cover', component: SlideCover },
  { id: 'problem', component: SlideProblem },
  { id: 'solution', component: SlideSolution },
  { id: 'flow', component: SlideFlow },
  { id: 'features', component: SlideFeatures },
  { id: 'comparison', component: SlideComparison },
  { id: 'acquisition', component: SlideAcquisition },
  { id: 'revenue', component: SlideRevenue },
  { id: 'summary', component: SlideSummary },
  { id: 'traubling', component: SlideTraubling },
];

/* ────────────────────────────────────────────
   メインコンポーネント
──────────────────────────────────────────── */
export default function SlidesPage() {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const SlideComponent = slides[current].component;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8 select-none">
      {/* Slide frame */}
      <div className="w-full max-w-4xl aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        <SlideComponent />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={prev}
          disabled={current === 0}
          className="p-2.5 rounded-full bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ backgroundColor: i === current ? BRAND : '#4b5563' }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === total - 1}
          className="p-2.5 rounded-full bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-gray-500 text-xs mt-3">
        {current + 1} / {total}　　← → キーでも操作できます
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────
   スライド 1: 表紙
──────────────────────────────────────────── */
function SlideCover() {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Top accent */}
      <div className="h-1.5 w-full" style={{ backgroundColor: BRAND }} />
      <div className="flex-1 flex flex-col items-center justify-center px-16 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] mb-6" style={{ color: BRAND }}>
          SERVICE PROPOSAL — 2026
        </p>
        <h1 className="text-7xl font-black text-white tracking-tight mb-5">altago</h1>
        <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
          「現地の人の身体を借りる」<br />
          グローバル物理タスク代行プラットフォーム
        </p>
      </div>
      <div className="px-16 py-6 flex justify-between text-xs text-gray-600">
        <span>Confidential</span>
        <span>2026年5月</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   スライド 2: 課題
──────────────────────────────────────────── */
function SlideProblem() {
  const pains = [
    { emoji: '📦', text: 'NYで開催の限定ポップアップに並んでほしい。オンライン販売なし、現地に行列するしかない限定アイテムを代わりに買い付けて日本へ発送してほしい' },
    { emoji: '✈️', text: '留学中の親友の誕生日に、現地の有名パン屋の特製ケーキをサプライズで手渡ししてほしい。その様子をビデオ通話で中継してほしい' },
    { emoji: '🏠', text: '移住予定のアパートの「深夜の騒音・暗さ」を、現地映像で確認してから契約したい' },
  ];
  return (
    <SlideLayout title="解決する課題" accent>
      <div className="space-y-4 mt-2">
        {pains.map((p) => (
          <div key={p.text} className="flex items-start gap-4 bg-gray-50 rounded-xl px-5 py-4">
            <span className="text-2xl mt-0.5">{p.emoji}</span>
            <p className="text-sm text-gray-700 leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-5 text-center">
        ▶ 共通の本質：<strong className="text-gray-600">「現地に行けない」から解決できない問題</strong>
      </p>
    </SlideLayout>
  );
}

/* ────────────────────────────────────────────
   スライド 3: ソリューション
──────────────────────────────────────────── */
function SlideSolution() {
  return (
    <SlideLayout title="altagoのソリューション">
      <div className="flex items-center gap-8 mt-4">
        <div className="flex-1 border-2 rounded-2xl p-6 text-center" style={{ borderColor: BRAND, backgroundColor: BRAND_LIGHT }}>
          <p className="text-3xl mb-3">🙋‍♀️</p>
          <p className="font-black text-lg text-gray-900 mb-1">Client</p>
          <p className="text-xs text-gray-600">「現地に行けない」人がタスクを投稿</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: BRAND }}>
            ⚡
          </div>
          <p className="text-xs font-bold text-gray-400 text-center">リアルタイム<br />マッチング</p>
        </div>

        <div className="flex-1 border-2 border-gray-200 rounded-2xl p-6 text-center bg-gray-50">
          <p className="text-3xl mb-3">🏃‍♂️</p>
          <p className="font-black text-lg text-gray-900 mb-1">Runner</p>
          <p className="text-xs text-gray-600">「現地にいる」人が身体を使って実行</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl p-4 text-center" style={{ backgroundColor: BRAND_LIGHT }}>
        <p className="text-sm font-semibold" style={{ color: BRAND }}>
          デジタルでは解決できない、物理的タスクに特化したマーケットプレイス
        </p>
      </div>
    </SlideLayout>
  );
}

/* ────────────────────────────────────────────
   スライド 4: フロー
──────────────────────────────────────────── */
function SlideFlow() {
  const steps = [
    { n: '1', label: 'タスク投稿', sub: 'Client が内容・場所・報酬を入力' },
    { n: '2', label: 'Runner応募', sub: '現地在住者がタスクを確認・応募' },
    { n: '3', label: 'マッチング', sub: 'Client が承認、チャット開始' },
    { n: '4', label: '現地実行', sub: '動画・写真・書類で証拠提出' },
    { n: '5', label: '完了・支払', sub: '確認後に報酬をリリース' },
  ];
  return (
    <SlideLayout title="サービスフロー">
      <div className="flex items-start justify-between mt-6 gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-start gap-2 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm mb-2" style={{ backgroundColor: BRAND }}>
                {s.n}
              </div>
              <p className="text-xs font-bold text-gray-900 text-center mb-1">{s.label}</p>
              <p className="text-[10px] text-gray-500 text-center leading-relaxed">{s.sub}</p>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-300 mt-3 shrink-0" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl p-4 text-center bg-gray-50">
        <p className="text-xs text-gray-600">
          エスクロー決済により、<strong>実行完了まで報酬は保護</strong>。Client・Runner 双方が安心して取引できる。
        </p>
      </div>
    </SlideLayout>
  );
}

/* ────────────────────────────────────────────
   スライド 5: 特徴
──────────────────────────────────────────── */
function SlideFeatures() {
  const features = [
    { icon: <Zap className="w-5 h-5" />, title: '物理タスクに特化', body: 'デジタルでは解決不可な現地の身体的タスクのみを対象。ニッチだが強い需要。' },
    { icon: <Shield className="w-5 h-5" />, title: '証拠付き完了', body: '動画・写真・書類スキャンの提出を完了条件に。報告品質を構造的に担保。' },
    { icon: <Globe className="w-5 h-5" />, title: '越境×個人間', body: '現地在住者が副収入を得られる新しい働き方。BtoC代行業とは異なるP2Pモデル。' },
    { icon: <Users className="w-5 h-5" />, title: '多言語・多都市', body: 'まずパリ・L.A.・ソウル・ベルリンなど日本人コミュニティが多い都市から展開。' },
  ];
  return (
    <SlideLayout title="サービスの特徴">
      <div className="grid grid-cols-2 gap-4 mt-4">
        {features.map((f) => (
          <div key={f.title} className="border border-gray-200 rounded-xl p-4 flex gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}>
              {f.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">{f.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ────────────────────────────────────────────
   スライド 6: 競合比較
──────────────────────────────────────────── */
function SlideComparison() {
  const rows = [
    { name: 'altago（本サービス）', physical: '◎', cross: '◎', p2p: '◎', proof: '◎', highlight: true },
    { name: 'Taskrabbit', physical: '◎', cross: '△', p2p: '○', proof: '×' },
    { name: 'Fiverr / Upwork', physical: '×', cross: '◎', p2p: '◎', proof: '×' },
    { name: '代行業者（BtoC）', physical: '◎', cross: '△', p2p: '×', proof: '△' },
  ];
  return (
    <SlideLayout title="競合比較">
      <table className="w-full text-xs mt-4 border-collapse">
        <thead>
          <tr className="text-white text-center" style={{ backgroundColor: '#111' }}>
            <th className="text-left px-4 py-2.5 font-semibold rounded-tl-lg">サービス</th>
            <th className="px-4 py-2.5 font-semibold">物理タスク</th>
            <th className="px-4 py-2.5 font-semibold">越境対応</th>
            <th className="px-4 py-2.5 font-semibold">P2P</th>
            <th className="px-4 py-2.5 font-semibold rounded-tr-lg">証拠提出</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className="border-b border-gray-100 text-center"
              style={r.highlight ? { backgroundColor: BRAND_LIGHT, fontWeight: 700, color: BRAND } : {}}
            >
              <td className="text-left px-4 py-3">{r.name}</td>
              <td className="px-4 py-3">{r.physical}</td>
              <td className="px-4 py-3">{r.cross}</td>
              <td className="px-4 py-3">{r.p2p}</td>
              <td className="px-4 py-3">{r.proof}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-gray-400 mt-4 text-center">
        ▶ 物理×越境×P2P×証拠の4軸すべてを満たすのは altago のみ
      </p>
    </SlideLayout>
  );
}

/* ────────────────────────────────────────────
   スライド 7: ユーザー獲得
──────────────────────────────────────────── */
function SlideAcquisition() {
  const items = [
    { icon: '🛒', title: 'eBay・メルカリ越境コミュニティ', body: 'SNS・掲示板で高額品の個人輸入を行う層に直接訴求。潜在ニーズが大きい。' },
    { icon: '🌏', title: '海外在住日本人グループ', body: 'Facebook「〇〇在住日本人」グループは各都市数千〜数万人規模。Runner供給をゼロコスト獲得。' },
    { icon: '📣', title: '「忘れ物」「移住調査」の強い口コミ', body: '緊急性が高く解決時の感謝が大きい。初期はここに集中しNPSを最大化。' },
  ];
  return (
    <SlideLayout title="ユーザー獲得戦略">
      <div className="space-y-4 mt-3">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4 items-start bg-gray-50 rounded-xl px-5 py-3.5">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ────────────────────────────────────────────
   スライド 8: 収益化
──────────────────────────────────────────── */
function SlideRevenue() {
  return (
    <SlideLayout title="収益化モデル">
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          { phase: 'フェーズ1', icon: <DollarSign className="w-4 h-4" />, title: '取引手数料', detail: 'Client 10% + Runner 5%', sub: '全取引に自動課金。スケールするほど収益増。' },
          { phase: 'フェーズ2', icon: <TrendingUp className="w-4 h-4" />, title: 'プレミアムRunner', detail: '月額 $9.9', sub: '優先表示・手数料割引。高稼働Runnerへのアップセル。' },
          { phase: 'フェーズ3', icon: <Globe className="w-4 h-4" />, title: '法人API連携', detail: '月額固定 + 従量', sub: '越境EC・不動産仲介向けの現地調査API提供。' },
        ].map((r) => (
          <div key={r.title} className="border border-gray-200 rounded-xl p-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}>
              {r.phase}
            </span>
            <div className="flex items-center gap-1.5 mt-3 mb-1" style={{ color: BRAND }}>
              {r.icon}
              <p className="text-sm font-bold text-gray-900">{r.title}</p>
            </div>
            <p className="text-xs font-mono text-gray-500 mb-2">{r.detail}</p>
            <p className="text-xs text-gray-600 leading-relaxed">{r.sub}</p>
          </div>
        ))}
      </div>

      {/* 試算 */}
      <div className="mt-4 rounded-xl p-3 bg-gray-50">
        <p className="text-[11px] font-semibold text-gray-500 mb-2">収益試算（手数料15%、平均報酬$40）</p>
        <div className="flex gap-6 text-xs">
          {[
            { tasks: '月100件', rev: '$600/月' },
            { tasks: '月500件', rev: '$3,000/月' },
            { tasks: '月2,000件', rev: '$12,000/月' },
          ].map((r) => (
            <div key={r.tasks} className="flex items-center gap-2">
              <span className="text-gray-500">{r.tasks}</span>
              <ArrowRight className="w-3 h-3 text-gray-300" />
              <span className="font-bold" style={{ color: BRAND }}>{r.rev}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}

/* ────────────────────────────────────────────
   スライド 9: まとめ
──────────────────────────────────────────── */
function SlideSummary() {
  const points = [
    '「現地に行けない」という普遍的な課題を解決する物理タスクマーケットプレイス',
    '証拠提出フロー・エスクロー決済で品質と安全を担保',
    '海外在住日本人コミュニティへの訴求で低コスト初期獲得が可能',
    '取引手数料を核に、プレミアム登録・法人APIで収益を多層化',
  ];
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="h-1.5 w-full" style={{ backgroundColor: BRAND }} />
      <div className="flex-1 flex flex-col justify-center px-16">
        <p className="text-xs font-semibold tracking-[0.3em] mb-4" style={{ color: BRAND }}>SUMMARY</p>
        <h2 className="text-3xl font-black text-white mb-8">altagoで実現すること</h2>
        <div className="space-y-4">
          {points.map((p, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5" style={{ backgroundColor: BRAND }}>
                {i + 1}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-16 py-6 flex justify-between text-xs text-gray-600">
        <span>altago</span>
        <span>Confidential — 2026年5月</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   スライド 10: Traubling
──────────────────────────────────────────── */
function SlideTraubling() {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="h-1.5 w-full" style={{ backgroundColor: BRAND }} />
      <div className="flex-1 flex flex-col items-center justify-center px-16 text-center gap-8">
        <p className="text-xs font-semibold tracking-[0.3em]" style={{ color: BRAND }}>
          POWERED BY PARTNER
        </p>
        <div>
          <p className="text-3xl font-black text-white mb-3 leading-snug">
            現地で、あなたが困ったら
          </p>
          <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
            旅先でのトラブル・緊急事態には、現地サポートの専門サービスも活用できます。
            altago の Runner ネットワークと連携し、あなたを全力でサポートします。
          </p>
        </div>
        <a
          href="https://traubling.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 text-white font-bold text-lg transition-all hover:scale-105"
          style={{ borderColor: BRAND, backgroundColor: 'rgba(0,123,99,0.15)' }}
        >
          <span>traubling.com</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="px-16 py-6 flex justify-between text-xs text-gray-600">
        <span>altago</span>
        <span>Confidential — 2026年5月</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   共通レイアウト
──────────────────────────────────────────── */
function SlideLayout({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="w-full h-full flex flex-col bg-white px-12 py-8">
      {/* Title bar */}
      <div className="flex items-center gap-3 mb-2 shrink-0">
        <div className="w-1 h-7 rounded-full shrink-0" style={{ backgroundColor: accent ? BRAND : '#e5e7eb' }} />
        <h2 className="text-xl font-black text-gray-950">{title}</h2>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
