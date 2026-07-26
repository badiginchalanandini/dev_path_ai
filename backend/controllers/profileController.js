const ProfileModel = require('../models/profileModel');

exports.saveProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileId = await ProfileModel.upsertProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Student profile details saved successfully.',
      profileId
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await ProfileModel.findByUserId(userId);

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};
