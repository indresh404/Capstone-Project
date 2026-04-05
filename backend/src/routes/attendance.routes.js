const express = require('express');
const router = express.Router();

// Fix the import path - notice the correct relative path
const verifyToken = require('../middleware/auth.middleware');
const attendanceController = require('../controllers/attendance.controller');

// Test route (no auth required - good for checking if controller works)
router.get('/test', attendanceController.test);

// Protected routes with auth
router.get('/absent', verifyToken, attendanceController.getAbsentFaculty);
router.get('/summary', verifyToken, attendanceController.getTodaySummary);
router.get('/range', verifyToken, attendanceController.getAttendanceByDateRange);
router.post('/mark', verifyToken, attendanceController.markAttendance);

module.exports = router;