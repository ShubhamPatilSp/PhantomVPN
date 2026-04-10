const express = require('express');
const router = express.Router();
const { Plan } = require('../models/index');
const User = require('../models/User.model');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans.' });
  }
});

router.post('/subscribe', protect, async (req, res) => {
  try {
    const { planName, billing } = req.body;
    const validPlans = ['free', 'pro', 'business'];
    if (!validPlans.includes(planName)) return res.status(400).json({ success: false, message: 'Invalid plan.' });
    const expiry = new Date();
    if (billing === 'yearly') expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1);
    await User.findByIdAndUpdate(req.user._id, { plan: planName, planExpiry: planName === 'free' ? null : expiry });
    res.json({ success: true, message: `Subscribed to ${planName} plan.`, expiry });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to subscribe.' });
  }
});

router.post('/cancel', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { plan: 'free', planExpiry: null });
    res.json({ success: true, message: 'Subscription cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel.' });
  }
});

module.exports = router;
