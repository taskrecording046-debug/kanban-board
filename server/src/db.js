// Shared pg connection pool. Settings come from environment variables
// with local defaults so the server runs out of the box in development.

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "kanban",
});

module.exports = { pool };
