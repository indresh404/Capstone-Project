const express = require('express');
const { 
  getTimetable, 
  getFacultyTimetable,
  getTimetableStats 
} = require('../controllers/timetable.controller.js');
const verifyToken = require('../middleware/auth.middleware.js');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get timetable with optional filters (division, day)
router.get('/', getTimetable);

// Get timetable stats
router.get('/stats', getTimetableStats);

// Get faculty-specific timetable
router.get('/faculty/:facultyName', getFacultyTimetable);

module.exports = router;