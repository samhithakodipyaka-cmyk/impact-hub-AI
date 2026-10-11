const AuditLog = require('../models/AuditLog');

const logAudit = async ({ adminId, action, targetType, targetId = null, details = {}, ipAddress = '' }) => {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog Error]: Failed to record audit entry:', err.message);
  }
};

module.exports = {
  logAudit,
};
