const express = require("express");
const router = express.Router();
const db = require("../db/db");
const verifyToken = require("../middleware/auth.middleware");

// Get all subjects with their assigned faculty
router.get("/subjects", verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id, s.code, s.name, s.type, s.lectures_per_week,
        u.name as faculty_name, u.college_id as faculty_college_id
      FROM subjects s
      LEFT JOIN faculty_subjects fs ON s.id = fs.subject_id
      LEFT JOIN users u ON fs.faculty_id = u.id
      ORDER BY s.code ASC
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all rooms
router.get("/rooms", verifyToken, async (req, res) => {
  try {
    const query = `SELECT * FROM rooms ORDER BY name ASC`;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all divisions with their batches
router.get("/divisions", verifyToken, async (req, res) => {
  try {
    // Fetch all divisions
    const divResult = await db.query(`SELECT * FROM divisions ORDER BY name ASC`);
    const divisions = divResult.rows;

    // Fetch all batches
    const batchResult = await db.query(`SELECT * FROM batches ORDER BY name ASC`);
    const batches = batchResult.rows;

    // Group batches by division
    const data = divisions.map(div => ({
      ...div,
      batches: batches.filter(b => b.division_id === div.id)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching divisions/batches:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;