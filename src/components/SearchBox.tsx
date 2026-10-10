interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="search-box">
      <label className="visually-hidden" htmlFor="task-search">
        Search tasks
      </label>
      <input
        id="task-search"
        className="field-input search-input"
        type="search"
        value={value}
        placeholder="Search tasks…"
        onChange={(event) => onChange(event.target.value)}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="button button-ghost button-small search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  )
}
