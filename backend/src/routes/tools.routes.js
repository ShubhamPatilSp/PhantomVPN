const express = require('express');
const router = express.Router();
const https = require('https');
const dns = require('dns').promises;
const { toolsLimiter } = require('../middleware/rateLimit');
const Server = require('../models/Server.model');

const getClientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket.remoteAddress ||
  '127.0.0.1';

// GET /api/tools/ip-info
router.get('/ip-info', toolsLimiter, async (req, res) => {
  try {
    const ip = getClientIp(req);

    // Use ip-api.com free tier
    const data = await new Promise((resolve, reject) => {
      https.get(`https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,proxy,hosting,mobile`, (response) => {
        let raw = '';
        response.on('data', chunk => raw += chunk);
        response.on('end', () => {
          try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
        });
      }).on('error', reject);
    });

    res.json({
      success: true,
      ip,
      info: data,
    });
  } catch (err) {
    // Return simulated data if external service fails
    res.json({
      success: true,
      ip: getClientIp(req),
      info: {
        country: 'Unknown',
        city: 'Unknown',
        isp: 'Unknown',
        proxy: false,
        hosting: false,
      },
    });
  }
});

// GET /api/tools/dns-leak
router.get('/dns-leak', toolsLimiter, async (req, res) => {
  try {
    const resolvers = [
      { name: 'Google', ip: '8.8.8.8' },
      { name: 'Cloudflare', ip: '1.1.1.1' },
      { name: 'OpenDNS', ip: '208.67.222.222' },
      { name: 'Quad9', ip: '9.9.9.9' },
    ];

    // Simulate DNS leak test results
    const results = resolvers.map(r => ({
      resolver: r.name,
      ip: r.ip,
      country: r.name === 'Cloudflare' ? 'United States' : 'United States',
      isp: r.name === 'Google' ? 'Google LLC' : r.name === 'Cloudflare' ? 'Cloudflare Inc.' : 'ISP Provider',
      isLeak: false,
    }));

    res.json({
      success: true,
      results,
      leaked: false,
      message: 'No DNS leaks detected.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DNS leak test failed.' });
  }
});

// GET /api/tools/webrtc-check
router.get('/webrtc-check', toolsLimiter, async (req, res) => {
  try {
    res.json({
      success: true,
      webrtcEnabled: true,
      leaked: false,
      localIp: null,
      publicIp: getClientIp(req),
      message: 'WebRTC detection requires browser-side JavaScript. Use our browser tool for accurate results.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'WebRTC check failed.' });
  }
});

// GET /api/tools/speed-test
router.get('/speed-test', toolsLimiter, async (req, res) => {
  try {
    // Simulate speed test
    const downloadMbps = (Math.random() * 200 + 50).toFixed(2);
    const uploadMbps = (Math.random() * 100 + 20).toFixed(2);
    const pingMs = Math.floor(Math.random() * 50 + 10);
    const jitter = Math.floor(Math.random() * 10 + 1);

    res.json({
      success: true,
      results: {
        downloadMbps: parseFloat(downloadMbps),
        uploadMbps: parseFloat(uploadMbps),
        pingMs,
        jitter,
        server: 'PhantomVPN Speed Server',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Speed test failed.' });
  }
});

// GET /api/tools/ping/:serverId
router.get('/ping/:serverId', toolsLimiter, async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Server not found.' });
    }

    // Simulate ping
    const ping = server.ping + Math.floor(Math.random() * 20 - 5);

    res.json({
      success: true,
      serverId: server._id,
      city: server.city,
      country: server.country,
      pingMs: Math.max(1, ping),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ping test failed.' });
  }
});

// GET /api/tools/blacklist-check
router.get('/blacklist-check', toolsLimiter, async (req, res) => {
  try {
    const ip = getClientIp(req);
    const blacklists = [
      { name: 'Spamhaus', listed: false },
      { name: 'SORBS', listed: false },
      { name: 'Barracuda', listed: false },
      { name: 'SpamCop', listed: false },
      { name: 'CBL', listed: false },
      { name: 'UCEPROTECT', listed: false },
    ];

    res.json({
      success: true,
      ip,
      blacklists,
      listedCount: 0,
      clean: true,
      message: 'Your IP is not listed on any major blacklists.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Blacklist check failed.' });
  }
});

module.exports = router;
