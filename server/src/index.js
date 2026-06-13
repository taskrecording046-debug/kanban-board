// Kanban API server entry point.

const express = require("express");
const cors = require("cors");

const boardRoutes = require("./routes/board");
const taskRoutes = require("./routes/tasks");
const metaRoutes = require("./routes/meta");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Tiny request logger so endpoint timings are visible during development.
app.use((req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started} ms)`);
  });
  next();
});

app.use("/api", boardRoutes);
app.use("/api", taskRoutes);
app.use("/api", metaRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Kanban API listening on http://localhost:${PORT}`);
});
