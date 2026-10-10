import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Filter, Task, TaskDraft } from '../types/task'
import { countActive, selectVisibleTasks } from '../utils/task'
import * as api from '../api/tasks'

export interface UseTasksResult {
  tasks: Task[]
  visibleTasks: Task[]
  filter: Filter
  search: string
  activeCount: number
  completedCount: number
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  addTask: (draft: TaskDraft) => Promise<void>
  updateTask: (id: string, draft: TaskDraft) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  clearCompleted: () => Promise<void>
  setFilter: (filter: Filter) => void
  setSearch: (search: string) => void
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong'
}

/**
 * Central store for tasks: CRUD actions, view state, and sync with the
 * backend REST API (replaces the previous localStorage persistence).
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Always-current snapshot for actions that need to read the latest tasks.
  const tasksRef = useRef(tasks)
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  const sync = useCallback(async () => {
    try {
      const loaded = await api.fetchTasks()
      setTasks(loaded)
      setError(null)
    } catch (caught) {
      setError(toMessage(caught))
    }
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    await sync()
    setLoading(false)
  }, [sync])

  useEffect(() => {
    let active = true
    void (async () => {
      await sync()
      if (active) setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [sync])

  const addTask = useCallback(async (draft: TaskDraft) => {
    try {
      const created = await api.createTask(draft)
      setTasks((current) => [created, ...current])
      setError(null)
    } catch (caught) {
      setError(toMessage(caught))
    }
  }, [])

  const updateTask = useCallback(async (id: string, draft: TaskDraft) => {
    try {
      const updated = await api.updateTask(id, draft)
      setTasks((current) => current.map((task) => (task.id === id ? updated : task)))
      setError(null)
    } catch (caught) {
      setError(toMessage(caught))
    }
  }, [])

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasksRef.current.find((candidate) => candidate.id === id)
      if (!task) return
      const nextCompleted = !task.completed

      // Optimistic flip, reconciled with the server response.
      setTasks((current) =>
        current.map((candidate) =>
          candidate.id === id ? { ...candidate, completed: nextCompleted } : candidate,
        ),
      )
      try {
        const updated = await api.toggleTask(id, nextCompleted)
        setTasks((current) => current.map((candidate) => (candidate.id === id ? updated : candidate)))
        setError(null)
      } catch (caught) {
        setError(toMessage(caught))
        await sync()
      }
    },
    [sync],
  )

  const deleteTask = useCallback(async (id: string) => {
    const previous = tasksRef.current
    setTasks((current) => current.filter((task) => task.id !== id))
    try {
      await api.deleteTask(id)
      setError(null)
    } catch (caught) {
      setError(toMessage(caught))
      setTasks(previous)
    }
  }, [])

  const clearCompleted = useCallback(async () => {
    const previous = tasksRef.current
    setTasks((current) => current.filter((task) => !task.completed))
    try {
      await api.clearCompletedTasks()
      setError(null)
    } catch (caught) {
      setError(toMessage(caught))
      setTasks(previous)
    }
  }, [])

  const visibleTasks = useMemo(
    () => selectVisibleTasks(tasks, filter, search),
    [tasks, filter, search],
  )

  return {
    tasks,
    visibleTasks,
    filter,
    search,
    activeCount: countActive(tasks),
    completedCount: tasks.length - countActive(tasks),
    loading,
    error,
    reload,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    setFilter,
    setSearch,
  }
}
