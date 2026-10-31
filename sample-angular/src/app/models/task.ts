export enum TaskStatus {
  Open = 0,
  InProgress = 1,
  Completed = 2
}

export type TaskStatusValue = TaskStatus.Open | TaskStatus.InProgress | TaskStatus.Completed;

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string | null;
  status: TaskStatusValue;
  createdAt?: string;
}

export interface TaskInput {
  title: string;
  description: string;
  dueDate: string | null;
  status: TaskStatusValue;
}
