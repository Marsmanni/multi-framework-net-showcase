export const TaskStatus = {
  Open: 0,
  InProgress: 1,
  Completed: 2
} as const;

export type TaskStatusValue = typeof TaskStatus[keyof typeof TaskStatus];

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string | null;
  status: TaskStatusValue;
}
