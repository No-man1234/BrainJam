// routes/create_contest.js
const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken, isAdmin } = require("../middleware/auth");

// ✅ Route to get all problems
router.get("/problems", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [problems] = await db.execute(`
      SELECT id, title, difficulty
      FROM problems
      WHERE is_public = 1
      ORDER BY created_at DESC
    `);
    res.json({ success: true, problems });
    // console.log('✅Fetched problems:', problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ success: false, error: "Failed to fetch problems" });
  }
});

// Create new contest
// Create new contest
router.post("/create-contest", async (req, res) => {
  const { name, start_time, duration_hours, problem_ids } = req.body;
  // console.log('✅req.body:', req.body);

  if (!name || !start_time || !duration_hours || !Array.isArray(problem_ids)) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Insert contest
    const [result] = await conn.execute(
      `
            INSERT INTO admin_contests (name, start_time, duration_hours)
            VALUES (?, ?, ?)
        `,
      [name, start_time, duration_hours]
    );

    const contestId = result.insertId;

    // Insert contest problems
    for (let problemId of problem_ids) {
      await conn.execute(
        `
                INSERT INTO admin_contest_problems (contest_id, problem_id)
                VALUES (?, ?)
            `,
        [contestId, problemId]
      );
    }

    await conn.commit();
    res.json({ success: true, contest_id: contestId });
  } catch (err) {
    await conn.rollback();
    console.error("Error creating contest:", err); // ← Look at this error
    res.status(500).json({ success: false, error: "Failed to create contest" });
  } finally {
    conn.release();
  }
});

// Fetch all contests
router.get("/fetch-contests", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM admin_contests ORDER BY start_time DESC"
    );
    res.json({ contests: rows });
    console.log("✅Fetched contests:", rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

// Fetch contest details including problems
router.get("/:id", async (req, res) => {
  const contestId = req.params.id;
  try {
    const [contestRows] = await db.execute(
      "SELECT * FROM admin_contests WHERE id = ?",
      [contestId]
    );
    if (!contestRows.length)
      return res.status(404).json({ error: "Contest not found" });

    const [problemRows] = await db.execute(
      `
      SELECT p.id, p.title, p.slug, p.difficulty
      FROM admin_contest_problems acp
      JOIN problems p ON acp.problem_id = p.id
      WHERE acp.contest_id = ?`,
      [contestId]
    );

    res.json({ contest: contestRows[0], problems: problemRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contest details" });
  }
});

// Delete contest
router.delete("/:id", async (req, res) => {
  const contestId = req.params.id;
  try {
    await db.execute(
      "DELETE FROM admin_contest_problems WHERE contest_id = ?",
      [contestId]
    );
    await db.execute("DELETE FROM admin_contests WHERE id = ?", [contestId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete contest" });
  }
});

module.exports = router;
