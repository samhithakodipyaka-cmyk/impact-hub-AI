const Notification = require('../models/Notification');

const createNotification = async ({ recipientId, title, message, type = 'system', link = '' }) => {
  try {
    if (!recipientId) return null;
    return await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      link,
    });
  } catch (err) {
    console.error('[Notification Error]: Failed to create notification:', err.message);
    return null;
  }
};

const notifyMany = async (recipientIds, { title, message, type = 'system', link = '' }) => {
  try {
    if (!recipientIds || !recipientIds.length) return [];
    const docs = recipientIds.map((id) => ({
      recipient: id,
      title,
      message,
      type,
      link,
    }));
    return await Notification.insertMany(docs);
  } catch (err) {
    console.error('[Notification Error]: Failed bulk notify:', err.message);
    return [];
  }
};

module.exports = {
  createNotification,
  notifyMany,
};
