const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
