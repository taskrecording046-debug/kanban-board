// ⚠️ Starter version — this module has a read-modify-write race condition.
//
// reorderTaskInColumn() moves a task to `targetPosition` within a column
// and shifts the other tasks to keep positions contiguous (0,1,2,…).
//
// It does this in three steps:
//   1. READ all tasks in the column and their current positions
//   2. COMPUTE the new ordering in JavaScript
//   3. WRITE the new positions back, one UPDATE per task
//
// Each step is its own query, with no transaction and no locking. When
// two users drag cards in the same column at the same time, their
// read-compute-write cycles interleave: both read the same starting
// state, both compute against it, and the second write clobbers the
// first. The result is duplicated or skipped positions — a "lost update".
//
// See reorder-service.fixed.js for the corrected version.

const { pool } = require("./db");

async function reorderTaskInColumn(taskId, columnId, targetPosition) {
  // Step 1: READ the current order of the column.
  const { rows: tasks } = await pool.query(
    `SELECT id, position FROM tasks WHERE column_id = $1 ORDER BY position`,
    [columnId]
  );

  // Step 2: COMPUTE the new ordering in JS.
  // Remove the moved task, then re-insert it at the target position.
  const without = tasks.filter((t) => t.id !== taskId);
  const moved = tasks.find((t) => t.id === taskId) || { id: taskId };
  const clamped = Math.max(0, Math.min(targetPosition, without.length));
  without.splice(clamped, 0, moved);

  // Step 3: WRITE every task's new position back, one query each.
  // (Simulating the gap between read and write makes the race easy to
  // hit; in production the gap is just normal query latency.)
  for (let i = 0; i < without.length; i++) {
    await pool.query(
      `UPDATE tasks SET column_id = $1, position = $2, updated_at = now() WHERE id = $3`,
      [columnId, i, without[i].id]
    );
  }

  return { id: taskId, columnId, position: clamped };
}

module.exports = { reorderTaskInColumn };
