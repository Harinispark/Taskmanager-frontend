export type TaskId = string

export type Priority = 'low' | 'medium' | 'high'

export type Filter = 'all' | 'active' | 'completed'

export interface Task {
  id: TaskId
  title: string
  details?: string
  completed: boolean
  priority: Priority
  /** Epoch ms, normalized to local midnight. Optional. */
  dueDate?: number
  /** Epoch ms */
  createdAt: number
  /** Epoch ms */
  updatedAt: number
}

export interface TaskDraft {
  title: string
  details?: string
  priority: Priority
  dueDate?: number
}

export interface TaskState {
  tasks: Task[]
  filter: Filter
  search: string
}
