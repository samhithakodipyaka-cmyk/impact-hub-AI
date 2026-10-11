const dotenv = require('dotenv');
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/impacthub',
  JWT_SECRET: process.env.JWT_SECRET || 'impacthub_default_dev_secret_change_in_production_key_32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@impacthub.ai').toLowerCase().trim(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@ImpactHub2026!',
};

module.exports = env;
