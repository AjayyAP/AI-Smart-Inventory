const express = require('express');
const { getDashboardSummary } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/dashboard-summary').get(protect, getDashboardSummary);

module.exports = router;
