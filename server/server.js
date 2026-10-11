const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { ensureAdminExists } = require('./scripts/seedAdmin');
const { seedInitialData } = require('./scripts/seedData');

const startServer = async () => {
  try {
    console.log('[Server] Connecting to database...');
    await connectDB();

    console.log('[Server] Checking platform administrator...');
    await ensureAdminExists();

    console.log('[Server] Checking authentic seed data...');
    await seedInitialData();

    const PORT = env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` ImpactHub AI Server Running on Port ${PORT}`);
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully terminating...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Connections closed. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server Startup Fatal Error]:', err);
    process.exit(1);
  }
};

startServer();
