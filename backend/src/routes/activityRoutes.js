const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

// @desc    Get all activity logs
// @route   GET /api/activity-logs
// @access  Private Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const logs = await ActivityLog.find({}).populate('user', 'name role').sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
