import type { FormEvent } from 'react'
import { useTaskForm } from '../hooks/useTaskForm'
import type { Task, TaskDraft } from '../types/task'
import { TaskFormFields } from './TaskFormFields'

interface TaskEditFormProps {
  task: Task
  onSave: (draft: TaskDraft) => void
  onCancel: () => void
}

export function TaskEditForm({ task, onSave, onCancel }: TaskEditFormProps) {
  const form = useTaskForm({
    title: task.title,
    details: task.details,
    priority: task.priority,
    dueDate: task.dueDate,
  })

  function submit() {
    const draft = form.getDraft()
    if (draft === null) return
    onSave(draft)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  return (
    <form
      className="task-edit-form"
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onCancel()
        }
      }}
      aria-label={`Edit task: ${task.title}`}
    >
      <TaskFormFields
        form={form}
        idPrefix={`edit-${task.id}`}
        autoFocusTitle
        onEnterSubmit={submit}
      />
      <div className="form-actions">
        <button type="submit" className="button button-primary">
          Save
        </button>
        <button type="button" className="button button-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
