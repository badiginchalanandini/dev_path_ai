const HistoryModel = require('../models/historyModel');

exports.listHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search = '', filter = '', page = 1, limit = 5 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const totalItems = await HistoryModel.countHistory(userId, search, filter);
    const items = await HistoryModel.getHistory(userId, search, filter, limit, offset);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await HistoryModel.toggleFavorite(userId, id);
    res.status(200).json({
      success: true,
      message: 'Favorite status updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await HistoryModel.deleteEntry(userId, id);
    res.status(200).json({
      success: true,
      message: 'History record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
