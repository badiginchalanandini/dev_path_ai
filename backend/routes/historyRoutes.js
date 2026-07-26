const express = require('express');
const router = express.Router();
const { listHistory, toggleFavorite, deleteHistory } = require('../controllers/historyController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, listHistory);
router.put('/:id/favorite', protect, toggleFavorite);
router.delete('/:id', protect, deleteHistory);

module.exports = router;
