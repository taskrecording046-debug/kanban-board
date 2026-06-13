// Seed the Kanban board with realistic demo data.
// Run with: npm run seed   (from the server/ directory)

const { pool } = require("../server/src/db");

const USERS = [
  { name: "Ada Lovelace", email: "ada@example.com" },
  { name: "Alan Turing", email: "alan@example.com" },
  { name: "Grace Hopper", email: "grace@example.com" },
  { name: "Linus Torvalds", email: "linus@example.com" },
];

const COLUMNS = [
  { name: "Backlog", position: 0 },
  { name: "To Do", position: 1 },
  { name: "In Progress", position: 2 },
  { name: "Done", position: 3 },
];

const LABELS = [
  { name: "bug", color: "#b91c1c" },
  { name: "feature", color: "#2563eb" },
  { name: "chore", color: "#475569" },
  { name: "urgent", color: "#b45309" },
];

const TASK_TITLES = [
  "Set up CI pipeline", "Fix login redirect loop", "Design empty states",
  "Add rate limiting to API", "Write onboarding docs", "Migrate to Postgres 16",
  "Refactor auth middleware", "Add dark mode toggle", "Optimize image uploads",
  "Investigate memory leak", "Add keyboard shortcuts", "Improve error messages",
  "Set up error tracking", "Add CSV export", "Cache dashboard queries",
  "Audit accessibility", "Add pagination to lists", "Fix flaky tests",
];

const PRIORITIES = ["low", "medium", "high"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const fs = require("fs");
  const path = require("path");
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Schema created.");

  const userIds = [];
  for (const u of USERS) {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
      [u.name, u.email]
    );
    userIds.push(rows[0].id);
  }
  console.log(`Inserted ${userIds.length} users.`);

  const columnIds = [];
  for (const c of COLUMNS) {
    const { rows } = await pool.query(
      "INSERT INTO columns (name, position) VALUES ($1, $2) RETURNING id",
      [c.name, c.position]
    );
    columnIds.push(rows[0].id);
  }
  console.log(`Inserted ${columnIds.length} columns.`);

  const labelIds = [];
  for (const l of LABELS) {
    const { rows } = await pool.query(
      "INSERT INTO labels (name, color) VALUES ($1, $2) RETURNING id",
      [l.name, l.color]
    );
    labelIds.push(rows[0].id);
  }
  console.log(`Inserted ${labelIds.length} labels.`);

  // Tasks: distribute across columns, each with a position within its column.
  let taskCount = 0;
  const taskIds = [];
  const perColumnPosition = {};
  for (const title of TASK_TITLES) {
    const columnId = pick(columnIds);
    perColumnPosition[columnId] = (perColumnPosition[columnId] ?? -1) + 1;
    const { rows } = await pool.query(
      `INSERT INTO tasks (column_id, author_id, title, description, position, priority)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        columnId,
        pick(userIds),
        title,
        `Description for: ${title}.`,
        perColumnPosition[columnId],
        pick(PRIORITIES),
      ]
    );
    taskIds.push(rows[0].id);
    taskCount++;
  }
  console.log(`Inserted ${taskCount} tasks.`);

  // A few labels per task.
  for (const taskId of taskIds) {
    const n = Math.floor(Math.random() * 3);
    const chosen = new Set();
    for (let i = 0; i < n; i++) chosen.add(pick(labelIds));
    for (const labelId of chosen) {
      await pool.query(
        "INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [taskId, labelId]
      );
    }
  }

  // A few comments per task.
  let commentCount = 0;
  const COMMENT_BODIES = [
    "Started looking into this.", "Blocked on review.", "Almost done.",
    "Can someone take a look?", "Reproduced locally.", "Pushed a fix.",
  ];
  for (const taskId of taskIds) {
    const n = Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      await pool.query(
        "INSERT INTO comments (task_id, author_id, body) VALUES ($1, $2, $3)",
        [taskId, pick(userIds), pick(COMMENT_BODIES)]
      );
      commentCount++;
    }
  }
  console.log(`Inserted ${commentCount} comments.`);

  await pool.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
