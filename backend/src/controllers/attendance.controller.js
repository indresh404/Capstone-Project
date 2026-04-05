const pool = require("../db/db.js");

// Test function
const test = (req, res) => {
  res.json({ success: true, message: "Attendance controller works!" });
};

// Mark or update faculty attendance
const markAttendance = async (req, res) => {
  try {
    const { faculty_id, date, status } = req.body;
    
    const validStatuses = ['present', 'absent', 'leave', 'unmarked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const query = `
      INSERT INTO faculty_attendance (faculty_id, date, status, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (faculty_id, date) 
      DO UPDATE SET status = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, [faculty_id, date, status]);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get absent faculty for a specific date
const getAbsentFaculty = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT u.id as faculty_id, u.name, u.college_id, COALESCE(fa.status, 'unmarked') as status
      FROM users u
      LEFT JOIN faculty_attendance fa ON u.id = fa.faculty_id AND fa.date = $1
      WHERE u.role = 'faculty'
      AND (fa.status = 'absent' OR fa.status IS NULL)
    `;
    
    const result = await pool.query(query, [targetDate]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching absent faculty:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance for a date range
const getAttendanceByDateRange = async (req, res) => {
  try {
    const { start_date, end_date, faculty_id } = req.query;
    
    let query = `
      SELECT fa.*, u.name, u.college_id
      FROM faculty_attendance fa
      JOIN users u ON u.id = fa.faculty_id
      WHERE fa.date BETWEEN $1 AND $2
    `;
    const params = [start_date, end_date];
    
    if (faculty_id) {
      query += ` AND fa.faculty_id = $3`;
      params.push(faculty_id);
    }
    
    query += ` ORDER BY fa.date DESC, u.name`;
    
    const result = await pool.query(query, params);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching attendance range:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's attendance summary
const getTodaySummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        COUNT(CASE WHEN fa.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN fa.status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN fa.status = 'leave' THEN 1 END) as leave,
        COUNT(CASE WHEN fa.status = 'unmarked' OR fa.status IS NULL THEN 1 END) as unmarked,
        COUNT(*) as total
      FROM users u
      LEFT JOIN faculty_attendance fa ON u.id = fa.faculty_id AND fa.date = $1
      WHERE u.role = 'faculty'
    `;
    
    const result = await pool.query(query, [today]);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  test,
  markAttendance,
  getAbsentFaculty,
  getAttendanceByDateRange,
  getTodaySummary
};