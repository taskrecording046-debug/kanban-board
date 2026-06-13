// Supporting routes: users (for assigning authors) and labels.

const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT id, name, email FROM users ORDER BY name`);
    res.json({ users: rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load users." });
  }
});

router.get("/labels", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT id, name, color FROM labels ORDER BY name`);
    res.json({ labels: rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load labels." });
  }
});

module.exports = router;
