import { useEffect, useState } from "react";
import { api } from "./api/client";
import Column from "./components/Column";
import TaskDetail from "./components/TaskDetail";

// ⚠️ Starter version — this component has a request race condition.
//
// When the assignee filter changes, it fetches the filtered board from
// the server. But it never guards against out-of-order responses: if you
// switch filters quickly, a slow earlier request can resolve AFTER a fast
// later one and overwrite the board with stale results. The dropdown then
// shows one assignee while the board shows another's tasks.
//
// See App.fixed.jsx for the corrected version.

export default function App() {
  const [columns, setColumns] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [authorFilter, setAuthorFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Load the user list once.
  useEffect(() => {
    api.getUsers().then((data) => setUsers(data.users)).catch((e) => setError(e.message));
  }, []);

  // Re-fetch the board whenever the filter changes.
  useEffect(() => {
    setLoading(true);
    const assignee = authorFilter === "all" ? null : authorFilter;

    api
      .getBoard(assignee)
      .then((data) => {
        // ⚠️ No guard: whatever response arrives last wins, even if it
        // belongs to a filter the user already moved away from.
        setColumns(data.columns);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [authorFilter]);

  if (error) return <div className="app-state app-error">{error}</div>;
  if (!columns) return <div className="app-state">Loading board…</div>;

  const totalTasks = columns.reduce((sum, c) => sum + c.tasks.length, 0);

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
          <span className="task-total">
            {loading ? "Loading…" : `${totalTasks} tasks`}
          </span>
        </div>
      </header>

      <main className="board">
        {columns.map((col) => (
          <Column key={col.id} column={col} onTaskClick={(t) => setSelectedTaskId(t.id)} />
        ))}
      </main>

      {selectedTaskId && (
        <TaskDetail taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  );
}
