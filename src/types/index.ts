export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;       // city（表示用）
  reward: number;         // reward_usd
  currency: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  status: TaskStatus;
  clientId: string;
  runnerId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'CLIENT' | 'RUNNER' | 'BOTH';
}

export interface Message {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Application {
  id: string;
  taskId: string;
  runnerId: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
}

/* ── DB 行型（snake_case のまま） ── */
export interface DbTask {
  id: string;
  client_id: string;
  runner_id: string | null;
  title: string;
  description: string;
  country_code: string;
  city: string;
  address_detail: string | null;
  latitude: number | null;
  longitude: number | null;
  reward_usd: number;
  currency: string;
  tags: string[] | null;
  status: TaskStatus;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  task_id: string;
  application_id: string | null;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  users: { name: string } | null;
}

/* ── マッパー ── */
export function mapDbTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.city,
    reward: Number(row.reward_usd),
    currency: row.currency,
    tags: row.tags ?? [],
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    status: row.status,
    clientId: row.client_id,
    runnerId: row.runner_id ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapDbMessage(row: DbMessage): Message {
  return {
    id: row.id,
    taskId: row.task_id,
    senderId: row.sender_id,
    senderName: row.users?.name ?? 'Unknown',
    content: row.content,
    createdAt: row.created_at,
  };
}
