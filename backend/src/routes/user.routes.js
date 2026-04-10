const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const { validate, updateProfileSchema, changePasswordSchema } = require('../utils/validators');
const { upload, uploadToCloudinary, isCloudinaryConfigured } = require('../services/upload.service');

router.use(protect);
router.use(apiLimiter);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put('/password', validate(changePasswordSchema), userController.changePassword);
router.post('/avatar', userController.updateAvatar);

// Cloudinary avatar upload (form-data with 'avatar' field)
router.post('/avatar/upload', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    if (!isCloudinaryConfigured()) {
      return res.status(501).json({ success: false, message: 'Image upload is not configured. Use avatar URL instead.' });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'phantomvpn/avatars', `user-${req.user._id}`);
    const User = require('../models/User.model');
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
    res.json({ success: true, message: 'Avatar uploaded.', avatar: user.avatar });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload avatar.' });
  }
});

router.delete('/account', userController.deleteAccount);
router.get('/devices', userController.getDevices);
router.delete('/devices/:id', userController.revokeDevice);
router.get('/referrals', userController.getReferrals);
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:id/read', userController.markNotificationRead);
router.put('/preferences', userController.updatePreferences);

module.exports = router;
