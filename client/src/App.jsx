import { useEffect, useState } from "react";
import { api } from "./api/client";
import Column from "./components/Column";
import TaskDetail from "./components/TaskDetail";

export default function App() {
  const [board, setBoard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [authorFilter, setAuthorFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Initial load.
  useEffect(() => {
    Promise.all([api.getBoard(), api.getUsers()])
      .then(([boardData, usersData]) => {
        setBoard(boardData.columns);
        setUsers(usersData.users);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="app-state">Loading board…</div>;
  if (error) return <div className="app-state app-error">{error}</div>;

  // Apply the author filter client-side.
  const visibleColumns = board.map((col) => ({
    ...col,
    tasks:
      authorFilter === "all"
        ? col.tasks
        : col.tasks.filter((t) => String(t.author.id) === authorFilter),
  }));

  const totalTasks = visibleColumns.reduce((sum, c) => sum + c.tasks.length, 0);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">TEAM · SPRINT BOARD</p>
          <h1 className="app-title">Kanban Board</h1>
        </div>
        <div className="app-controls">
          <label className="filter">
            Assignee
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
            >
              <option value="all">Everyone</option>
              {users.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <span className="task-total">{totalTasks} tasks</span>
        </div>
      </header>

      <main className="board">
        {visibleColumns.map((col) => (
          <Column key={col.id} column={col} onTaskClick={(t) => setSelectedTaskId(t.id)} />
        ))}
      </main>

      {selectedTaskId && (
        <TaskDetail taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  );
}
