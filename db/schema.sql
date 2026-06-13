-- Kanban board schema.
-- A board has columns; columns hold tasks; tasks have an author, comments,
-- and labels. This is the shared data model for all the tutorials.

DROP TABLE IF EXISTS task_labels;
DROP TABLE IF EXISTS labels;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS columns;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE columns (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  column_id   INTEGER NOT NULL REFERENCES columns(id),
  author_id   INTEGER NOT NULL REFERENCES users(id),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  -- `position` orders tasks within a column (lower = higher up).
  position    INTEGER NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'medium', -- low | medium | high
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  task_id    INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id  INTEGER NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE labels (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE task_labels (
  task_id  INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_task_labels_task_id ON task_labels(task_id);
