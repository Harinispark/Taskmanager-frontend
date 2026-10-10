interface HeaderProps {
  activeCount: number
}

export function Header({ activeCount }: HeaderProps) {
  return (
    <header className="app-header">
      <h1 className="app-title">Task Manager</h1>
      <p className="app-subtitle" aria-live="polite">
        {activeCount === 0
          ? 'All caught up'
          : `${activeCount} task${activeCount === 1 ? '' : 's'} to do`}
      </p>
    </header>
  )
}
