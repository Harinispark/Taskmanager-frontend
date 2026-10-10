import type { Task, TaskDraft } from '../types/task'

/**
 * Base URL of the Task Manager REST API.
 * Override with VITE_API_URL (e.g. in production). Defaults to the local
 * backend started from C:\Taskmanager\backend.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new Error('Could not reach the server. Is the backend running?')
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const body: unknown = await response.json()
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        message = body.error
      }
    } catch {
      // Non-JSON error body — keep the status message.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** GET /api/tasks — load every task. */
export function fetchTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks')
}

/** POST /api/tasks — create a task from a validated draft. */
export function createTask(draft: TaskDraft): Promise<Task> {
  return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(draft) })
}

/** PUT /api/tasks/:id — update a task's editable fields. */
export function updateTask(id: string, draft: TaskDraft): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(draft) })
}

/** PATCH /api/tasks/:id — set the completion state. */
export function toggleTask(id: string, completed: boolean): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  })
}

/** DELETE /api/tasks/:id — remove one task. */
export function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' })
}

/** DELETE /api/tasks?completed=true — remove every completed task. */
export function clearCompletedTasks(): Promise<{ deleted: number }> {
  return request<{ deleted: number }>('/tasks?completed=true', { method: 'DELETE' })
}
