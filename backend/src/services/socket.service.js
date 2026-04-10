const { Server: SocketServer } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ServerModel = require('../models/Server.model');
const { Connection } = require('../models/index');

let io;

const initSocket = (httpServer) => {
  io = new SocketServer(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true },
    pingTimeout: 60000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) { socket.user = null; return next(); }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name email plan role');
      socket.user = user;
      next();
    } catch { socket.user = null; next(); }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user._id}`);
      if (socket.user.role === 'admin') socket.join('admin');
    }
    socket.join('public');
    socket.on('subscribe:servers', () => socket.join('servers'));
    socket.on('subscribe:admin', () => { if (socket.user?.role === 'admin') socket.join('admin'); });
  });

  setInterval(async () => {
    try {
      const activeUsers = await Connection.countDocuments({ isActive: true });
      const totalServers = await ServerModel.countDocuments({ isOnline: true });
      io.to('public').emit('stats:update', { activeUsers: activeUsers + Math.floor(Math.random() * 50), totalServers, timestamp: Date.now() });
    } catch (err) { console.error('Stats broadcast error:', err); }
  }, 10000);

  return io;
};

const updateServerLoads = async () => {
  try {
    const servers = await ServerModel.find({ isOnline: true }).select('_id load').limit(20);
    const updates = servers.map(s => ({ id: s._id, load: Math.min(95, Math.max(5, s.load + Math.floor(Math.random() * 10 - 5))), ping: Math.floor(Math.random() * 100 + 10) }));
    if (io) io.to('servers').emit('servers:load-update', updates);
  } catch (err) { console.error('Server load update error:', err); }
};

const notifyUser = (userId, event, data) => { if (io) io.to(`user:${userId}`).emit(event, data); };
const broadcastToAdmin = (event, data) => { if (io) io.to('admin').emit(event, data); };
const getIO = () => io;

module.exports = { initSocket, updateServerLoads, notifyUser, broadcastToAdmin, getIO };
