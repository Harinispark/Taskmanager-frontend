import { afterEach, describe, expect, it, vi } from 'vitest'
import * as api from './tasks'

const BASE = 'http://localhost:3000/api'

function stubFetch(response: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('tasks API client', () => {
  it('GETs the task list', async () => {
    const tasks = [{ id: '1', title: 'T' }]
    const fetchMock = stubFetch({ ok: true, status: 200, json: async () => tasks })

    await expect(api.fetchTasks()).resolves.toEqual(tasks)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${BASE}/tasks`)
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(init.method).toBeUndefined()
  })

  it('POSTs a new task', async () => {
    const created = { id: '1', title: 'New' }
    const fetchMock = stubFetch({ ok: true, status: 201, json: async () => created })

    await expect(api.createTask({ title: 'New', priority: 'medium' })).resolves.toEqual(created)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${BASE}/tasks`)
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ title: 'New', priority: 'medium' }))
  })

  it('PUTs an update', async () => {
    const updated = { id: '7', title: 'Updated' }
    const fetchMock = stubFetch({ ok: true, status: 200, json: async () => updated })

    await expect(api.updateTask('7', { title: 'Updated', priority: 'high' })).resolves.toEqual(updated)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${BASE}/tasks/7`)
    expect(init.method).toBe('PUT')
  })

  it('PATCHes the completion state', async () => {
    const fetchMock = stubFetch({ ok: true, status: 200, json: async () => ({}) })

    await api.toggleTask('7', true)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${BASE}/tasks/7`)
    expect(init.method).toBe('PATCH')
    expect(init.body).toBe(JSON.stringify({ completed: true }))
  })

  it('DELETEs a single task and tolerates a 204', async () => {
    const fetchMock = stubFetch({ ok: true, status: 204 })

    await expect(api.deleteTask('abc')).resolves.toBeUndefined()

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${BASE}/tasks/abc`)
    expect(init.method).toBe('DELETE')
  })

  it('clears completed tasks', async () => {
    const fetchMock = stubFetch({ ok: true, status: 200, json: async () => ({ deleted: 3 }) })

    await expect(api.clearCompletedTasks()).resolves.toEqual({ deleted: 3 })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${BASE}/tasks?completed=true`)
    expect(init.method).toBe('DELETE')
  })

  it('surfaces the server error message', async () => {
    stubFetch({ ok: false, status: 400, json: async () => ({ error: 'Validation failed' }) })

    await expect(api.createTask({ title: '', priority: 'medium' })).rejects.toThrow(
      'Validation failed',
    )
  })

  it('reports an unreachable server', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('failed to fetch')))

    await expect(api.fetchTasks()).rejects.toThrow('Could not reach the server')
  })
})
