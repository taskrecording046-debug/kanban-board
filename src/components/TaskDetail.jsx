import { useEffect, useState } from "react";
import { api } from "../api/client";

// Slide-over panel showing a single task's detail and comments.
export default function TaskDetail({ taskId, onClose }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getTask(taskId)
      .then((data) => {
        if (!cancelled) {
          setTask(data.task);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose}>
          ✕
        </button>

        {loading && <p className="panel-loading">Loading…</p>}
        {error && <p className="panel-error">{error}</p>}

        {task && (
          <>
            <span className={`priority priority-${task.priority}`}>
              {task.priority}
            </span>
            <h2 className="panel-title">{task.title}</h2>
            <p className="panel-author">by {task.author.name}</p>
            <p className="panel-description">{task.description}</p>

            <h3 className="panel-section">Comments</h3>
            {task.comments.length === 0 && (
              <p className="panel-empty">No comments yet.</p>
            )}
            <ul className="comment-list">
              {task.comments.map((c) => (
                <li key={c.id} className="comment">
                  <span className="comment-author">{c.authorName}</span>
                  <span className="comment-body">{c.body}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
