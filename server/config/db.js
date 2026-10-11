const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

const connectDB = async () => {
  const uri = env.MONGODB_URI;

  try {
    // Attempt standard connection to the provided MongoDB URI (e.g. Atlas or local)
    // Short server selection timeout for local fallback detection in development
    const isLocalUri = uri.includes('localhost') || uri.includes('127.0.0.1');
    const serverSelectionTimeoutMS = isLocalUri && env.NODE_ENV !== 'production' ? 2500 : 10000;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS,
    });

    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host} / ${mongoose.connection.name}`);
    
    // Safely remove any rogue legacy index on 'id', 'userId', 'activityId' across all collections
    try {
      const legacyIndexes = ['id_1', 'userId_1', 'activityId_1', 'userId_1_activityId_1'];
      const cols = await mongoose.connection.db.listCollections().toArray();
      for (const col of cols) {
        for (const idxName of legacyIndexes) {
          try {
            await mongoose.connection.collection(col.name).dropIndex(idxName);
            console.log(`[MongoDB] Cleaned rogue index ${idxName} on ${col.name}`);
          } catch (dropErr) {
            // Index does not exist on this collection, ignore
          }
        }
      }
    } catch (colsErr) {
      // Ignore
    }

    return mongoose.connection;
  } catch (err) {
    console.warn(`[MongoDB] Initial connection failed (${err.message}).`);

    // In non-production environments, provide resilient in-memory MongoDB fallback
    if (env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Starting in-memory MongoDB server for local development/testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[MongoDB] In-memory database connected at: ${memUri}`);
        return mongoose.connection;
      } catch (memErr) {
        console.error('[MongoDB] In-memory server startup failed:', memErr.message);
        throw err;
      }
    }

    throw err;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
  }
};

const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionState,
};
