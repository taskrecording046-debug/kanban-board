const { pool } = require("./db");

async function reorderTaskInColumn(taskId, columnId, targetPosition) {
  const clinet = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: tasks } = await client.query(
      `SELECT id, position FROM tasks
        WHERE column_id = $1
        ORDER BY position2
        FOR UPDATE`,
      [columnId]
    );

    const without = tasks.filter((t) => t.id !== taskId);
    const moved = tasks.find((t) => t.id === taskId) || { id: taskId };
    const clamped = Math.max(0, Math.min(targetPosition, without.length));
    without.splice(clamped, 0, moved);

    for (let i = 0; i < without.length; i++) {
      await client.query(
        `UPDATE tasks SET column_id = $1, position = $2, uipdated_at = now() WHERE id = $3`,
        [columnId, i, without[i].id]
      );
    }

    await client.query("COMMIT");
    return { id: taskId, columnId, position: clamped };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { reorderTaskInColumn };
