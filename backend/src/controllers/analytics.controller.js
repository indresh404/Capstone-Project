const pool = require('../db/db');

// Get subject-wise hours completion
const getSubjectHoursAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.code,
        s.name,
        s.type,
        s.lectures_per_week AS required_hours,
        COUNT(t.id) FILTER (WHERE t.status = 'scheduled' OR t.status = 'completed') AS scheduled_hours,
        COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed_hours,
        ROUND(
          (COUNT(t.id) FILTER (WHERE t.status = 'scheduled' OR t.status = 'completed')::DECIMAL / NULLIF(s.lectures_per_week, 0)) * 100, 
          2
        ) AS completion_percentage
      FROM subjects s
      LEFT JOIN timetable t ON t.subject_id = s.id
      GROUP BY s.id, s.code, s.name, s.type, s.lectures_per_week
      ORDER BY s.name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching subject hours analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject hours analytics',
      error: error.message
    });
  }
};

// Get faculty workload analytics
const getFacultyWorkloadAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.college_id,
        (SELECT COUNT(*) FROM faculty_subjects fs WHERE fs.faculty_id = u.id) as subjects_count,
        (SELECT COUNT(*) FROM timetable t WHERE t.faculty_id = u.id) as scheduled_hours,
        20 as max_hours
      FROM users u
      WHERE u.role = 'faculty'
      ORDER BY u.name
    `;
    
    const result = await pool.query(query);
    
    const facultyWithPercentage = result.rows.map(faculty => ({
      ...faculty,
      workload_percentage: Math.min(Math.round((faculty.scheduled_hours / faculty.max_hours) * 100), 100),
      status: faculty.scheduled_hours >= faculty.max_hours ? 'overloaded' : 
              faculty.scheduled_hours >= faculty.max_hours * 0.8 ? 'high' : 'normal'
    }));
    
    res.json({
      success: true,
      data: facultyWithPercentage
    });
  } catch (error) {
    console.error('Error fetching faculty workload analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty workload analytics',
      error: error.message
    });
  }
};

// Get department-wise analytics
const getDepartmentAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id,
        d.name as department,
        COUNT(DISTINCT s.id) as total_subjects,
        COUNT(DISTINCT fs.faculty_id) as faculty_count,
        COUNT(DISTINCT b.id) as batches_count,
        COALESCE(COUNT(t.id), 0) as scheduled_classes,
        ROUND(
          COUNT(DISTINCT t.subject_id)::DECIMAL / NULLIF(COUNT(DISTINCT s.id), 0) * 100,
          2
        ) as coverage_percentage
      FROM divisions d
      LEFT JOIN batches b ON b.division_id = d.id
      LEFT JOIN timetable t ON t.division_id = d.id
      LEFT JOIN subjects s ON s.id = t.subject_id
      LEFT JOIN faculty_subjects fs ON fs.subject_id = s.id
      GROUP BY d.id, d.name
      ORDER BY d.name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department analytics',
      error: error.message
    });
  }
};

// Get weekly schedule distribution
const getWeeklyScheduleDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        day,
        COUNT(*) as total_classes,
        COUNT(DISTINCT subject_id) as unique_subjects,
        COUNT(DISTINCT faculty_id) as faculty_involved
      FROM timetable
      GROUP BY day
      ORDER BY 
        CASE day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching weekly schedule distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly schedule distribution',
      error: error.message
    });
  }
};

// Get overall analytics summary
const getAnalyticsSummary = async (req, res) => {
  try {
    // Get total faculty count
    const facultyCountResult = await pool.query(`
      SELECT COUNT(*) as total_faculty FROM users WHERE role = 'faculty'
    `);

    // Get average faculty load
    const avgLoadResult = await pool.query(`
      SELECT 
        ROUND(AVG(COALESCE(fs_count.hours_scheduled, 0))::DECIMAL, 2) as avg_load
      FROM users u
      LEFT JOIN (
        SELECT faculty_id, COUNT(*) as hours_scheduled
        FROM timetable
        GROUP BY faculty_id
      ) fs_count ON fs_count.faculty_id = u.id
      WHERE u.role = 'faculty'
    `);
    
    // Get subject coverage
    const coverageResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_subjects,
        COUNT(DISTINCT t.subject_id) as covered_subjects,
        ROUND(
          COUNT(DISTINCT t.subject_id)::DECIMAL / NULLIF(COUNT(DISTINCT s.id), 0) * 100,
          2
        ) as coverage_percentage
      FROM subjects s
      LEFT JOIN timetable t ON t.subject_id = s.id
    `);
    
    // Get schedule conflicts
    const conflictsResult = await pool.query(`
      SELECT COUNT(*) as conflict_count
      FROM timetable t1
      WHERE EXISTS (
        SELECT 1 FROM timetable t2
        WHERE t2.id != t1.id
          AND t2.day = t1.day
          AND t2.slot_id = t1.slot_id
          AND (t2.room_id = t1.room_id OR t2.faculty_id = t1.faculty_id)
      )
    `);
    
    // Get overloaded faculty count
    const overloadedResult = await pool.query(`
      SELECT COUNT(*) as overloaded_count
      FROM (
        SELECT u.id, COUNT(t.id) as scheduled_hours
        FROM users u
        LEFT JOIN timetable t ON t.faculty_id = u.id
        WHERE u.role = 'faculty'
        GROUP BY u.id
        HAVING COUNT(t.id) >= 20
      ) overloaded
    `);
    
    res.json({
      success: true,
      data: {
        total_faculty: parseInt(facultyCountResult.rows[0]?.total_faculty || 0),
        avg_faculty_load: parseFloat(avgLoadResult.rows[0]?.avg_load || 0),
        subject_coverage: parseFloat(coverageResult.rows[0]?.coverage_percentage || 0),
        covered_subjects: coverageResult.rows[0]?.covered_subjects || 0,
        total_subjects: coverageResult.rows[0]?.total_subjects || 0,
        schedule_conflicts: parseInt(conflictsResult.rows[0]?.conflict_count || 0),
        overloaded_faculty: parseInt(overloadedResult.rows[0]?.overloaded_count || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary',
      error: error.message
    });
  }
};

// Get insights
const getAnalyticsInsights = async (req, res) => {
  try {
    const insights = [];
    
    // Check overloaded faculty
    const overloadedFaculty = await pool.query(`
      SELECT u.name, COUNT(t.id) as scheduled_hours
      FROM users u
      LEFT JOIN timetable t ON t.faculty_id = u.id
      WHERE u.role = 'faculty'
      GROUP BY u.id, u.name
      HAVING COUNT(t.id) >= 20
      ORDER BY scheduled_hours DESC
      LIMIT 5
    `);
    
    overloadedFaculty.rows.forEach(faculty => {
      insights.push({
        type: 'warning',
        message: `${faculty.name} is at ${faculty.scheduled_hours}/20 hours workload`,
        department: 'Faculty'
      });
    });
    
    // Check uncovered subjects
    const uncoveredSubjects = await pool.query(`
      SELECT s.name, s.code
      FROM subjects s
      LEFT JOIN timetable t ON t.subject_id = s.id
      WHERE t.id IS NULL
      LIMIT 5
    `);
    
    if (uncoveredSubjects.rows.length > 0) {
      insights.push({
        type: 'warning',
        message: `${uncoveredSubjects.rows.length} subject(s) have no scheduled classes`,
        department: 'Subjects'
      });
    }
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching analytics insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics insights',
      error: error.message
    });
  }
};

module.exports = {
  getSubjectHoursAnalytics,
  getFacultyWorkloadAnalytics,
  getDepartmentAnalytics,
  getWeeklyScheduleDistribution,
  getAnalyticsSummary,
  getAnalyticsInsights
};