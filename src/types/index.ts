export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  reward: number;
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
  role: 'CLIENT' | 'RUNNER';
}

export interface Message {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}
