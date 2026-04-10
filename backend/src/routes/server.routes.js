const express = require('express');
const router = express.Router();
const Server = require('../models/Server.model');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

// GET /api/servers
router.get('/', apiLimiter, async (req, res) => {
  try {
    const {
      region,
      search,
      sortBy = 'ping',
      page = 1,
      limit = 100,
      p2p,
      streaming,
      tor,
    } = req.query;

    const query = {};
    if (region && region !== 'all') query.region = region;
    if (p2p === 'true') query.supportsP2P = true;
    if (streaming === 'true') query.supportsStreaming = true;
    if (tor === 'true') query.supportsTor = true;
    if (search) {
      query.$or = [
        { country: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      ping: { ping: 1 },
      load: { load: 1 },
      country: { country: 1 },
    };

    const servers = await Server.find(query)
      .sort(sortOptions[sortBy] || { ping: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Add simulated real-time data
    const enriched = servers.map(s => ({
      ...s,
      load: Math.floor(Math.random() * 70) + 10,
      ping: s.ping + Math.floor(Math.random() * 20 - 10),
    }));

    const total = await Server.countDocuments(query);

    res.json({
      success: true,
      servers: enriched,
      total,
      regions: ['all', 'americas', 'europe', 'asia', 'africa', 'oceania', 'middleeast'],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch servers.' });
  }
});

// GET /api/servers/:id
router.get('/:id', async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Server not found.' });
    }
    res.json({ success: true, server });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch server.' });
  }
});

module.exports = router;
