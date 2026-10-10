import type { FormEvent } from 'react'
import { useTaskForm } from '../hooks/useTaskForm'
import type { TaskDraft } from '../types/task'
import { TaskFormFields } from './TaskFormFields'

interface AddTaskFormProps {
  onAdd: (draft: TaskDraft) => void
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const form = useTaskForm()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const draft = form.getDraft()
    if (draft === null) return
    onAdd(draft)
    form.reset()
  }

  return (
    <form className="card task-form" onSubmit={handleSubmit} aria-label="Add a task">
      <h2 className="card-title">New task</h2>
      <TaskFormFields
        form={form}
        idPrefix="add"
        autoFocusTitle
        onEnterSubmit={() => {
          const draft = form.getDraft()
          if (draft === null) return
          onAdd(draft)
          form.reset()
        }}
      />
      <div className="form-actions">
        <button type="submit" className="button button-primary">
          Add task
        </button>
      </div>
    </form>
  )
}
