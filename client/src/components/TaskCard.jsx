const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };

export default function TaskCard({ task, onClick }) {
  return (
    <article className="task-card" onClick={() => onClick?.(task)}>
      <div className="task-card-top">
        <span className={`priority priority-${task.priority}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
        {task.labels.map((label) => (
          <span
            key={label.id}
            className="label-chip"
            style={{ "--chip": label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>

      <h3 className="task-title">{task.title}</h3>

      <div className="task-card-foot">
        <span className="task-author">{task.author.name}</span>
        {task.commentCount > 0 && (
          <span className="task-comments">{task.commentCount} 💬</span>
        )}
      </div>
    </article>
  );
}
