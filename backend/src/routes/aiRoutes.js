const express = require('express');
const { generateDescription, smartReorder, chatAssistant } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/generate-description', protect, generateDescription);
router.get('/smart-reorder', protect, smartReorder);
router.post('/chat', protect, chatAssistant);

module.exports = router;
