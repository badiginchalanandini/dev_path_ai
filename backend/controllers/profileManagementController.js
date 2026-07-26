const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const ProfileModel = require('../models/profileModel');
const { validateEmail, validateStrongPassword } = require('../utils/validators');

exports.updateDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, profile_pic, skills, interests, career_goal } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required fields.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // 1. Update Core User Details
    await UserModel.updateProfile(userId, name, email, profile_pic || null);

    // 2. Synchronize Career/Student profile fields (Skills, Interests, Career Goal) if profile exists
    const profile = await ProfileModel.findByUserId(userId);
    if (profile) {
      profile.student_name = name;
      profile.current_skills = skills || profile.current_skills;
      profile.interested_skills = interests || profile.interested_skills;
      profile.career_goal = career_goal || profile.career_goal;
      await ProfileModel.upsertProfile(userId, profile);
    }

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both old and new passwords.' });
    }

    const user = await UserModel.findById(userId);
    const dbUser = await UserModel.findByEmail(user.email);

    // Verify Old Password
    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect old password.' });
    }

    // Validate New Password Strength
    const passValidation = validateStrongPassword(newPassword);
    if (!passValidation.isValid) {
      return res.status(400).json({ success: false, message: passValidation.message });
    }

    // Hash and Update Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.updatePassword(user.email, hashedPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete user from MySQL (Cascades to all tables: sessions, plans, history)
    await UserModel.deleteUserAccount(userId);

    // Clear authentication cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};
