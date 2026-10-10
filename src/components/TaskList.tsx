import type { Task, TaskDraft } from '../types/task'
import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  visibleTasks: Task[]
  totalCount: number
  filter: 'all' | 'active' | 'completed'
  search: string
  onToggle: (id: string) => void
  onEdit: (id: string, draft: TaskDraft) => void
  onDelete: (id: string) => void
}

function emptyStateFor(
  totalCount: number,
  filter: TaskListProps['filter'],
  search: string,
): { title: string; message: string } {
  if (search.trim().length > 0) {
    return {
      title: 'No matching tasks',
      message: `Nothing matches "${search.trim()}". Try a different search.`,
    }
  }
  if (totalCount === 0) {
    return {
      title: 'No tasks yet',
      message: 'Add your first task with the form above.',
    }
  }
  if (filter === 'active') {
    return { title: 'Nothing active', message: 'Every task is complete. Nice work!' }
  }
  return {
    title: 'No completed tasks',
    message: 'Tasks you finish will show up here.',
  }
}

export function TaskList({
  visibleTasks,
  totalCount,
  filter,
  search,
  onToggle,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (visibleTasks.length === 0) {
    const state = emptyStateFor(totalCount, filter, search)
    return <EmptyState title={state.title} message={state.message} />
  }

  return (
    <ul className="task-list" aria-label="Tasks">
      {visibleTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
