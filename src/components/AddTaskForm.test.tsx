import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddTaskForm } from './AddTaskForm'

describe('AddTaskForm', () => {
  it('shows a validation error for an empty title', () => {
    render(<AddTaskForm onAdd={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
  })

  it('submits a valid task with defaults and resets the form', () => {
    const onAdd = vi.fn()
    render(<AddTaskForm onAdd={onAdd} />)

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: '  Ship it  ' } })
    fireEvent.change(screen.getByLabelText(/^Details/), { target: { value: 'Before Friday' } })
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith({
      title: '  Ship it  ',
      details: 'Before Friday',
      priority: 'high',
      dueDate: undefined,
    })

    // Form resets after a successful add.
    expect(screen.getByLabelText(/Title/)).toHaveValue('')
    expect(screen.getByLabelText('Priority')).toHaveValue('medium')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('sends the due date as epoch ms', () => {
    const onAdd = vi.fn()
    render(<AddTaskForm onAdd={onAdd} />)

    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Deadline' } })
    fireEvent.change(screen.getByLabelText(/Due date/), { target: { value: '2026-10-14' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))

    const draft = onAdd.mock.calls[0][0]
    expect(new Date(draft.dueDate).getFullYear()).toBe(2026)
    expect(new Date(draft.dueDate).getMonth()).toBe(9)
    expect(new Date(draft.dueDate).getDate()).toBe(14)
  })
})
