export interface KanbanUser {
  id: string;
  name: string | null;
  image?: string | null;
  avatar?: string | null;
}

export interface KanbanClient {
  id: string;
  name: string;
}

export interface KanbanProject {
  id: string;
  name: string;
  color?: string | null;
}

export type TaskPriority = "baixa" | "media" | "alta";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: TaskPriority;
  order: number;
  dueDate?: string | Date | null;
  userId: string;
  assigneeId?: string | null;
  assignee?: KanbanUser | null;
  clientId?: string | null;
  client?: KanbanClient | null;
  projectId?: string | null;
  project?: KanbanProject | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
