// routes/timetable.routes.js
const express = require('express');
const { 
  getTimetable, 
  getFacultyTimetable,
  getTimetableStats,
  getAllFaculty,
  getAllSubjects,
  getAllRooms,
  getAllDivisions,
  getAllBatches,
  checkAvailability,
  autoGenerate,
  saveTimetable,
  updateSession,
  deleteSession
} = require('../controllers/timetable.controller.js');
const verifyToken = require('../middleware/auth.middleware.js');
const allowRoles = require('../middleware/role.middleware.js');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ============================================================
// PUBLIC/VIEW ROUTES (for both faculty and admin)
// ============================================================

// Get timetable with optional filters (division, day)
router.get('/', allowRoles(['ADMIN', 'FACULTY']), getTimetable);

// Get timetable stats
router.get('/stats', allowRoles(['ADMIN', 'FACULTY']), getTimetableStats);

// Get faculty-specific timetable
router.get('/faculty/:facultyName', allowRoles(['ADMIN', 'FACULTY']), getFacultyTimetable);

// Get all faculty (for dropdowns)
router.get('/faculty/all', allowRoles(['ADMIN', 'FACULTY']), getAllFaculty);

// Get all subjects (for dropdowns)
router.get('/subjects/all', allowRoles(['ADMIN', 'FACULTY']), getAllSubjects);

// Get all rooms (for dropdowns)
router.get('/rooms/all', allowRoles(['ADMIN', 'FACULTY']), getAllRooms);

// Get all divisions (for dropdowns)
router.get('/divisions/all', allowRoles(['ADMIN', 'FACULTY']), getAllDivisions);

// Get all batches (for dropdowns)
router.get('/batches/all', allowRoles(['ADMIN', 'FACULTY']), getAllBatches);

// Check availability (for clash detection)
router.get('/check-availability', allowRoles(['ADMIN', 'FACULTY']), checkAvailability);

// ============================================================
// ADMIN-ONLY ROUTES (for timetable management)
// ============================================================

// Generate new timetable (Auto Generate)
router.post('/generate', allowRoles(['ADMIN']), autoGenerate);

// Save entire timetable to database
router.put('/save', allowRoles(['ADMIN']), saveTimetable);

// Update single session (for drag & drop or edit)
router.put('/session/:sessionId', allowRoles(['ADMIN']), updateSession);

// Delete single session
router.delete('/session/:sessionId', allowRoles(['ADMIN']), deleteSession);

module.exports = router;