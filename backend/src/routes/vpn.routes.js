const express = require('express');

// VPN Routes
const vpnRouter = express.Router();
const vpnController = require('../controllers/vpn.controller');
const { protect } = require('../middleware/auth');

vpnRouter.use(protect);
vpnRouter.post('/connect', vpnController.connect);
vpnRouter.post('/disconnect', vpnController.disconnect);
vpnRouter.get('/status', vpnController.getStatus);
vpnRouter.get('/config/:serverId', vpnController.getConfig);
vpnRouter.get('/qrcode/:serverId', vpnController.getQRCode);
vpnRouter.get('/connections/history', vpnController.getConnectionHistory);
vpnRouter.get('/usage', vpnController.getUsage);

module.exports = vpnRouter;
