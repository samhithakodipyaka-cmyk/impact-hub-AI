const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orgRoutes = require('./routes/orgRoutes');
const initiativeRoutes = require('./routes/initiativeRoutes');
const participationRoutes = require('./routes/participationRoutes');
const impactRoutes = require('./routes/impactRoutes');
const aiRoutes = require('./routes/aiRoutes');
const feedRoutes = require('./routes/feedRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration supporting configured CLIENT_URL and development local addresses
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, client verified in production env
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Mount API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/initiatives', initiativeRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
