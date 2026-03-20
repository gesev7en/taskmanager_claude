export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  category?: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  category?: string;
}

export type SortBy = 'none' | 'dueDate' | 'status';

export interface ApiError {
  status: number;
  error: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}
