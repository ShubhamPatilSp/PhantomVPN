const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Server = require('../models/Server.model');
const { Connection, BlogPost } = require('../models/index');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.use(protect, requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeConnections, totalServers, onlineServers] = await Promise.all([
      User.countDocuments(), Connection.countDocuments({ isActive: true }),
      Server.countDocuments(), Server.countDocuments({ isOnline: true }),
    ]);
    const planBreakdown = await User.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 } } }]);
    const signupsTrend = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const mrr = planBreakdown.reduce((a, p) => a + ({ free: 0, pro: 9.99, business: 19.99 }[p._id] || 0) * p.count, 0);
    res.json({ success: true, stats: { totalUsers, activeConnections, totalServers, onlineServers, mrr: mrr.toFixed(2), planBreakdown, signupsTrend } });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to fetch stats.' }); }
});

router.get('/users', async (req, res) => {
  try {
    const { search, plan, page = 1, limit = 20 } = req.query;
    const query = {};
    if (plan) query.plan = plan;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to fetch users.' }); }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to update user.' }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to delete user.' }); }
});

router.post('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: req.body.reason || 'ToS violation' }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to ban user.' }); }
});

router.get('/servers', async (req, res) => {
  try {
    const servers = await Server.find().sort({ country: 1 });
    res.json({ success: true, servers });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

router.post('/servers', async (req, res) => {
  try {
    const server = await Server.create(req.body);
    res.status(201).json({ success: true, server });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

router.put('/servers/:id', async (req, res) => {
  try {
    const server = await Server.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, server });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

router.delete('/servers/:id', async (req, res) => {
  try {
    await Server.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Server deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

router.get('/connections', async (req, res) => {
  try {
    const connections = await Connection.find().populate('userId', 'name email').populate('serverId', 'city country').sort({ connectedAt: -1 }).limit(100);
    res.json({ success: true, connections });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

router.post('/blog', async (req, res) => {
  try { const post = await BlogPost.create(req.body); res.status(201).json({ success: true, post }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

router.put('/blog/:id', async (req, res) => {
  try { const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, post }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

router.delete('/blog/:id', async (req, res) => {
  try { await BlogPost.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

const Settings = require('../models/Settings.model');

router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settings = await Settings.updateSettings(req.body);
    res.json({ success: true, message: 'Settings updated.', settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

module.exports = router;
