const express = require('express');
const router = express.Router();
const {
  getSubjectHoursAnalytics,
  getFacultyWorkloadAnalytics,
  getDepartmentAnalytics,
  getWeeklyScheduleDistribution,
  getAnalyticsSummary,
  getAnalyticsInsights,
  getAISummary
} = require('../controllers/analytics.controller');

// Public test route (no auth required for testing)
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics routes are working!' });
});

// Analytics routes (temporarily without auth for testing)
router.get('/subject-progress', getSubjectHoursAnalytics);
router.get('/faculty-workload', getFacultyWorkloadAnalytics);
router.get('/departments', getDepartmentAnalytics);
router.get('/weekly-distribution', getWeeklyScheduleDistribution);
router.get('/summary', getAnalyticsSummary);
router.get('/insights', getAnalyticsInsights);
router.post('/ai-summary', getAISummary);

module.exports = router;