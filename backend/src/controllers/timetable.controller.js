// controllers/timetable.controller.js
const pool = require("../db/db.js");
const { TimetableEngine, loadDataFromDB, saveTimetableToDB } = require("../timetable.js");

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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
    8: '15:45 - 16:45',
  };
  return slotTimes[slotId] || '00:00 - 00:00';
}

// Helper: normalize a raw engine/DB session → frontend shape
function normalizeSession(row, slotKey = 'slot_number') {
  return {
    id:         row.id         ?? null,
    slot:       row[slotKey]   ?? row.slot ?? null,
    time:       getSlotTime(row[slotKey] ?? row.slot),
    subject:    row.subject    ?? row.subject_name  ?? 'FREE PERIOD',
    subject_code: row.subject_code ?? (row.subject ? row.subject.substring(0, 8).toUpperCase() : 'FREE'),
    type:       row.session_type ?? row.type        ?? 'zero',
    faculty:    row.faculty_name ?? row.faculty     ?? '-',
    room:       row.room_name    ?? row.room        ?? '-',
    division:   row.division     ?? '-',
    batch:      row.batch        ?? row.batch_name  ?? '',
    // Preserve IDs
    subject_id: row.subject_id   ?? null,
    faculty_id: row.faculty_id   ?? null,
    room_id:    row.room_id      ?? null,
    batch_id:   row.batch_id     ?? null,
    division_id: row.division_id ?? null,
  };
}

// ============================================================
// CONTROLLER FUNCTIONS
// ============================================================

// GET TIMETABLE
const getTimetable = async (req, res) => {
  try {
    const { division, day } = req.query;

    let query = `
      SELECT 
        t.id,
        t.day,
        t.slot_id          AS slot_number,
        s.id               AS subject_id,
        s.name             AS subject,
        s.code             AS subject_code,
        s.type             AS session_type,
        u.id               AS faculty_id,
        u.name             AS faculty_name,
        r.id               AS room_id,
        r.name             AS room_name,
        d.id               AS division_id,
        d.name             AS division,
        b.id               AS batch_id,
        b.name             AS batch
      FROM timetable t
      LEFT JOIN subjects  s ON t.subject_id  = s.id
      LEFT JOIN users     u ON t.faculty_id  = u.id
      LEFT JOIN rooms     r ON t.room_id     = r.id
      LEFT JOIN divisions d ON t.division_id = d.id
      LEFT JOIN batches   b ON t.batch_id    = b.id
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

    query += `
      ORDER BY
        CASE t.day
          WHEN 'Monday'    THEN 1
          WHEN 'Tuesday'   THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday'  THEN 4
          WHEN 'Friday'    THEN 5
          ELSE 6
        END,
        t.slot_id
    `;

    const result = await pool.query(query, params);

    // Initialize with all days
    const groupedData = {
      Monday: { A: [], B: [] },
      Tuesday: { A: [], B: [] },
      Wednesday: { A: [], B: [] },
      Thursday: { A: [], B: [] },
      Friday: { A: [], B: [] }
    };

    result.rows.forEach(row => {
      if (row.division === 'A' || row.division === 'B') {
        if (!groupedData[row.day]) {
          groupedData[row.day] = { A: [], B: [] };
        }
        groupedData[row.day][row.division].push(normalizeSession(row));
      }
    });

    res.json({ success: true, data: groupedData });

  } catch (error) {
    console.error('Error in getTimetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable', error: error.message });
  }
};

// GET FACULTY TIMETABLE
const getFacultyTimetable = async (req, res) => {
  try {
    const { facultyName } = req.params;

    const query = `
      SELECT 
        t.id,
        t.day,
        t.slot_id          AS slot_number,
        s.id               AS subject_id,
        s.name             AS subject,
        s.code             AS subject_code,
        s.type             AS session_type,
        u.id               AS faculty_id,
        u.name             AS faculty_name,
        r.id               AS room_id,
        r.name             AS room_name,
        d.id               AS division_id,
        d.name             AS division,
        b.id               AS batch_id,
        b.name             AS batch
      FROM timetable t
      LEFT JOIN subjects  s ON t.subject_id  = s.id
      LEFT JOIN users     u ON t.faculty_id  = u.id
      LEFT JOIN rooms     r ON t.room_id     = r.id
      LEFT JOIN divisions d ON t.division_id = d.id
      LEFT JOIN batches   b ON t.batch_id    = b.id
      WHERE u.name = $1
      ORDER BY
        CASE t.day
          WHEN 'Monday'    THEN 1
          WHEN 'Tuesday'   THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday'  THEN 4
          WHEN 'Friday'    THEN 5
          ELSE 6
        END,
        t.slot_id
    `;

    const result = await pool.query(query, [facultyName]);

    const groupedData = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    result.rows.forEach(row => {
      if (!groupedData[row.day]) {
        groupedData[row.day] = [];
      }
      groupedData[row.day].push(normalizeSession(row));
    });

    res.json({ success: true, data: groupedData });

  } catch (error) {
    console.error('Error in getFacultyTimetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty timetable', error: error.message });
  }
};

// GET TIMETABLE STATS
const getTimetableStats = async (req, res) => {
  try {
    const query = `
      SELECT s.type AS session_type, COUNT(*) AS count
      FROM timetable t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE s.type NOT IN ('break', 'zero')
        AND s.type IS NOT NULL
      GROUP BY s.type
    `;

    const result = await pool.query(query);

    const stats = { theory: 0, lab: 0, test: 0, total: 0 };
    result.rows.forEach(row => {
      const n = parseInt(row.count, 10);
      if (row.session_type === 'theory') stats.theory = n;
      if (row.session_type === 'lab')    stats.lab    = n;
      if (row.session_type === 'test')   stats.test   = n;
    });
    stats.total = stats.theory + stats.lab + stats.test;

    res.json({ success: true, data: stats });

  } catch (error) {
    console.error('Error in getTimetableStats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
};

// GET ALL FACULTY
const getAllFaculty = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name FROM users WHERE role = 'faculty' ORDER BY name`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty', error: error.message });
  }
};

// GET ALL SUBJECTS
const getAllSubjects = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             u.id as faculty_id, 
             u.name as default_faculty
      FROM subjects s
      LEFT JOIN faculty_subjects fs ON s.id = fs.subject_id
      LEFT JOIN users u ON fs.faculty_id = u.id
      ORDER BY s.name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects', error: error.message });
  }
};

// GET ALL ROOMS
const getAllRooms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM rooms ORDER BY name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms', error: error.message });
  }
};

// GET ALL DIVISIONS
const getAllDivisions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM divisions ORDER BY name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching divisions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch divisions', error: error.message });
  }
};

// GET ALL BATCHES
const getAllBatches = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, d.name as division_name 
      FROM batches b
      JOIN divisions d ON b.division_id = d.id
      ORDER BY d.name, b.name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch batches', error: error.message });
  }
};

// CHECK AVAILABILITY
const checkAvailability = async (req, res) => {
  try {
    const { faculty_id, room_id, day, slot, session_id } = req.query;
    
    let conflicts = [];

    // Check faculty availability (exclude current session if editing)
    if (faculty_id) {
      let facultyQuery = `
        SELECT COUNT(*) as count, t.id 
        FROM timetable t
        WHERE t.faculty_id = $1 
        AND t.day = $2 
        AND t.slot_id = $3
      `;
      const facultyParams = [faculty_id, day, slot];
      
      if (session_id) {
        facultyQuery += ` AND t.id != $4`;
        facultyParams.push(session_id);
      }
      
      const facultyResult = await pool.query(facultyQuery, facultyParams);
      
      if (parseInt(facultyResult.rows[0].count) > 0) {
        // Get faculty name for better error message
        const facultyInfo = await pool.query('SELECT name FROM users WHERE id = $1', [faculty_id]);
        conflicts.push({
          type: 'faculty',
          message: `${facultyInfo.rows[0]?.name || 'Faculty'} is already booked at this time`
        });
      }
    }

    // Check room availability
    if (room_id) {
      let roomQuery = `
        SELECT COUNT(*) as count 
        FROM timetable t
        WHERE t.room_id = $1 
        AND t.day = $2 
        AND t.slot_id = $3
      `;
      const roomParams = [room_id, day, slot];
      
      if (session_id) {
        roomQuery += ` AND t.id != $4`;
        roomParams.push(session_id);
      }
      
      const roomResult = await pool.query(roomQuery, roomParams);
      
      if (parseInt(roomResult.rows[0].count) > 0) {
        // Get room name for better error message
        const roomInfo = await pool.query('SELECT name FROM rooms WHERE id = $1', [room_id]);
        conflicts.push({
          type: 'room',
          message: `Room ${roomInfo.rows[0]?.name || room_id} is already booked at this time`
        });
      }
    }

    res.json({
      success: true,
      available: conflicts.length === 0,
      conflicts
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, message: 'Failed to check availability', error: error.message });
  }
};

// AUTO GENERATE (Admin only)
const autoGenerate = async (req, res) => {
  try {
    console.log('🤖 Admin triggered auto-generation...');
    
    // Load real data from database
    const data = await loadDataFromDB();
    
    // Create engine with real data
    const engine = new TimetableEngine(data);
    const rawTimetable = engine.generate();

    // Transform to frontend format
    const result = {
      Monday: { A: [], B: [] },
      Tuesday: { A: [], B: [] },
      Wednesday: { A: [], B: [] },
      Thursday: { A: [], B: [] },
      Friday: { A: [], B: [] }
    };

    for (const day of Object.keys(rawTimetable)) {
      if (!result[day]) result[day] = { A: [], B: [] };
      
      for (const div of Object.keys(rawTimetable[day])) {
        result[day][div] = rawTimetable[day][div].map(s => normalizeSession(s, 'slot'));
      }
    }

    console.log('✅ Auto-generation complete with real data');
    res.json({ success: true, data: result });

  } catch (error) {
    console.error('Error in autoGenerate:', error);
    res.status(500).json({ success: false, message: 'Timetable generation failed', error: error.message });
  }
};

// SAVE TIMETABLE (Admin only)
const saveTimetable = async (req, res) => {
  try {
    const { timetable } = req.body;

    if (!timetable || typeof timetable !== 'object') {
      return res.status(400).json({ success: false, message: 'No timetable provided' });
    }

    await saveTimetableToDB(timetable);

    console.log('✅ Admin timetable saved to DB');
    res.json({ success: true, message: 'Timetable saved successfully' });

  } catch (error) {
    console.error('Error in saveTimetable:', error);
    res.status(500).json({ success: false, message: 'Failed to save timetable', error: error.message });
  }
};

// UPDATE SINGLE SESSION
const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { day, slot, division_id, subject_id, faculty_id, room_id, batch_id } = req.body;

    const query = `
      UPDATE timetable 
      SET 
        day = COALESCE($1, day),
        slot_id = COALESCE($2, slot_id),
        division_id = COALESCE($3, division_id),
        subject_id = $4,
        faculty_id = $5,
        room_id = $6,
        batch_id = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const result = await pool.query(query, [
      day, slot, division_id, subject_id, faculty_id, room_id, batch_id, sessionId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, message: 'Session updated successfully', data: result.rows[0] });

  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ success: false, message: 'Failed to update session', error: error.message });
  }
};

// DELETE SESSION
const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(
      'DELETE FROM timetable WHERE id = $1 RETURNING id',
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, message: 'Session deleted successfully' });

  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, message: 'Failed to delete session', error: error.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  // GET endpoints
  getTimetable,
  getFacultyTimetable,
  getTimetableStats,
  getAllFaculty,
  getAllSubjects,
  getAllRooms,
  getAllDivisions,
  getAllBatches,
  
  // Admin endpoints
  autoGenerate,
  saveTimetable,
  updateSession,
  deleteSession,
  
  // Utility
  checkAvailability
};