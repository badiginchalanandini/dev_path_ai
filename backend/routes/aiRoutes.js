const express = require('express');
const router = express.Router();
const { generateAllInsights, getInsights, generateProjectBlueprint, streamCareerInsights } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');

router.post('/generate-all', protect, rateLimiter, generateAllInsights);
router.get('/insights', protect, getInsights);
router.post('/project-blueprint', protect, generateProjectBlueprint);

// Streaming SSE route
router.get('/stream-insights', protect, rateLimiter, streamCareerInsights);

module.exports = router;
