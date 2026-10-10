import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '../types/task'
import { TaskItem } from './TaskItem'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Write report',
    details: 'Q3 numbers',
    priority: 'high',
    createdAt: 1_000,
    updatedAt: 1_000,
    completed: false,
    ...overrides,
  }
}

function makeProps() {
  return {
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }
}

describe('TaskItem', () => {
  it('renders title, details, and priority badge', () => {
    render(<TaskItem task={makeTask()} {...makeProps()} />)
    expect(screen.getByText('Write report')).toBeInTheDocument()
    expect(screen.getByText('Q3 numbers')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('toggles completion', () => {
    const props = makeProps()
    render(<TaskItem task={makeTask()} {...props} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mark "Write report" as completed' }))
    expect(props.onToggle).toHaveBeenCalledWith('t1')
  })

  it('applies completed styling and aria state', () => {
    render(<TaskItem task={makeTask({ completed: true })} {...makeProps()} />)
    expect(screen.getByRole('checkbox', { name: 'Mark "Write report" as not completed' })).toBeChecked()
    expect(screen.getByRole('listitem')).toHaveClass('is-completed')
  })

  it('shows an overdue label for past-due active tasks', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    render(<TaskItem task={makeTask({ dueDate: yesterday.getTime() })} {...makeProps()} />)
    expect(screen.getByText(/Overdue/)).toBeInTheDocument()
  })

  it('edits a task inline and saves changes', () => {
    const props = makeProps()
    render(<TaskItem task={makeTask()} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task "Write report"' }))

    const titleInput = screen.getByLabelText(/Title/)
    expect(titleInput).toHaveValue('Write report')
    fireEvent.change(titleInput, { target: { value: 'Write final report' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(props.onEdit).toHaveBeenCalledWith('t1', {
      title: 'Write final report',
      details: 'Q3 numbers',
      priority: 'high',
      dueDate: undefined,
    })
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })

  it('cancels inline editing', () => {
    const props = makeProps()
    render(<TaskItem task={makeTask()} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task "Write report"' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onEdit).not.toHaveBeenCalled()
    expect(screen.getByText('Write report')).toBeInTheDocument()
  })

  it('deletes a task only after confirming', () => {
    const props = makeProps()
    render(<TaskItem task={makeTask()} {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete task "Write report"' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Delete task?' })
    expect(dialog).toHaveTextContent('"Write report" will be permanently deleted.')

    // Cancelling keeps the task.
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onDelete).not.toHaveBeenCalled()

    // Confirming deletes it.
    fireEvent.click(screen.getByRole('button', { name: 'Delete task "Write report"' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(props.onDelete).toHaveBeenCalledWith('t1')
  })
})