require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cron = require('node-cron');
const passport = require('passport');
const { sanitizeMiddleware } = require('./src/utils/sanitize');
const { setupGoogleOAuth } = require('./src/config/passport');

const { initSocket } = require('./src/services/socket.service');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const vpnRoutes = require('./src/routes/vpn.routes');
const serverRoutes = require('./src/routes/server.routes');
const toolsRoutes = require('./src/routes/tools.routes');
const blogRoutes = require('./src/routes/blog.routes');
const planRoutes = require('./src/routes/plan.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS Sanitization — cleans all incoming req.body/query/params
app.use(sanitizeMiddleware);

// Passport (Google OAuth)
app.use(passport.initialize());
setupGoogleOAuth();

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vpn', vpnRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Database connection
const connectDB = async () => {
  let isMemoryDB = false;
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ No MONGODB_URI found! Starting in-memory MongoDB server for testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      process.env.MONGODB_URI = mongoServer.getUri();
      isMemoryDB = true;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 PhantomVPN server running on port ${PORT}`);
      if (isMemoryDB) {
        console.log('🌱 Starting in-memory db seed script...');
        const { exec } = require('child_process');
        exec('node src/seed/index.js', { env: { ...process.env, MONGODB_URI: process.env.MONGODB_URI } }, (error, stdout, stderr) => {
          if (!error) console.log('✅ In-memory database seeded successfully!');
          else console.error('Error seeding data:', error, stderr);
        });
      }
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};
connectDB();

// Cron jobs
cron.schedule('*/30 * * * * *', async () => {
  // Update server loads every 30 seconds
  const { updateServerLoads } = require('./src/services/socket.service');
  updateServerLoads();
});

cron.schedule('0 0 * * *', async () => {
  // Daily cleanup tasks
  console.log('Running daily cleanup...');
});

module.exports = { app, server };
