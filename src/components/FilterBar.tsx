import type { Filter } from '../types/task'

interface FilterBarProps {
  filter: Filter
  totalCount: number
  activeCount: number
  completedCount: number
  onChange: (filter: Filter) => void
}

const TABS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export function FilterBar({
  filter,
  totalCount,
  activeCount,
  completedCount,
  onChange,
}: FilterBarProps) {
  const counts: Record<Filter, number> = {
    all: totalCount,
    active: activeCount,
    completed: completedCount,
  }

  return (
    <div className="filter-bar" role="group" aria-label="Filter tasks">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`filter-tab${filter === value ? ' is-active' : ''}`}
          aria-pressed={filter === value}
          onClick={() => onChange(value)}
        >
          {label}
          <span className="filter-count">{counts[value]}</span>
        </button>
      ))}
    </div>
  )
}
