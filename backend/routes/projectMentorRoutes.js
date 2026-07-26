const express = require('express');
const router = express.Router();
const { generateBlueprint, getBlueprint } = require('../controllers/projectMentorController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/blueprint', protect, generateBlueprint);
router.get('/blueprint', protect, getBlueprint);

module.exports = router;
