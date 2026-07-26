const express = require('express');
const router = express.Router();
const { saveProfile, getProfile } = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', saveProfile);
router.get('/', getProfile);

module.exports = router;
