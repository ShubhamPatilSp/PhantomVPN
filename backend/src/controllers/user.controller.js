const User = require('../models/User.model');
const { Connection, Notification, Referral } = require('../models/index');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// PUT /api/user/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

// POST /api/user/avatar
exports.updateAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );
    res.json({ success: true, message: 'Avatar updated.', avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update avatar.' });
  }
};

// DELETE /api/user/account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user.password) {
      const match = await user.comparePassword(password);
      if (!match) {
        return res.status(400).json({ success: false, message: 'Incorrect password.' });
      }
    }

    await User.findByIdAndDelete(req.user._id);
    await Connection.deleteMany({ userId: req.user._id });
    await Notification.deleteMany({ userId: req.user._id });

    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
};

// GET /api/user/devices
exports.getDevices = async (req, res) => {
  try {
    res.json({ success: true, devices: req.user.devices || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch devices.' });
  }
};

// DELETE /api/user/devices/:id
exports.revokeDevice = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { devices: { deviceId: req.params.id } } }
    );
    res.json({ success: true, message: 'Device access revoked.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to revoke device.' });
  }
};

// GET /api/user/referrals
exports.getReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user._id })
      .populate('referredUserId', 'name email createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      referralCode: req.user.referralCode,
      totalReferrals: req.user.totalReferrals,
      rewardDaysEarned: req.user.rewardDaysEarned,
      referrals,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch referrals.' });
  }
};

// GET /api/user/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

// PUT /api/user/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true }
      );
    }
    res.json({ success: true, message: 'Notification(s) marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

// PUT /api/user/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const preferences = { ...req.user.preferences, ...req.body };
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true }
    );
    res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update preferences.' });
  }
};
