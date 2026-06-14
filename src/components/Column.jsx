import TaskCard from "./TaskCard";

export default function Column({ column, onTaskClick }) {
  return (
    <section className="column">
      <header className="column-header">
        <h2 className="column-name">{column.name}</h2>
        <span className="column-count">{column.tasks.length}</span>
      </header>

      <div className="column-tasks">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
        ))}
        {column.tasks.length === 0 && (
          <p className="column-empty">No tasks</p>
        )}
      </div>
    </section>
  );
}
