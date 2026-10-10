import { useState } from 'react'
import type { Task, TaskDraft } from '../types/task'
import { formatDueDate, isOverdue } from '../utils/task'
import { ConfirmDialog } from './ConfirmDialog'
import { TaskEditForm } from './TaskEditForm'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (id: string, draft: TaskDraft) => void
  onDelete: (id: string) => void
}

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const overdue = isOverdue(task)

  if (isEditing) {
    return (
      <li className="task-item task-item-editing">
        <TaskEditForm
          task={task}
          onSave={(draft) => {
            onEdit(task.id, draft)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className={`task-item${task.completed ? ' is-completed' : ''}`}>
      <div className="task-view">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'not completed' : 'completed'}`}
        />

        <div className="task-body">
          <div className="task-title-row">
            <span className="task-title">{task.title}</span>
            <span className={`priority-badge priority-${task.priority}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {task.details && <p className="task-details">{task.details}</p>}

          {task.dueDate !== undefined && (
            <p className={`task-due${overdue ? ' is-overdue' : ''}`}>
              <span aria-hidden="true">🗓 </span>
              {overdue ? 'Overdue · ' : 'Due '}
              <time dateTime={new Date(task.dueDate).toISOString().slice(0, 10)}>
                {formatDueDate(task.dueDate)}
              </time>
            </p>
          )}
        </div>

        <div className="task-actions">
          <button
            type="button"
            className="button button-ghost button-small"
            onClick={() => setIsEditing(true)}
            aria-label={`Edit task "${task.title}"`}
          >
            Edit
          </button>
          <button
            type="button"
            className="button button-ghost button-small button-danger-text"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete task "${task.title}"`}
          >
            Delete
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${task.title}" will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={() => {
            setConfirmDelete(false)
            onDelete(task.id)
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </li>
  )
}
