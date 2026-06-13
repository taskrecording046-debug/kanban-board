# Kanban Board — Full-Stack Demo (React + Express + PostgreSQL)

A small but complete task board: drag-free columns of tasks, each with an
author, priority, labels, and comments. This project is the shared
foundation for a series of debugging tutorials — each one introduces a
realistic bug in one layer (frontend, API, or database) and walks through
finding and fixing it.

## Architecture

```
kanban-board/
├── db/
│   ├── schema.sql     # users, columns, tasks, comments, labels, task_labels
│   └── seed.js        # demo data
├── server/            # Express + pg REST API  (port 4000)
│   └── src/
│       ├── index.js
│       ├── db.js
│       └── routes/    # board, tasks, meta (users/labels)
└── client/            # React + Vite SPA       (port 5173)
    └── src/
        ├── App.jsx
        ├── api/client.js
        └── components/  # Column, TaskCard, TaskDetail
```

The Vite dev server proxies `/api/*` to the Express server, so during
development you just run both and open the client.

## Requirements

- Node.js 18+ (Node 20 LTS recommended)
- PostgreSQL 14+ running locally
  - macOS: `brew install postgresql@16 && brew services start postgresql@16`

## Setup

```bash
# 1. Database
createdb kanban

# 2. API server
cd server
npm install
PGUSER=postgres PGDATABASE=kanban npm run seed   # schema + demo data
PGUSER=postgres PGDATABASE=kanban npm start      # http://localhost:4000

# 3. Client (in another terminal)
cd client
npm install
npm run dev                                       # http://localhost:5173
```

Open http://localhost:5173 to see the board.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/board` | Columns with their tasks (author, labels, comment count) |
| GET | `/api/tasks/:id` | One task with its comments |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update title / description / priority |
| POST | `/api/tasks/:id/move` | Move a task to a column + position |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/users` | Users (for the assignee filter) |
| GET | `/api/labels` | Labels |

## Connection settings

`server/src/db.js` reads `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` /
`PGDATABASE` from the environment, defaulting to a local Postgres on the
`kanban` database.
