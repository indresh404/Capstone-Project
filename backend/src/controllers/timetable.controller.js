// timetableController.js
const pool = require("../db/db.js");

// GET TIMETABLE
exports.getTimetable = async (req, res) => {
  try {
    const { division, day } = req.query;
    
    let query = `
      SELECT 
        t.id, 
        t.day, 
        t.slot_id as slot_number,
        s.name as subject,
        s.type as session_type,
        u.name as faculty_name,
        r.name as room_name,
        d.name as division,
        b.name as batch
      FROM timetable t
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.faculty_id = u.id
      LEFT JOIN rooms r ON t.room_id = r.id
      LEFT JOIN divisions d ON t.division_id = d.id
      LEFT JOIN batches b ON t.batch_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (division) {
      query += ` AND d.name = $${paramIndex}`;
      params.push(division);
      paramIndex++;
    }
    
    if (day) {
      query += ` AND t.day = $${paramIndex}`;
      params.push(day);
      paramIndex++;
    }
    
    query += ` ORDER BY 
        CASE t.day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          ELSE 6
        END,
        t.slot_id`;
    
    const result = await pool.query(query, params);
    const rows = result.rows;
    
    // Group by day
    const groupedData = {};
    rows.forEach(row => {
      if (!groupedData[row.day]) {
        groupedData[row.day] = {
          A: [],
          B: []
        };
      }
      
      // Push to appropriate division (only A and B as per your requirement)
      if (row.division === 'A' || row.division === 'B') {
        // Get slot time based on slot_id
        const slotTime = getSlotTime(row.slot_number);
        
        groupedData[row.day][row.division].push({
          id: row.id,
          slot: row.slot_number,
          time: slotTime,
          subject: row.subject || 'FREE PERIOD',
          type: row.session_type || 'zero',
          faculty: row.faculty_name || '-',
          room: row.room_name || '-',
          division: row.division,
          batch: row.batch || 'Full Division'
        });
      }
    });
    
    res.json({
      success: true,
      data: groupedData
    });
    
  } catch (error) {
    console.error('Error in getTimetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable',
      error: error.message
    });
  }
};

// GET FACULTY TIMETABLE
exports.getFacultyTimetable = async (req, res) => {
  try {
    const { facultyName } = req.params;
    
    const query = `
      SELECT 
        t.id, 
        t.day, 
        t.slot_id as slot_number,
        s.name as subject,
        s.type as session_type,
        u.name as faculty_name,
        r.name as room_name,
        d.name as division,
        b.name as batch
      FROM timetable t
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.faculty_id = u.id
      LEFT JOIN rooms r ON t.room_id = r.id
      LEFT JOIN divisions d ON t.division_id = d.id
      LEFT JOIN batches b ON t.batch_id = b.id
      WHERE u.name = $1
      ORDER BY 
        CASE t.day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          ELSE 6
        END,
        t.slot_id
    `;
    
    const result = await pool.query(query, [facultyName]);
    const rows = result.rows;
    
    // Group by day
    const groupedData = {};
    rows.forEach(row => {
      if (!groupedData[row.day]) {
        groupedData[row.day] = [];
      }
      
      const slotTime = getSlotTime(row.slot_number);
      
      groupedData[row.day].push({
        id: row.id,
        slot: row.slot_number,
        time: slotTime,
        subject: row.subject || 'FREE PERIOD',
        type: row.session_type || 'zero',
        faculty: row.faculty_name,
        room: row.room_name || '-',
        division: row.division,
        batch: row.batch || 'Full Division'
      });
    });
    
    res.json({
      success: true,
      data: groupedData
    });
    
  } catch (error) {
    console.error('Error in getFacultyTimetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty timetable',
      error: error.message
    });
  }
};

// GET TIMETABLE STATS
exports.getTimetableStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.type as session_type,
        COUNT(*) as count
      FROM timetable t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE s.type NOT IN ('break', 'zero') OR s.type IS NULL
      GROUP BY s.type
    `;
    
    const result = await pool.query(query);
    const rows = result.rows;
    
    const stats = {
      theory: 0,
      lab: 0,
      test: 0,
      total: 0
    };
    
    rows.forEach(row => {
      if (row.session_type === 'theory') stats.theory = parseInt(row.count);
      if (row.session_type === 'lab') stats.lab = parseInt(row.count);
      if (row.session_type === 'test') stats.test = parseInt(row.count);
      stats.total += parseInt(row.count);
    });
    
    // Get total count including free periods
    const totalQuery = await pool.query('SELECT COUNT(*) as total FROM timetable');
    stats.total = parseInt(totalQuery.rows[0].total);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error in getTimetableStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

// GET ALL FACULTY (helper for dropdown)
exports.getAllFaculty = async (req, res) => {
  try {
    const query = `
      SELECT id, name 
      FROM users 
      WHERE role = 'faculty' 
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message
    });
  }
};

// Helper function to get slot time based on slot_id
function getSlotTime(slotId) {
  const slotTimes = {
    1: '09:15 - 10:15',
    2: '10:15 - 11:15',
    3: '11:15 - 12:15',
    4: '12:15 - 12:45',
    5: '12:45 - 13:45',
    6: '13:45 - 14:45',
    7: '14:45 - 15:45',
    8: '15:45 - 16:45'
  };
  
  return slotTimes[slotId] || '00:00 - 00:00';
}