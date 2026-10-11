const User = require('../models/User');
const env = require('../config/env');

const ensureAdminExists = async () => {
  try {
    const adminEmail = env.ADMIN_EMAIL;
    const existing = await User.findOne({ email: adminEmail });

    if (!existing) {
      console.log(`[Seed Admin] Initializing platform administrator: ${adminEmail}`);
      const admin = new User({
        name: 'ImpactHub Administrator',
        email: adminEmail,
        password: env.ADMIN_PASSWORD,
        role: 'admin',
        bio: 'Official platform administrator account responsible for verification, governance, and trust oversight.',
        location: { city: 'Bengaluru', country: 'India' },
        status: 'active',
      });
      await admin.save();
      console.log('[Seed Admin] Administrator initialized successfully.');
      return admin;
    } else {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        existing.status = 'active';
        await existing.save();
        console.log(`[Seed Admin] User ${adminEmail} role upgraded to admin.`);
      }
      return existing;
    }
  } catch (err) {
    console.error('[Seed Admin Error]:', err.message);
  }
};

// If run directly from CLI
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    try {
      await connectDB();
      await ensureAdminExists();
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

module.exports = {
  ensureAdminExists,
};
