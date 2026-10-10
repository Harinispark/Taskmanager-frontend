import { describe, expect, it } from 'vitest'
import type { Task } from '../types/task'
import {
  createTask,
  isOverdue,
  matchesSearch,
  parseDateInput,
  selectVisibleTasks,
  sortTasks,
  toDateInputValue,
  validateTitle,
} from './task'

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

describe('validateTitle', () => {
  it('rejects empty and whitespace-only titles', () => {
    expect(validateTitle('')).not.toBeNull()
    expect(validateTitle('   ')).not.toBeNull()
  })

  it('rejects titles above the length limit', () => {
    expect(validateTitle('x'.repeat(201))).not.toBeNull()
  })

  it('accepts a normal title', () => {
    expect(validateTitle('Buy groceries')).toBeNull()
  })
})

describe('createTask', () => {
  it('creates an active task with trimmed fields', () => {
    const task = createTask(
      { title: '  Write report  ', details: '  Q3 numbers  ', priority: 'high' },
      5_000,
    )
    expect(task.title).toBe('Write report')
    expect(task.details).toBe('Q3 numbers')
    expect(task.completed).toBe(false)
    expect(task.priority).toBe('high')
    expect(task.createdAt).toBe(5_000)
    expect(task.updatedAt).toBe(5_000)
    expect(task.id).toEqual(expect.any(String))
    expect(task.id.length).toBeGreaterThan(0)
  })

  it('omits empty details and an undefined due date', () => {
    const task = createTask({ title: 'No details', priority: 'low', details: '   ' })
    expect(task).not.toHaveProperty('details')
    expect(task).not.toHaveProperty('dueDate')
  })
})

describe('date input helpers', () => {
  it('parses a yyyy-mm-dd value into local midnight', () => {
    const parsed = parseDateInput('2026-10-14')
    expect(parsed).toBeDefined()
    expect(new Date(parsed!).getFullYear()).toBe(2026)
    expect(new Date(parsed!).getMonth()).toBe(9)
    expect(new Date(parsed!).getDate()).toBe(14)
  })

  it('rejects empty and impossible dates', () => {
    expect(parseDateInput('')).toBeUndefined()
    expect(parseDateInput('2026-13-01')).toBeUndefined()
    expect(parseDateInput('not-a-date')).toBeUndefined()
  })

  it('round-trips through toDateInputValue', () => {
    const parsed = parseDateInput('2026-01-05')
    expect(toDateInputValue(parsed)).toBe('2026-01-05')
    expect(toDateInputValue(undefined)).toBe('')
  })
})

describe('matchesSearch', () => {
  it('matches title or details, case-insensitively', () => {
    expect(matchesSearch(makeTask({ title: 'Walk the dog' }), 'DOG')).toBe(true)
    expect(matchesSearch(makeTask({ details: 'With the leash' }), 'leash')).toBe(true)
    expect(matchesSearch(makeTask({ title: 'Walk the dog' }), 'cat')).toBe(false)
    expect(matchesSearch(makeTask({ title: 'Walk the dog' }), '   ')).toBe(true)
  })
})

describe('sortTasks', () => {
  it('puts incomplete tasks first and completed tasks last', () => {
    const tasks = [
      makeTask({ id: 'done', completed: true, createdAt: 3_000 }),
      makeTask({ id: 'open', completed: false, createdAt: 1_000 }),
    ]
    expect(sortTasks(tasks).map((t) => t.id)).toEqual(['open', 'done'])
  })

  it('sorts by due date ascending among incomplete tasks', () => {
    const tasks = [
      makeTask({ id: 'later', dueDate: 2_000 }),
      makeTask({ id: 'sooner', dueDate: 1_000 }),
      makeTask({ id: 'nodate', createdAt: 9_000 }),
    ]
    expect(sortTasks(tasks).map((t) => t.id)).toEqual(['sooner', 'later', 'nodate'])
  })
})

describe('selectVisibleTasks', () => {
  const tasks = [
    makeTask({ id: 'a', title: 'Active chore', completed: false }),
    makeTask({ id: 'b', title: 'Finished chore', completed: true }),
    makeTask({ id: 'c', title: 'Other task', completed: false }),
  ]

  it('filters by status', () => {
    expect(selectVisibleTasks(tasks, 'all', '').map((t) => t.id)).toEqual(['a', 'c', 'b'])
    expect(selectVisibleTasks(tasks, 'active', '').map((t) => t.id)).toEqual(['a', 'c'])
    expect(selectVisibleTasks(tasks, 'completed', '').map((t) => t.id)).toEqual(['b'])
  })

  it('combines the status filter with search', () => {
    expect(selectVisibleTasks(tasks, 'active', 'chore').map((t) => t.id)).toEqual(['a'])
    expect(selectVisibleTasks(tasks, 'completed', 'chore').map((t) => t.id)).toEqual(['b'])
    expect(selectVisibleTasks(tasks, 'all', 'zzz')).toEqual([])
  })
})

describe('isOverdue', () => {
  const now = new Date(2026, 9, 10, 12, 0, 0).getTime() // Oct 10 2026, noon

  it('is true only for incomplete tasks with a past due date', () => {
    const yesterday = new Date(2026, 9, 9).getTime()
    expect(isOverdue(makeTask({ dueDate: yesterday }), now)).toBe(true)
    expect(isOverdue(makeTask({ dueDate: yesterday, completed: true }), now)).toBe(false)
    expect(isOverdue(makeTask(), now)).toBe(false)
  })

  it('is false when due today', () => {
    const today = new Date(2026, 9, 10).getTime()
    expect(isOverdue(makeTask({ dueDate: today }), now)).toBe(false)
  })
})
