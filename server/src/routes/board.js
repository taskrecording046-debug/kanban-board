// Board routes: read the whole board, and read a single task's detail.

const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET /api/board
// Returns columns (ordered) each with their tasks (ordered), and each task
// carries its author, labels, and comment count. Built as a small number
// of set-based queries, then assembled in JS.
router.get("/board", async (req, res) => {
  try {
    const { rows: columns } = await pool.query(
      `SELECT id, name, position FROM columns ORDER BY position`
    );

    const { rows: tasks } = await pool.query(
      `SELECT
          t.id, t.column_id, t.title, t.description, t.position, t.priority,
          t.author_id, u.name AS author_name,
          COALESCE(cc.cnt, 0) AS comment_count
         FROM tasks t
         JOIN users u ON u.id = t.author_id
         LEFT JOIN (
           SELECT task_id, COUNT(*)::int AS cnt FROM comments GROUP BY task_id
         ) cc ON cc.task_id = t.id
        ORDER BY t.column_id, t.position`
    );

    const { rows: taskLabels } = await pool.query(
      `SELECT tl.task_id, l.id, l.name, l.color
         FROM task_labels tl
         JOIN labels l ON l.id = tl.label_id`
    );

    // Group labels by task id.
    const labelsByTask = new Map();
    for (const row of taskLabels) {
      if (!labelsByTask.has(row.task_id)) labelsByTask.set(row.task_id, []);
      labelsByTask.get(row.task_id).push({ id: row.id, name: row.name, color: row.color });
    }

    // Shape tasks and nest them under their column.
    const tasksByColumn = new Map();
    for (const t of tasks) {
      const task = {
        id: t.id,
        title: t.title,
        description: t.description,
        position: t.position,
        priority: t.priority,
        author: { id: t.author_id, name: t.author_name },
        commentCount: t.comment_count,
        labels: labelsByTask.get(t.id) || [],
      };
      if (!tasksByColumn.has(t.column_id)) tasksByColumn.set(t.column_id, []);
      tasksByColumn.get(t.column_id).push(task);
    }

    const board = columns.map((col) => ({
      id: col.id,
      name: col.name,
      position: col.position,
      tasks: tasksByColumn.get(col.id) || [],
    }));

    res.json({ columns: board });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load board." });
  }
});

module.exports = router;
