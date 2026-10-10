import type { Filter, Priority, Task, TaskDraft } from '../types/task'

export const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'] as const

export const MAX_TITLE_LENGTH = 200
export const MAX_DETAILS_LENGTH = 2000

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
}

export function isFilter(value: unknown): value is Filter {
  return value === 'all' || value === 'active' || value === 'completed'
}

/** Returns an error message for an invalid title, or null when valid. */
export function validateTitle(title: string): string | null {
  const trimmed = title.trim()
  if (trimmed.length === 0) return 'Title is required'
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer`
  }
  return null
}

/** Creates a new task from a draft. The draft title must already be validated. */
export function createTask(draft: TaskDraft, now: number = Date.now()): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    title: draft.title.trim(),
    completed: false,
    priority: draft.priority,
    createdAt: now,
    updatedAt: now,
  }
  const details = draft.details?.trim()
  if (details) task.details = details
  if (draft.dueDate !== undefined) task.dueDate = draft.dueDate
  return task
}

/** Epoch ms for local midnight of the given timestamp. */
export function startOfDay(timestamp: number = Date.now()): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function isOverdue(task: Task, now: number = Date.now()): boolean {
  return !task.completed && task.dueDate !== undefined && task.dueDate < startOfDay(now)
}

/** Parses a `<input type="date">` value (yyyy-mm-dd) into epoch ms, or undefined. */
export function parseDateInput(value: string): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined
  }
  return date.getTime()
}

/** Formats epoch ms as a value suitable for `<input type="date">`. */
export function toDateInputValue(timestamp: number | undefined): string {
  if (timestamp === undefined) return ''
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Human-readable due date, e.g. "Oct 14, 2026". */
export function formatDueDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function matchesSearch(task: Task, search: string): boolean {
  const needle = search.trim().toLowerCase()
  if (needle.length === 0) return true
  return (
    task.title.toLowerCase().includes(needle) ||
    (task.details?.toLowerCase().includes(needle) ?? false)
  )
}

/**
 * Sorts tasks for display: incomplete first, then due date ascending
 * (tasks without a due date last), newest first as a tie-break.
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.dueDate !== undefined && b.dueDate !== undefined && a.dueDate !== b.dueDate) {
      return a.dueDate - b.dueDate
    }
    if (a.dueDate !== undefined && b.dueDate === undefined) return -1
    if (a.dueDate === undefined && b.dueDate !== undefined) return 1
    return b.createdAt - a.createdAt
  })
}

/** Applies the status filter and search query, then sorts for display. */
export function selectVisibleTasks(tasks: Task[], filter: Filter, search: string): Task[] {
  const filtered = tasks.filter((task) => {
    if (filter === 'active' && task.completed) return false
    if (filter === 'completed' && !task.completed) return false
    return matchesSearch(task, search)
  })
  return sortTasks(filtered)
}

export function countActive(tasks: Task[]): number {
  return tasks.filter((task) => !task.completed).length
}
