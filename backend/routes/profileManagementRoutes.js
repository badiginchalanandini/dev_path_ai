const express = require('express');
const router = express.Router();
const { updateDetails, updatePassword, deleteAccount } = require('../controllers/profileManagementController');
const { protect } = require('../middlewares/authMiddleware');

router.put('/details', protect, updateDetails);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;
