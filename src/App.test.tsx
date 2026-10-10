import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from './types/task'
import * as api from './api/tasks'
import App from './App'

vi.mock('./api/tasks')

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

beforeEach(() => {
  vi.resetAllMocks()
  mockedApi.fetchTasks.mockResolvedValue([])
})

describe('App (integration)', () => {
  it('starts with an empty state', async () => {
    render(<App />)
    expect(await screen.findByText('No tasks yet')).toBeInTheDocument()
  })

  it('supports add → complete → filter → search → clear completed', async () => {
    render(<App />)
    await screen.findByText('No tasks yet')

    const created = makeTask({ id: 't1', title: 'Buy milk', priority: 'high' })
    mockedApi.createTask.mockResolvedValue(created)
    mockedApi.toggleTask.mockResolvedValue({ ...created, completed: true })
    mockedApi.clearCompletedTasks.mockResolvedValue({ deleted: 1 })

    // Add a task with a priority.
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Buy milk' } })
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))

    expect(await screen.findByText('Buy milk')).toBeInTheDocument()
    expect(document.querySelector('.priority-badge.priority-high')).toHaveTextContent('High')
    expect(screen.getByText('1 task to do')).toBeInTheDocument()

    // Complete it with the checkbox.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mark "Buy milk" as completed' }))
    await waitFor(() => expect(screen.getByText('All caught up')).toBeInTheDocument())

    // The completed filter shows it.
    fireEvent.click(screen.getByRole('button', { name: /Completed/ }))
    expect(screen.getByText('Buy milk')).toBeInTheDocument()

    // The active filter hides it.
    fireEvent.click(screen.getByRole('button', { name: /Active/ }))
    expect(screen.getByText('Nothing active')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^All/ }))

    // Search finds it by title.
    fireEvent.change(screen.getByLabelText('Search tasks'), { target: { value: 'milk' } })
    expect(screen.getByText('Buy milk')).toBeInTheDocument()

    // Clear completed removes it behind a confirmation.
    fireEvent.click(screen.getByRole('button', { name: 'Clear completed (1)' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear completed' }))
    expect(mockedApi.clearCompletedTasks).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument())
  })

  it('loads persisted tasks from the API on mount', async () => {
    mockedApi.fetchTasks.mockResolvedValue([makeTask({ id: 'x', title: 'Survive refresh' })])

    render(<App />)

    expect(await screen.findByText('Survive refresh')).toBeInTheDocument()
  })

  it('shows a load error when the API is unreachable', async () => {
    mockedApi.fetchTasks.mockRejectedValue(new Error('Could not reach the server'))

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server')
  })

  it('validates an empty add', async () => {
    render(<App />)
    await screen.findByText('No tasks yet')
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
  })
})
