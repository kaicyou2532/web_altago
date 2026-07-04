'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Zap, Shield, Globe, DollarSign, TrendingUp, ArrowRight, Users } from 'lucide-react';

const BRAND = '#007B63';
const BRAND_LIGHT = '#e6f4f1';

/* ────────────────────────────────────────────
   発表台本
──────────────────────────────────────────── */
const scripts = [
  /* 1: 表紙 */
  `本日はお時間をいただきありがとうございます。

私たちが提案するのは「altago（アルタゴ）」です。
一言で言うと、「現地の人の身体を借りる」グローバル物理タスク代行プラットフォームです。

海外にいる人にしかできないことを、リモートから依頼できる仕組みを作りました。
これから9枚のスライドで概要をご説明します。`,

  /* 2: 課題 */
  `まず、私たちが解決しようとしている課題を3つのシナリオでご紹介します。

1つ目。ニューヨークで開催される限定ポップアップ。オンライン販売はなく、その場に並ばないと買えない。でも自分は日本にいる。

2つ目。留学中の親友の誕生日に、現地の有名パン屋のケーキをサプライズで手渡ししたい。でも誰かに頼む手段がない。

3つ目。移住予定のアパートを、写真だけでは分からない深夜の騒音や街の雰囲気を確かめてから契約したい。

これら3つに共通するのは何でしょうか。そう、「現地に行けないから解決できない」という一点です。
この課題、実は世界中で毎日起きています。`,

  /* 3: ソリューション */
  `altagoのソリューションはシンプルです。

「現地に行けない人（Client）」と「現地にいる人（Runner）」をリアルタイムでマッチングします。

ClientはスマホからタスクをポストするだけでOK。
Runnerは自分のスケジュールに合わせて応募し、現地で実行して報酬を得ます。

ポイントは、これがデジタル作業ではなく、物理的なタスクに特化したマーケットプレイスである点です。
フリーランサーマーケットとは全く異なるカテゴリーです。`,

  /* 4: フロー */
  `サービスの流れをご説明します。

ステップ1、Clientがタスクの内容・場所・報酬をアプリから投稿します。
ステップ2、その地域に住むRunnerがタスクを確認して応募します。
ステップ3、Clientが応募者を選びチャットでやり取りを開始。
ステップ4、Runnerが現地でタスクを実行し、動画・写真・書類などで証拠を提出。
ステップ5、Clientが内容を確認したら報酬がリリースされます。

重要なのは、報酬はエスクロー方式で保護されるため、実行が確認されるまでRunnerには支払われません。Client・Runner双方が安心して使える設計です。`,

  /* 5: 特徴 */
  `altagoの4つの特徴をご説明します。

1つ目、「物理タスクに特化」。デジタルでは絶対に解決できない現地の身体的タスクのみを対象にしています。ニッチに見えますが、だからこそ競合が少なく、強いニーズがあります。

2つ目、「証拠付き完了」。動画・写真の提出を完了条件に組み込むことで、報告品質を構造的に担保します。

3つ目、「越境×個人間」。海外在住者が副収入を得られる新しい働き方です。既存のBtoC代行業とは根本的に異なるP2Pモデルです。

4つ目、「多言語・多都市」。まずパリ・L.A.・ソウル・ベルリンなど、日本人コミュニティが活発な都市から展開します。`,

  /* 6: 競合比較 */
  `既存サービスとの比較です。

Taskrabbitは物理タスクに強いですが、基本的に国内利用でありP2Pとは言えません。証拠提出の仕組みもありません。
FiverrやUpworkはグローバルなP2Pですが、あくまでデジタル作業向けです。
代行業者（BtoC）は物理タスクに対応しますが、個人間ではなく価格が高止まりします。

「物理タスク」「越境対応」「P2P」「証拠提出」、この4軸すべてを満たすのはaltagoだけです。
この空白地帯を私たちが埋めます。`,

  /* 7: 獲得戦略 */
  `初期ユーザーをどう獲得するかについてです。

1つ目の入口は、eBay・メルカリ越境コミュニティです。高額品の個人輸入を行うユーザーはすでに強い潜在需要を持っています。SNSや掲示板で直接リーチします。

2つ目は、各国の海外在住日本人Facebookグループです。「パリ在住日本人」「ソウル在住日本人」といったグループは数千〜数万人規模で、Runner供給をほぼゼロコストで獲得できます。

3つ目は、口コミです。忘れ物の緊急回収や移住調査など、感謝度が高く緊急性のあるユースケースに集中し、初期NPSを最大化します。広告費をかけずに口コミで広がる設計です。`,

  /* 8: 収益化 */
  `収益モデルは3段階で構成されます。

フェーズ1は取引手数料です。ClientとRunnerから合計15%を課金します。スケールするほど自動的に収益が増える基盤収益です。

フェーズ2はプレミアムRunner登録です。月額9.9ドルで優先表示や手数料割引を提供します。高稼働のRunnerへのアップセルです。

フェーズ3は法人API連携です。越境ECや不動産仲介企業向けに現地調査APIを提供します。B2Bの安定収益源です。

試算をご覧ください。平均報酬40ドル・手数料15%として、月500件のタスクで3,000ドル、月2,000件で12,000ドルの収益になります。`,

  /* 9: まとめ */
  `最後に4点をまとめます。

1、「現地に行けない」という普遍的な課題を解決する物理タスクマーケットプレイスです。
2、証拠提出フローとエスクロー決済で品質と安全を構造的に担保しています。
3、海外在住日本人コミュニティを起点に、低コストで初期獲得が可能です。
4、取引手数料を核に、プレミアム登録・法人APIで収益を多層化します。

altagoは、デジタル化が進む世界でも「身体が必要なこと」は残り続けるという信念のもとに作ったサービスです。

ご清聴ありがとうございました。ご質問があればお気軽にどうぞ。`,
];

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
];

/* ────────────────────────────────────────────
   メインコンポーネント
──────────────────────────────────────────── */
export default function SlidesPage() {
  const [current, setCurrent] = useState(0);
  const [showScript, setShowScript] = useState(false);
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

      <div className="flex items-center gap-4 mt-3">
        <p className="text-gray-500 text-xs">
          {current + 1} / {total}　　← → キーでも操作できます
        </p>
        <button
          onClick={() => setShowScript((v) => !v)}
          className="text-xs px-3 py-1 rounded-full border transition-colors"
          style={showScript
            ? { borderColor: BRAND, color: BRAND, backgroundColor: '#e6f4f1' }
            : { borderColor: '#374151', color: '#9ca3af', backgroundColor: 'transparent' }
          }
        >
          {showScript ? '台本を隠す' : '台本を表示'}
        </button>
      </div>

      {/* Script panel */}
      {showScript && (
        <div className="w-full max-w-4xl mt-4 rounded-xl bg-gray-900 border border-gray-800 p-6">
          <p className="text-xs font-semibold tracking-[0.2em] mb-3" style={{ color: BRAND }}>
            SCRIPT — スライド {current + 1}
          </p>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {scripts[current]}
          </p>
        </div>
      )}
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
