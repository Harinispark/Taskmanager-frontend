import type { TaskForm } from '../hooks/useTaskForm'
import { PRIORITIES } from '../utils/task'

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

interface TaskFormFieldsProps {
  form: TaskForm
  idPrefix: string
  autoFocusTitle?: boolean
  onEnterSubmit?: () => void
}

export function TaskFormFields({
  form,
  idPrefix,
  autoFocusTitle = false,
  onEnterSubmit,
}: TaskFormFieldsProps) {
  const titleId = `${idPrefix}-title`
  const detailsId = `${idPrefix}-details`
  const priorityId = `${idPrefix}-priority`
  const dueDateId = `${idPrefix}-due`
  const errorId = `${idPrefix}-error`

  return (
    <div className="task-form-fields">
      <div className="field field-grow">
        <label className="field-label" htmlFor={titleId}>
          Title
        </label>
        <input
          id={titleId}
          className="field-input"
          type="text"
          value={form.title}
          placeholder="What needs to be done?"
          maxLength={200}
          autoFocus={autoFocusTitle}
          aria-invalid={form.error !== null}
          aria-describedby={form.error ? errorId : undefined}
          onChange={(event) => form.setTitle(event.target.value)}
        />
        {form.error !== null && (
          <p className="field-error" id={errorId} role="alert">
            {form.error}
          </p>
        )}
      </div>

      <div className="field field-grow">
        <label className="field-label" htmlFor={detailsId}>
          Details <span className="field-optional">optional</span>
        </label>
        <textarea
          id={detailsId}
          className="field-input field-textarea"
          rows={2}
          value={form.details}
          placeholder="Add more detail…"
          maxLength={2000}
          onChange={(event) => form.setDetails(event.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor={priorityId}>
          Priority
        </label>
        <select
          id={priorityId}
          className="field-input field-select"
          value={form.priority}
          onChange={(event) => form.setPriority(event.target.value as TaskForm['priority'])}
        >
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor={dueDateId}>
          Due date <span className="field-optional">optional</span>
        </label>
        <input
          id={dueDateId}
          className="field-input"
          type="date"
          value={form.dueDate}
          onChange={(event) => form.setDueDate(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && onEnterSubmit) {
              event.preventDefault()
              onEnterSubmit()
            }
          }}
        />
      </div>
    </div>
  )
}
