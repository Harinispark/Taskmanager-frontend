import { useState } from 'react'
import type { Priority, TaskDraft } from '../types/task'
import { parseDateInput, toDateInputValue, validateTitle } from '../utils/task'

export interface TaskFormInitial {
  title: string
  details?: string
  priority: Priority
  dueDate?: number
}

/**
 * Shared field state + validation for the add and edit forms.
 * `getDraft()` returns a validated draft, or null (and sets `error`) when invalid.
 */
export function useTaskForm(initial?: TaskFormInitial) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [details, setDetails] = useState(initial?.details ?? '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(toDateInputValue(initial?.dueDate))
  const [error, setError] = useState<string | null>(null)

  function getDraft(): TaskDraft | null {
    const validationError = validateTitle(title)
    if (validationError) {
      setError(validationError)
      return null
    }
    setError(null)
    const trimmedDetails = details.trim()
    return {
      title,
      details: trimmedDetails.length > 0 ? trimmedDetails : undefined,
      priority,
      dueDate: parseDateInput(dueDate),
    }
  }

  function reset() {
    setTitle('')
    setDetails('')
    setPriority('medium')
    setDueDate('')
    setError(null)
  }

  return {
    title,
    setTitle,
    details,
    setDetails,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    error,
    setError,
    getDraft,
    reset,
  }
}

export type TaskForm = ReturnType<typeof useTaskForm>
