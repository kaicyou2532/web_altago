import { Task, Message } from '@/types';

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'エッフェル塔の近くの花屋で花束を購入して欲しい',
    description:
      'エッフェル塔から徒歩5分以内にある花屋で、赤いバラ12本の花束を購入してください。予算は30ドル以内でお願いします。購入後、写真を送ってください。',
    location: 'Paris, France',
    reward: 25,
    status: 'OPEN',
    clientId: 'user-001',
    createdAt: '2026-05-27T10:00:00Z',
  },
  {
    id: 'task-002',
    title: 'ニューヨークのあのカフェのブレンドコーヒー豆を買ってきて',
    description:
      'Brooklyn Roasting Company で「House Blend」の250g袋を2つ購入してください。オンラインでは売っていないので現地購入が必要です。',
    location: 'New York, USA',
    reward: 40,
    status: 'ASSIGNED',
    clientId: 'user-001',
    runnerId: 'user-002',
    createdAt: '2026-05-26T15:30:00Z',
  },
  {
    id: 'task-003',
    title: 'ホテルに忘れたパスポートケースを回収して送付してほしい',
    description:
      'ロンドンのHilton Garden Inn City of Londonにチェックアウト後、部屋にパスポートケース（黒色、レザー製）を忘れました。ホテルに確認の上、回収して日本に郵送してください。',
    location: 'London, UK',
    reward: 80,
    status: 'IN_PROGRESS',
    clientId: 'user-001',
    runnerId: 'user-003',
    createdAt: '2026-05-25T08:00:00Z',
  },
  {
    id: 'task-004',
    title: 'バルセロナのサグラダファミリア入場チケットを現地購入',
    description:
      '来月の旅行のために、サグラダファミリアの入場チケットを現地の窓口で2枚購入してください。日時は6月15日10時を希望します。',
    location: 'Barcelona, Spain',
    reward: 30,
    status: 'COMPLETED',
    clientId: 'user-001',
    createdAt: '2026-05-20T12:00:00Z',
  },
  {
    id: 'task-005',
    title: 'シドニーのマーケットでオパールジュエリーを探してほしい',
    description:
      'The Rocks Markets で予算100ドル以内のオパールを使ったネックレスかブレスレットを探してください。写真を複数送ってもらい、選んだものを購入します。',
    location: 'Sydney, Australia',
    reward: 50,
    status: 'OPEN',
    clientId: 'user-004',
    createdAt: '2026-05-28T09:00:00Z',
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    taskId: 'task-003',
    senderId: 'user-003',
    senderName: 'Alex (Runner)',
    content: 'ホテルに連絡しました。パスポートケースはフロントで預かってもらえています。',
    createdAt: '2026-05-25T10:00:00Z',
  },
  {
    id: 'msg-002',
    taskId: 'task-003',
    senderId: 'user-001',
    senderName: '田中 太郎 (Client)',
    content: 'ありがとうございます！日本への郵送をお願いできますか？送料は別途お支払いします。',
    createdAt: '2026-05-25T10:15:00Z',
  },
  {
    id: 'msg-003',
    taskId: 'task-003',
    senderId: 'user-003',
    senderName: 'Alex (Runner)',
    content: '了解です。EMSで発送予定です。追跡番号が分かり次第お知らせします。',
    createdAt: '2026-05-25T10:30:00Z',
  },
];
