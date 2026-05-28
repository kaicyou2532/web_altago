'use client';

import { MapPin, Zap, Users, TrendingUp, DollarSign, Shield, Globe, ArrowRight } from 'lucide-react';

export default function KikakusyoPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Print button */}
      <div className="no-print fixed top-20 right-6 z-50">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md"
          style={{ backgroundColor: '#007B63' }}
        >
          印刷 / PDF保存
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-10 py-14 space-y-14">

        {/* ===== PAGE 1 ===== */}
        {/* Cover */}
        <section className="border-b-2 border-gray-900 pb-10">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
            企画書　2026年5月28日
          </p>
          <h1 className="text-4xl font-black tracking-tight leading-tight mb-3">
            altago
          </h1>
          <p className="text-xl font-semibold text-gray-600 mb-6">
            「現地の人の身体を借りる」グローバル物理タスク代行プラットフォーム
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span>提案者：中村 希一</span>
            <span>対象：宮治さん相談用</span>
          </div>
        </section>

        {/* 1. サービス概要 */}
        <section>
          <SectionTitle number="1" title="サービス概要" />
          <div className="space-y-5 text-sm leading-relaxed text-gray-700">
            <p>
              <strong className="text-gray-900">altago</strong> は、「現地に行けない人」と「現地にいる人」をリアルタイムでマッチングする、
              物理タスク特化型の依頼プラットフォームです。
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Card icon={<MapPin className="w-4 h-4" />} title="依頼できること（例）">
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>購入前の現物コンディション動画検証</li>
                  <li>忘れ物の回収・現地発送手配</li>
                  <li>移住・留学前の居住環境調査</li>
                  <li>現地業者からの見積もり取得</li>
                  <li>代理購入・マーケット調達</li>
                </ul>
              </Card>
              <Card icon={<Users className="w-4 h-4" />} title="ユーザー構成">
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Client</strong>：依頼を出す側（海外取引者・移住検討者など）</li>
                  <li><strong>Runner</strong>：現地で動く側（在住日本人・現地フリーランサーなど）</li>
                </ul>
              </Card>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
              <p className="font-semibold text-gray-900 mb-2">基本フロー</p>
              <div className="flex items-center gap-2 flex-wrap">
                {['タスク投稿（Client）', 'Runner応募', 'マッチング成立', '現地で実行・証拠送付', '完了・報酬支払い'].map((step, i, arr) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-white text-[11px]" style={{ backgroundColor: '#007B63' }}>{step}</span>
                    {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-gray-400" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== PAGE 2 ===== */}
        <div className="page-break" />

        {/* 2. サービスの特徴 */}
        <section>
          <SectionTitle number="2" title="サービスの特徴" />

          <SubTitle>2-1　新規性・独創性</SubTitle>
          <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
            <FeatureCard
              icon={<Zap className="w-4 h-4" />}
              title="「物理」に特化"
              body="デジタルで解決できない現地の身体的タスクのみを対象とし、ニッチだが強い需要を捉える。"
            />
            <FeatureCard
              icon={<Shield className="w-4 h-4" />}
              title="証拠付き完了"
              body="動画・写真・書類スキャンの提出を完了条件とし、報告の質を担保。単なる代行業との差別化。"
            />
            <FeatureCard
              icon={<Globe className="w-4 h-4" />}
              title="越境×個人間"
              body="BtoC代行業ではなく個人間マッチング。現地在住者が副収入を得られる新しい働き方を提供。"
            />
          </div>

          <SubTitle>2-2　他サービスとの比較</SubTitle>
          <div className="overflow-x-auto mb-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-3 py-2 font-semibold">サービス</th>
                  <th className="px-3 py-2 font-semibold">物理タスク</th>
                  <th className="px-3 py-2 font-semibold">越境対応</th>
                  <th className="px-3 py-2 font-semibold">個人間マッチング</th>
                  <th className="px-3 py-2 font-semibold">証拠提出フロー</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'altago（本サービス）', physical: '◎', cross: '◎', p2p: '◎', proof: '◎', highlight: true },
                  { name: 'Taskrabbit', physical: '◎', cross: '△（US中心）', p2p: '○', proof: '×' },
                  { name: 'Fiverr / Upwork', physical: '×（デジタルのみ）', cross: '◎', p2p: '◎', proof: '×' },
                  { name: '代行業者（BtoC）', physical: '◎', cross: '△', p2p: '×', proof: '△' },
                  { name: 'メルカリ現地購入依頼', physical: '○', cross: '×', p2p: '○', proof: '×' },
                ].map((row) => (
                  <tr
                    key={row.name}
                    className={row.highlight ? 'font-bold border border-gray-300' : 'border-b border-gray-100'}
                    style={row.highlight ? { backgroundColor: '#e6f4f1', color: '#007B63' } : {}}
                  >
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2 text-center">{row.physical}</td>
                    <td className="px-3 py-2 text-center">{row.cross}</td>
                    <td className="px-3 py-2 text-center">{row.p2p}</td>
                    <td className="px-3 py-2 text-center">{row.proof}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== PAGE 3 ===== */}
        <div className="page-break" />

        {/* 3. 多くの利用者を獲得できるポイント */}
        <section>
          <SectionTitle number="3" title="多くの利用者を獲得できるポイント" />
          <div className="space-y-4 text-sm">
            {[
              {
                title: 'eBay・メルカリ越境売買コミュニティへの直接訴求',
                body: '海外高額品（カメラ・楽器・ブランド品）を個人輸入する層はSNS・掲示板に多数存在。購入前検証ニーズは潜在的に大きく、コミュニティ投稿だけで初期ユーザーを獲得できる。',
              },
              {
                title: '海外在住日本人コミュニティへのRunner募集',
                body: 'Facebook「〇〇（都市名）在住日本人」グループは各都市数千〜数万人規模。副収入ニーズに訴求することで、Runner側の供給をゼロコストで確保できる。',
              },
              {
                title: '「忘れ物」「移住調査」は緊急性が高く口コミが起きやすい',
                body: '忘れ物回収は一刻を争う。解決できた体験は強い口コミを生む。初期はこのユースケースに集中してNPS（推奨度）を最大化する。',
              },
              {
                title: 'Runner側のインセンティブ設計',
                body: 'タスク完了率・評価スコアに応じてRunner手数料を段階的に引き下げる仕組みを設ける。良質なRunnerを囲い込み、サービス品質の好循環を作る。',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ backgroundColor: '#007B63' }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5">{item.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 収益化の方法 */}
        <section>
          <SectionTitle number="4" title="収益化の方法" />
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <RevenueCard
                phase="主軸"
                title="取引手数料"
                rate="Client側：10%　Runner側：5%"
                body="タスク報酬に対してプラットフォーム手数料を徴収。AirbnbやTaskrabbitと同様のモデル。"
              />
              <RevenueCard
                phase="中期"
                title="プレミアムRunner登録"
                rate="月額 $9.9"
                body="優先表示・手数料割引・バッジ付与。高稼働Runnerへのアップセル。"
              />
              <RevenueCard
                phase="中長期"
                title="法人向けAPI / 提携"
                rate="月額固定 + 従量"
                body="海外不動産仲介・越境EC事業者向けに現地調査APIとして提供。B2B収益柱。"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
              <p className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                収益シミュレーション（初年度試算）
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="text-left pb-1">月次タスク数</th>
                    <th className="text-right pb-1">平均報酬</th>
                    <th className="text-right pb-1">手数料収入（15%）</th>
                    <th className="text-right pb-1">年間収益</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tasks: '100件', avg: '$40', fee: '$600/月', annual: '$7,200' },
                    { tasks: '500件', avg: '$40', fee: '$3,000/月', annual: '$36,000' },
                    { tasks: '2,000件', avg: '$40', fee: '$12,000/月', annual: '$144,000' },
                  ].map((row) => (
                    <tr key={row.tasks} className="border-b border-gray-100">
                      <td className="py-1.5">{row.tasks}</td>
                      <td className="text-right">{row.avg}</td>
                      <td className="text-right font-medium">{row.fee}</td>
                      <td className="text-right font-bold" style={{ color: '#007B63' }}>{row.annual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-xs text-gray-400 flex justify-between">
          <span>altago 企画書　2026年5月28日</span>
          <span>Confidential</span>
        </div>
      </div>
    </div>
  );
}

/* ── 共通コンポーネント ── */
function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
        style={{ backgroundColor: '#007B63' }}
      >
        {number}
      </span>
      <h2 className="text-lg font-black text-gray-900 tracking-tight">{title}</h2>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold text-gray-700 mb-3 mt-5 border-l-2 pl-2.5" style={{ borderColor: '#007B63' }}>
      {children}
    </p>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <p className="flex items-center gap-1.5 font-semibold text-xs text-gray-700 mb-2" style={{ color: '#007B63' }}>
        {icon}{title}
      </p>
      {children}
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-2" style={{ color: '#007B63' }}>{icon}
        <span className="font-bold text-xs text-gray-900">{title}</span>
      </div>
      <p className="text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}

function RevenueCard({ phase, title, rate, body }: { phase: string; title: string; rate: string; body: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 text-xs">
      <span
        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
        style={{ backgroundColor: '#e6f4f1', color: '#007B63' }}
      >
        {phase}
      </span>
      <p className="font-bold text-gray-900 mb-1 flex items-center gap-1">
        <DollarSign className="w-3 h-3" />{title}
      </p>
      <p className="font-mono text-[10px] text-gray-500 mb-1.5">{rate}</p>
      <p className="text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}
