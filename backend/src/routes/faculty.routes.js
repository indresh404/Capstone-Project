// backend/src/routes/faculty.routes.js

const express    = require("express");
const router     = express.Router();
const db         = require("../db/db");
const verifyToken = require("../middleware/auth.middleware");
const allowRoles  = require("../middleware/role.middleware");

const adminOnly = allowRoles(["ADMIN"]);

const rows = (r) => r.rows ?? [];

// ── GET /api/faculty/:id/subjects ─────────────────────────────────────────────
router.get("/:id/subjects", verifyToken, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT s.* FROM subjects s
       JOIN faculty_subjects fs ON fs.subject_id = s.id
       WHERE fs.faculty_id = $1 ORDER BY s.id`,
      [req.params.id]
    );
    res.json({ success: true, data: rows(r) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── PUT /api/faculty/:id/subjects ─────────────────────────────────────────────
router.put("/:id/subjects", verifyToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { subject_ids = [] } = req.body;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM faculty_subjects WHERE faculty_id = $1", [id]);
    if (subject_ids.length > 0) {
      const vals = subject_ids.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ${vals}`,
        [id, ...subject_ids]
      );
    }
    await client.query("COMMIT");
    const r = await client.query(
      `SELECT s.* FROM subjects s
       JOIN faculty_subjects fs ON fs.subject_id = s.id
       WHERE fs.faculty_id = $1 ORDER BY s.id`,
      [id]
    );
    res.json({ success: true, data: rows(r), message: "Subjects updated" });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ success: false, message: e.message });
  } finally {
    client.release();
  }
});

// ── GET /api/faculty/attendance?date=YYYY-MM-DD ───────────────────────────────
router.get("/attendance", verifyToken, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const r = await db.query(
      `SELECT fa.faculty_id, fa.status, fa.date,
              u.name, u.college_id, u.email, u.phone
       FROM faculty_attendance fa
       JOIN users u ON u.id = fa.faculty_id
       WHERE fa.date = $1
       ORDER BY u.name`,
      [date]
    );
    res.json({ success: true, data: rows(r), date });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── PUT /api/faculty/attendance ───────────────────────────────────────────────
// Body: { date: "YYYY-MM-DD", records: [{ faculty_id, status }] }
router.put("/attendance", verifyToken, adminOnly, async (req, res) => {
  const { date, records = [] } = req.body;
  if (!date || !records.length)
    return res.status(400).json({ success: false, message: "date and records required" });

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const { faculty_id, status } of records) {
      await client.query(
        `INSERT INTO faculty_attendance (faculty_id, date, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (faculty_id, date)
         DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()`,
        [faculty_id, date, status]
      );
    }
    await client.query("COMMIT");
    res.json({ success: true, message: `Attendance saved for ${records.length} faculty` });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ success: false, message: e.message });
  } finally {
    client.release();
  }
});

module.exports = router;