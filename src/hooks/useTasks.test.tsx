import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '../types/task'
import * as api from '../api/tasks'
import { useTasks } from './useTasks'

vi.mock('../api/tasks')

const mockedApi = vi.mocked(api)

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 'id-1',
    title: overrides.title ?? 'Sample task',
    completed: overrides.completed ?? false,
    priority: overrides.priority ?? 'medium',
    createdAt: overrides.createdAt ?? 1_000,
    updatedAt: overrides.updatedAt ?? 1_000,
    ...overrides,
  }
}

async function setup(initial: Task[] = []) {
  mockedApi.fetchTasks.mockResolvedValue(initial)
  const view = renderHook(() => useTasks())
  await waitFor(() => expect(view.result.current.loading).toBe(false))
  return view
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useTasks', () => {
  it('loads tasks from the API', async () => {
    const { result } = await setup([makeTask({ id: 'a', title: 'Loaded' })])
    expect(mockedApi.fetchTasks).toHaveBeenCalledTimes(1)
    expect(result.current.tasks.map((t) => t.title)).toEqual(['Loaded'])
    expect(result.current.activeCount).toBe(1)
  })

  it('reports a load error', async () => {
    mockedApi.fetchTasks.mockRejectedValue(new Error('Network down'))
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Network down')
    expect(result.current.tasks).toEqual([])
  })

  it('adds a task via the API', async () => {
    const { result } = await setup()
    const created = makeTask({ id: 'new', title: 'Write tests', priority: 'high' })
    mockedApi.createTask.mockResolvedValue(created)

    await act(async () => {
      await result.current.addTask({ title: 'Write tests', priority: 'high' })
    })

    expect(mockedApi.createTask).toHaveBeenCalledWith({ title: 'Write tests', priority: 'high' })
    expect(result.current.tasks).toEqual([created])
    expect(result.current.activeCount).toBe(1)
  })

  it('toggles completion via the API', async () => {
    const task = makeTask({ id: 'a', completed: false })
    const { result } = await setup([task])
    mockedApi.toggleTask.mockResolvedValue({ ...task, completed: true })

    await act(async () => {
      await result.current.toggleTask('a')
    })

    expect(mockedApi.toggleTask).toHaveBeenCalledWith('a', true)
    expect(result.current.tasks[0].completed).toBe(true)
    expect(result.current.activeCount).toBe(0)
    expect(result.current.completedCount).toBe(1)
  })

  it('updates task fields via the API', async () => {
    const { result } = await setup([makeTask({ id: 'a', title: 'Old title', priority: 'low' })])
    const updated = makeTask({
      id: 'a',
      title: 'New title',
      details: 'More detail',
      priority: 'high',
      dueDate: 1_700_000_000_000,
    })
    mockedApi.updateTask.mockResolvedValue(updated)

    await act(async () => {
      await result.current.updateTask('a', {
        title: 'New title',
        details: 'More detail',
        priority: 'high',
        dueDate: 1_700_000_000_000,
      })
    })

    expect(result.current.tasks[0].title).toBe('New title')
    expect(result.current.tasks[0].details).toBe('More detail')
    expect(result.current.tasks[0].priority).toBe('high')
    expect(result.current.tasks[0].dueDate).toBe(1_700_000_000_000)
  })

  it('deletes a single task via the API', async () => {
    const { result } = await setup([
      makeTask({ id: 'a', title: 'Keep' }),
      makeTask({ id: 'b', title: 'Remove' }),
    ])
    mockedApi.deleteTask.mockResolvedValue(undefined)

    await act(async () => {
      await result.current.deleteTask('b')
    })

    expect(mockedApi.deleteTask).toHaveBeenCalledWith('b')
    expect(result.current.tasks.map((t) => t.title)).toEqual(['Keep'])
  })

  it('restores the list when a delete fails', async () => {
    const { result } = await setup([makeTask({ id: 'a', title: 'Keep' })])
    mockedApi.deleteTask.mockRejectedValue(new Error('boom'))

    await act(async () => {
      await result.current.deleteTask('a')
    })

    expect(result.current.tasks.map((t) => t.title)).toEqual(['Keep'])
    expect(result.current.error).toBe('boom')
  })

  it('clears only completed tasks via the API', async () => {
    const { result } = await setup([
      makeTask({ id: 'a', title: 'Done thing', completed: true }),
      makeTask({ id: 'b', title: 'Open thing' }),
    ])
    mockedApi.clearCompletedTasks.mockResolvedValue({ deleted: 1 })

    await act(async () => {
      await result.current.clearCompleted()
    })

    expect(mockedApi.clearCompletedTasks).toHaveBeenCalledTimes(1)
    expect(result.current.tasks.map((t) => t.title)).toEqual(['Open thing'])
  })

  it('filters and searches', async () => {
    const { result } = await setup([
      makeTask({ id: 'a', title: 'Buy milk' }),
      makeTask({ id: 'b', title: 'Walk dog', completed: true }),
    ])

    act(() => result.current.setFilter('active'))
    expect(result.current.visibleTasks.map((t) => t.title)).toEqual(['Buy milk'])

    act(() => result.current.setFilter('completed'))
    expect(result.current.visibleTasks.map((t) => t.title)).toEqual(['Walk dog'])

    act(() => {
      result.current.setFilter('all')
      result.current.setSearch('milk')
    })
    expect(result.current.visibleTasks.map((t) => t.title)).toEqual(['Buy milk'])
  })
})
