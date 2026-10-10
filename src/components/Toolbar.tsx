import type { Filter } from '../types/task'
import { ClearCompletedButton } from './ClearCompletedButton'
import { FilterBar } from './FilterBar'
import { SearchBox } from './SearchBox'

interface ToolbarProps {
  filter: Filter
  search: string
  totalCount: number
  activeCount: number
  completedCount: number
  onFilterChange: (filter: Filter) => void
  onSearchChange: (search: string) => void
  onClearCompleted: () => void
}

export function Toolbar({
  filter,
  search,
  totalCount,
  activeCount,
  completedCount,
  onFilterChange,
  onSearchChange,
  onClearCompleted,
}: ToolbarProps) {
  return (
    <div className="card toolbar">
      <FilterBar
        filter={filter}
        totalCount={totalCount}
        activeCount={activeCount}
        completedCount={completedCount}
        onChange={onFilterChange}
      />
      <SearchBox value={search} onChange={onSearchChange} />
      <ClearCompletedButton completedCount={completedCount} onClear={onClearCompleted} />
    </div>
  )
}
