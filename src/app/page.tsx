import Link from 'next/link';
import { ArrowRight, ShoppingBag, FileText, Gift, MapPin, Star, Zap, CheckCircle2 } from 'lucide-react';
import { mockTasks } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusLabel: Record<string, { label: string; color: string }> = {
  OPEN: { label: '募集中', color: 'bg-green-100 text-green-700' },
  ASSIGNED: { label: 'マッチング済', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: '進行中', color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: '完了', color: 'bg-gray-100 text-gray-600' },
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
  const demoTasks = mockTasks.slice(0, 3);


  const steps = [
    { num: '01', title: 'タスクを作成', desc: '場所・内容・報酬を設定するだけ。数分で完了します。' },
    { num: '02', title: 'ランナーとマッチング', desc: '現地にいるランナーが応募し、最適な人を選べます。' },
    { num: '03', title: 'タスク完了・受け取り', desc: '完了報告と写真で確認。安心して報酬を支払えます。' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-white overflow-hidden">
        <div className="h-px w-full" style={{ background: '#007B63' }} />
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-24 sm:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05] mb-7">
                世界中に、
                <br />
                あなたの身体を。
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
                海外に行けなくても大丈夫。Altago なら、世界中の現地ワーカー（Runner）が
                あなたの代わりに買い物・手続き・届け物を引き受けます。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold px-8 py-4 text-sm transition-colors" style={{ background: '#007B63' }}
                >
                  タスクを依頼する <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tasks"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold px-8 py-4 text-sm transition-colors hover:border-[#007B63] hover:text-[#007B63]"
                >
                  ランナーとして稼ぐ
                </Link>
              </div>
              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap gap-5">
                {['安全な決済保護', 'チャットで進捗確認', '世界50カ国以上対応'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#007B63' }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {/* Right: Visual card */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl" style={{ background: '#e6f4f1' }} />
              <div className="relative w-full max-w-sm p-8 space-y-4">
                {demoTasks.slice(0, 3).map((task, i) => {
                  const status = statusLabel[task.status];
                  return (
                    <div
                      key={task.id}
                      style={{ transform: `translateX(${i * 8}px)`, zIndex: 3 - i }}
                      className="relative bg-white rounded-2xl shadow-md p-4 border border-gray-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{task.title}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {task.location}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-base font-bold" style={{ color: '#007B63' }}>${task.reward}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4 px-6 py-4 sm:py-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: '#e6f4f1' }}>
                  <Icon className="h-4 w-4" style={{ color: '#007B63' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">USE CASES</p>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">こんなことができます</h2>
            <p className="mt-3 text-gray-400">物理的な距離の壁を、人の力で越えます。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map(({ icon: Icon, title, description, example }) => (
              <Card key={title} className="border border-gray-100 shadow-none hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white rounded-2xl">
                <CardHeader className="pb-2 pt-7 px-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-5" style={{ background: '#e6f4f1' }}>
                    <Icon className="h-6 w-6" style={{ color: '#007B63' }} />
                  </div>
                  <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-7 pb-7">
                  <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#e6f4f1' }}>
                    <span className="text-xs">💡</span>
                    <p className="text-xs font-medium" style={{ color: '#005e4a' }}>{example}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">使い方はとてもシンプル</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] border-t-2 border-dashed" style={{ borderColor: '#b3d9d3' }} />
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center text-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full text-white text-xl font-extrabold shadow-md" style={{ background: '#007B63', boxShadow: '0 4px 14px rgba(0,123,99,0.25)' }}>
                  {num}
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Tasks */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">LIVE TASKS</span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mt-2">今日のタスク</h2>
            </div>
            <Link href="/tasks" className="text-sm font-medium inline-flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: '#007B63' }}>
              すべて見る <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {demoTasks.map((task) => {
              const status = statusLabel[task.status];
              return (
                <Card key={task.id} className="border border-gray-100 bg-white rounded-2xl shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-xl font-extrabold" style={{ color: '#007B63' }}>${task.reward}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 text-sm leading-snug">{task.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: '#007B63' }} />
                      <span>{task.location}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-950 py-24 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-6" style={{ color: '#007B63' }}>GET STARTED</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            世界はもっと、<br className="sm:hidden" />身近になれる。
          </h2>
          <p className="text-gray-500 mb-12 text-base leading-relaxed">
            依頼者としてタスクを出すも良し、<br />
            ランナーとして世界中の人を助けながら稼ぐも良し。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold px-9 py-4 transition-colors" style={{ background: '#007B63' }}
            >
              タスクを依頼する <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 text-gray-400 font-semibold px-9 py-4 hover:border-white/30 hover:text-white transition-colors"
            >
              タスク一覧を見る
            </Link>
          </div>
        </div>
      </section>

      {/* Traubling Partnership */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-gray-400">PARTNER</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mb-4 leading-tight">
            現地で、あなたが困ったら
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
            旅先でのトラブル・緊急事態には、現地サポートの専門サービスも併用できます。<br />
            altago の Runner ネットワークと連携し、あなたを全力でサポートします。
          </p>
          <a
            href="https://traubling.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border font-semibold px-8 py-3.5 text-sm transition-colors hover:bg-gray-50"
            style={{ borderColor: '#007B63', color: '#007B63' }}
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
