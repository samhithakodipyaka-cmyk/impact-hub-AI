const express = require('express');
const router = express.Router();
const { getConnectionState } = require('../config/db');

router.get('/', (req, res) => {
  const dbStatus = getConnectionState();
  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: {
      status: dbStatus,
      connected: isHealthy,
    },
    version: '1.0.0',
    service: 'ImpactHub-AI-API',
  });
});

module.exports = router;
