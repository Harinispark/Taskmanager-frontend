interface ClearCompletedButtonProps {
  completedCount: number
  onClear: () => void
}

export function ClearCompletedButton({ completedCount, onClear }: ClearCompletedButtonProps) {
  return (
    <button
      type="button"
      className="button button-ghost button-small"
      disabled={completedCount === 0}
      onClick={onClear}
    >
      Clear completed{completedCount > 0 ? ` (${completedCount})` : ''}
    </button>
  )
}
