const db = require("../db/db.js");

// GET TIMETABLE
exports.getTimetable = (req, res) => {
  try {
    const { division, day } = req.query;
    
    let query = `
      SELECT 
        id, day, slot_number, 
        DATE_FORMAT(start_time, '%H:%i') as start_time,
        DATE_FORMAT(end_time, '%H:%i') as end_time,
        subject, session_type, faculty_name, room_name, division, batch
      FROM timetable
      WHERE 1=1
    `;
    
    const params = [];
    
    if (division) {
      query += ' AND division = ?';
      params.push(division);
    }
    
    if (day) {
      query += ' AND day = ?';
      params.push(day);
    }
    
    query += ' ORDER BY day, slot_number';
    
    db.query(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching timetable:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch timetable'
        });
      }
      
      // Group by day
      const groupedData = {};
      rows.forEach(row => {
        if (!groupedData[row.day]) {
          groupedData[row.day] = {
            A: [],
            B: []
          };
        }
        
        // Push to appropriate division
        if (row.division === 'A' || row.division === 'B') {
          groupedData[row.day][row.division].push({
            id: row.id,
            slot: row.slot_number,
            time: `${row.start_time} - ${row.end_time}`,
            subject: row.subject,
            type: row.session_type,
            faculty: row.faculty_name,
            room: row.room_name,
            division: row.division,
            batch: row.batch
          });
        }
      });
      
      res.json({
        success: true,
        data: groupedData
      });
    });
  } catch (error) {
    console.error('Error in getTimetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable'
    });
  }
};

// GET FACULTY TIMETABLE
exports.getFacultyTimetable = (req, res) => {
  try {
    const { facultyName } = req.params;
    
    const query = `
      SELECT 
        id, day, slot_number,
        DATE_FORMAT(start_time, '%H:%i') as start_time,
        DATE_FORMAT(end_time, '%H:%i') as end_time,
        subject, session_type, faculty_name, room_name, division, batch
      FROM timetable
      WHERE faculty_name = ?
      ORDER BY 
        FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'),
        slot_number
    `;
    
    db.query(query, [facultyName], (err, rows) => {
      if (err) {
        console.error('Error fetching faculty timetable:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch faculty timetable'
        });
      }
      
      // Group by day
      const groupedData = {};
      rows.forEach(row => {
        if (!groupedData[row.day]) {
          groupedData[row.day] = [];
        }
        groupedData[row.day].push({
          id: row.id,
          slot: row.slot_number,
          time: `${row.start_time} - ${row.end_time}`,
          subject: row.subject,
          type: row.session_type,
          faculty: row.faculty_name,
          room: row.room_name,
          division: row.division,
          batch: row.batch
        });
      });
      
      res.json({
        success: true,
        data: groupedData
      });
    });
  } catch (error) {
    console.error('Error in getFacultyTimetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty timetable'
    });
  }
};

// GET TIMETABLE STATS
exports.getTimetableStats = (req, res) => {
  try {
    const query = `
      SELECT 
        session_type,
        COUNT(*) as count
      FROM timetable
      WHERE session_type NOT IN ('break', 'zero')
      GROUP BY session_type
    `;
    
    db.query(query, (err, rows) => {
      if (err) {
        console.error('Error fetching stats:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch stats'
        });
      }
      
      const stats = {
        theory: 0,
        lab: 0,
        test: 0,
        total: 0
      };
      
      rows.forEach(row => {
        stats[row.session_type] = row.count;
        stats.total += row.count;
      });
      
      res.json({
        success: true,
        data: stats
      });
    });
  } catch (error) {
    console.error('Error in getTimetableStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};