// Task routes: create, update, move between columns, delete, and read
// a single task with its comments.

const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET /api/tasks/:id  — a single task with its comments.
router.get("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rows: taskRows } = await pool.query(
      `SELECT t.id, t.column_id, t.title, t.description, t.position, t.priority,
              t.author_id, u.name AS author_name
         FROM tasks t JOIN users u ON u.id = t.author_id
        WHERE t.id = $1`,
      [id]
    );
    if (taskRows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    const { rows: comments } = await pool.query(
      `SELECT c.id, c.body, c.created_at, u.name AS author_name
         FROM comments c JOIN users u ON u.id = c.author_id
        WHERE c.task_id = $1
        ORDER BY c.created_at`,
      [id]
    );

    const t = taskRows[0];
    res.json({
      task: {
        id: t.id,
        columnId: t.column_id,
        title: t.title,
        description: t.description,
        position: t.position,
        priority: t.priority,
        author: { id: t.author_id, name: t.author_name },
        comments: comments.map((c) => ({
          id: c.id,
          body: c.body,
          createdAt: c.created_at,
          authorName: c.author_name,
        })),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load task." });
  }
});

// POST /api/tasks  — create a task at the bottom of a column.
router.post("/tasks", async (req, res) => {
  const { columnId, authorId, title, description, priority } = req.body || {};
  if (!columnId || !authorId || !title) {
    return res.status(400).json({ error: "columnId, authorId and title are required." });
  }
  try {
    const { rows: posRows } = await pool.query(
      `SELECT COALESCE(MAX(position) + 1, 0) AS next FROM tasks WHERE column_id = $1`,
      [columnId]
    );
    const position = posRows[0].next;

    const { rows } = await pool.query(
      `INSERT INTO tasks (column_id, author_id, title, description, position, priority)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'medium'))
       RETURNING id, column_id, title, description, position, priority`,
      [columnId, authorId, title, description || "", position, priority]
    );
    res.status(201).json({ task: rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create task." });
  }
});

// PATCH /api/tasks/:id  — update title/description/priority.
router.patch("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, priority } = req.body || {};
  try {
    const { rows } = await pool.query(
      `UPDATE tasks
          SET title       = COALESCE($2, title),
              description = COALESCE($3, description),
              priority    = COALESCE($4, priority),
              updated_at  = now()
        WHERE id = $1
        RETURNING id, column_id, title, description, position, priority`,
      [id, title, description, priority]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json({ task: rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update task." });
  }
});

// POST /api/tasks/:id/move  — move a task to a column at a position.
router.post("/tasks/:id/move", async (req, res) => {
  const id = Number(req.params.id);
  const { columnId, position } = req.body || {};
  if (columnId == null || position == null) {
    return res.status(400).json({ error: "columnId and position are required." });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET column_id = $2, position = $3, updated_at = now()
        WHERE id = $1 RETURNING id, column_id, position`,
      [id, columnId, position]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Task not found." });
    res.json({ task: rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to move task." });
  }
});

// DELETE /api/tasks/:id
router.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const { rowCount } = await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to delete task." });
  }
});

module.exports = router;
