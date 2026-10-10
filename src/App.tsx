import { useState } from 'react'
import './App.css'
import { AddTaskForm } from './components/AddTaskForm'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Header } from './components/Header'
import { TaskList } from './components/TaskList'
import { Toolbar } from './components/Toolbar'
import { useTasks } from './hooks/useTasks'

function App() {
  const {
    tasks,
    visibleTasks,
    filter,
    search,
    activeCount,
    completedCount,
    loading,
    error,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    setFilter,
    setSearch,
  } = useTasks()

  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="app">
      <Header activeCount={activeCount} />

      <main className="app-main">
        <AddTaskForm onAdd={addTask} />

        <Toolbar
          filter={filter}
          search={search}
          totalCount={tasks.length}
          activeCount={activeCount}
          completedCount={completedCount}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onClearCompleted={() => setConfirmClear(true)}
        />

        {loading ? (
          <p className="app-status">Loading tasks…</p>
        ) : (
          <TaskList
            visibleTasks={visibleTasks}
            totalCount={tasks.length}
            filter={filter}
            search={search}
            onToggle={toggleTask}
            onEdit={updateTask}
            onDelete={deleteTask}
          />
        )}

        {error !== null && (
          <p className="app-status app-status-error" role="alert">
            {error}
          </p>
        )}
      </main>

      <footer className="app-footer">
        {tasks.length} task{tasks.length === 1 ? '' : 's'} · {activeCount} active ·{' '}
        {completedCount} completed
      </footer>

      {confirmClear && (
        <ConfirmDialog
          title="Clear completed tasks?"
          message={`This will permanently delete ${completedCount} completed task${
            completedCount === 1 ? '' : 's'
          }.`}
          confirmLabel="Clear completed"
          onConfirm={() => {
            setConfirmClear(false)
            clearCompleted()
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  )
}

export default App
