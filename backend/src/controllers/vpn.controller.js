const QRCode = require('qrcode');
const { Connection } = require('../models/index');
const Server = require('../models/Server.model');
const User = require('../models/User.model');
const wireguardService = require('../services/wireguard.service');

// POST /api/vpn/connect
exports.connect = async (req, res) => {
  try {
    const { serverId } = req.body;

    if (!serverId) {
      return res.status(400).json({ success: false, message: 'Server ID required.' });
    }

    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Server not found.' });
    }

    if (!server.isOnline) {
      return res.status(503).json({ success: false, message: 'This server is currently offline.' });
    }

    // Check plan restrictions
    if (server.isPremium && req.user.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'This server requires a Pro or Business plan.',
        upgradeRequired: true,
      });
    }

    // Free plan data limit (10GB)
    if (req.user.plan === 'free' && req.user.dataUsedThisMonth >= 10 * 1024 * 1024 * 1024) {
      return res.status(403).json({
        success: false,
        message: 'Monthly data limit reached. Upgrade to Pro for unlimited data.',
        upgradeRequired: true,
      });
    }

    // Close existing active connections for user and calculate duration
    const activeConnections = await Connection.find({ userId: req.user._id, isActive: true });
    for (const conn of activeConnections) {
      conn.isActive = false;
      conn.disconnectedAt = new Date();
      conn.duration = Math.floor((new Date() - conn.connectedAt) / 1000);
      await conn.save();
      
      // Decrement the old server's connection count
      await Server.updateOne(
        { _id: conn.serverId },
        { $inc: { currentConnections: -1 } }
      );
    }

    // Create new connection
    const connection = await Connection.create({
      userId: req.user._id,
      serverId: server._id,
      clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      protocol: req.user.preferences.protocol || 'wireguard',
    });

    // Update server load
    await Server.updateOne(
      { _id: server._id },
      { $inc: { currentConnections: 1 } }
    );

    res.json({
      success: true,
      message: `Connected to ${server.city}, ${server.country}`,
      connection: {
        id: connection._id,
        server: {
          id: server._id,
          name: server.name,
          city: server.city,
          country: server.country,
          flag: server.flag,
          ip: server.ip,
          ping: server.ping,
        },
        connectedAt: connection.connectedAt,
        protocol: connection.protocol,
      },
    });
  } catch (err) {
    console.error('Connect error:', err);
    res.status(500).json({ success: false, message: 'Failed to connect to VPN.' });
  }
};

// POST /api/vpn/disconnect
exports.disconnect = async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      { userId: req.user._id, isActive: true },
      {
        isActive: false,
        disconnectedAt: new Date(),
      },
      { new: true }
    );

    if (!connection) {
      return res.status(400).json({ success: false, message: 'No active connection found.' });
    }

    // Calculate duration
    const duration = Math.floor((new Date() - connection.connectedAt) / 1000);
    connection.duration = duration;
    await connection.save();

    // Update server connections
    await Server.updateOne(
      { _id: connection.serverId },
      { $inc: { currentConnections: -1 } }
    );

    // Update user data usage (simulated)
    const dataUsed = Math.floor(Math.random() * 100 * 1024 * 1024); // random up to 100MB
    await User.updateOne(
      { _id: req.user._id },
      {
        $inc: {
          dataUsed: dataUsed,
          dataUsedThisMonth: dataUsed,
        },
      }
    );

    res.json({
      success: true,
      message: 'Disconnected successfully.',
      session: {
        duration,
        dataUsed,
        server: connection.serverId,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to disconnect.' });
  }
};

// GET /api/vpn/status
exports.getStatus = async (req, res) => {
  try {
    const connection = await Connection.findOne({
      userId: req.user._id,
      isActive: true,
    }).populate('serverId', 'name city country flag ip ping load');

    if (!connection) {
      return res.json({
        success: true,
        connected: false,
        connection: null,
      });
    }

    res.json({
      success: true,
      connected: true,
      connection: {
        id: connection._id,
        server: connection.serverId,
        connectedAt: connection.connectedAt,
        duration: Math.floor((new Date() - connection.connectedAt) / 1000),
        protocol: connection.protocol,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get VPN status.' });
  }
};

// GET /api/vpn/config/:serverId
exports.getConfig = async (req, res) => {
  try {
    const serverIdParam = req.params.serverId;
    let server = await Server.findById(serverIdParam);
    
    // FAULT TOLERANCE: In case the frontend accidentally passes the Connection ID 
    // instead of the Server ID, intercept it and find the associated Server.
    if (!server) {
      const connection = await Connection.findById(serverIdParam);
      if (connection) {
        console.log('[DEBUG] Intercepted Connection ID instead of Server ID. Resolving automatically...');
        server = await Server.findById(connection.serverId);
      }
    }

    console.log('[DEBUG] getConfig requested for:', serverIdParam);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Server not found.' });
    }

    if (server.isPremium && req.user.plan === 'free') {
      return res.status(403).json({ success: false, message: 'Premium server. Upgrade required.' });
    }

    const config = wireguardService.generateConfig(server, req.user);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="phantomvpn-${server.countryCode.toLowerCase()}.conf"`);
    res.send(config);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate config.' });
  }
};

// GET /api/vpn/qrcode/:serverId
exports.getQRCode = async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Server not found.' });
    }

    const config = wireguardService.generateConfig(server, req.user);
    const qrCode = await QRCode.toDataURL(config);

    res.json({ success: true, qrCode });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate QR code.' });
  }
};

// GET /api/vpn/connections/history
exports.getConnectionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const connections = await Connection.find({ userId: req.user._id })
      .populate('serverId', 'name city country flag countryCode')
      .sort({ connectedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Connection.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      connections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch connection history.' });
  }
};

// GET /api/vpn/usage
exports.getUsage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get weekly usage data
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const dailyUsage = await Connection.aggregate([
      {
        $match: {
          userId: req.user._id,
          connectedAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$connectedAt' },
          },
          totalData: { $sum: { $add: ['$dataUploaded', '$dataDownloaded'] } },
          totalDuration: { $sum: '$duration' },
          connections: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Plan limits
    const planLimits = {
      free: { dataGB: 10, devices: 1 },
      pro: { dataGB: Infinity, devices: 6 },
      business: { dataGB: Infinity, devices: 10 },
    };

    res.json({
      success: true,
      usage: {
        dataUsedThisMonth: user.dataUsedThisMonth,
        dataUsedTotal: user.dataUsed,
        dataLimitGB: planLimits[user.plan].dataGB,
        deviceLimit: planLimits[user.plan].devices,
        connectedDevices: user.devices?.length || 0,
        dailyUsage,
        resetDate: user.dataResetDate,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch usage.' });
  }
};
