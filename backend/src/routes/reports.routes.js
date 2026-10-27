const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/overview', reportsController.getDashboardOverview);
router.get('/analytics', reportsController.getAnalyticsReport);
router.get('/export/csv', reportsController.exportTransactionsCSV);

module.exports = router;
