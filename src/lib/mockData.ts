import { Task, Message } from '@/types';

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'パリ：ライカM4のコンディション動画検証',
    description:
      'eBay出品者（パリ11区在住）とコンタクト済み。出品者宅or近隣カフェで実機を確認し、シャッター全速・巻き上げ・カビの有無を動画撮影して送ってください。価格交渉はこちらで行うので不要です。',
    location: 'Paris, France',
    reward: 60,
    status: 'OPEN',
    clientId: 'user-001',
    createdAt: '2026-05-27T10:00:00Z',
  },
  {
    id: 'task-002',
    title: 'L.A.のホテルに忘れたソニーミラーレスを回収・DHL発送',
    description:
      'チェックアウト後、Courtyard LAX/Century Blvdの306号室にソニーα7Cを忘れました。委任状を送付済みです。フロントから回収し、最寄りのDHL店舗から日本へ発送してください。送料は着払いで構いません。',
    location: 'Los Angeles, USA',
    reward: 45,
    status: 'ASSIGNED',
    clientId: 'user-001',
    runnerId: 'user-002',
    createdAt: '2026-05-26T15:30:00Z',
  },
  {
    id: 'task-003',
    title: 'ソウル新村：深夜のアパート周辺環境を動画レポート',
    description:
      '来月から1年間住む予定のアパート（新村駅徒歩7分）の周辺を、平日深夜22:30〜23:30に歩いてノーカット動画撮影してください。騒音・照明・人通り・コンビニ距離を確認したいです。',
    location: 'Seoul, South Korea',
    reward: 35,
    status: 'IN_PROGRESS',
    clientId: 'user-001',
    runnerId: 'user-003',
    createdAt: '2026-05-25T08:00:00Z',
  },
  {
    id: 'task-004',
    title: 'ベルリン：ビンテージKAWAIピアノの鍵盤・ペダル動作確認',
    description:
      'メルカリドイツで出品されているKAWAI製アップライトピアノ（1970年代）の現物確認。全鍵盤の音抜け・スティック・ペダル3本の動作をビデオ通話または動画で確認したいです。',
    location: 'Berlin, Germany',
    reward: 55,
    status: 'COMPLETED',
    clientId: 'user-002',
    runnerId: 'user-004',
    createdAt: '2026-05-20T12:00:00Z',
  },
  {
    id: 'task-005',
    title: 'NYC：外壁補修の鍵屋3社から見積もり取得',
    description:
      'ブルックリンの所有物件（管理会社なし）の鍵交換とドア補強について、現地の鍵業者3社を回って書面見積もりをもらってきてください。写真と見積書のスキャンを送付してください。',
    location: 'New York, USA',
    reward: 40,
    status: 'OPEN',
    clientId: 'user-003',
    createdAt: '2026-05-28T09:00:00Z',
  },
  {
    id: 'task-006',
    title: 'バンコク：Or Tor Kor Marketでスパイスセットを代理購入',
    description:
      'Or Tor Kor Marketでガパオ・グリーンカレー・マサマンの本格スパイスセットを各1セット購入してください。市販の袋入りではなく、量り売りのものを希望します。国際郵便で発送をお願いします。',
    location: 'Bangkok, Thailand',
    reward: 30,
    status: 'OPEN',
    clientId: 'user-004',
    createdAt: '2026-05-28T11:00:00Z',
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    taskId: 'task-002',
    senderId: 'user-002',
    senderName: 'Marcus (Runner)',
    content:
      'ホテルフロントに確認しました。カメラは保管されています。委任状を提示して引き取り完了しました。今からDHLに向かいます。',
    createdAt: '2026-05-26T18:00:00Z',
  },
  {
    id: 'msg-002',
    taskId: 'task-002',
    senderId: 'user-001',
    senderName: '山田 健 (Client)',
    content: 'ありがとうございます！助かりました。追跡番号が出たら教えてください。',
    createdAt: '2026-05-26T18:20:00Z',
  },
  {
    id: 'msg-003',
    taskId: 'task-002',
    senderId: 'user-002',
    senderName: 'Marcus (Runner)',
    content:
      '発送完了です。DHL追跡番号: 1234567890。日本到着は3〜5営業日の見込みです。',
    createdAt: '2026-05-26T19:45:00Z',
  },
];
